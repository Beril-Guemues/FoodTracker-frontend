import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ProgressChart from '@/components/charts/ProgressChart.vue'

class LocalStorageMock {
  store: Record<string, string> = {}
  clear() {
    this.store = {}
  }
  getItem(key: string) {
    return this.store[key] ?? null
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value)
  }
  removeItem(key: string) {
    delete this.store[key]
  }
}

const localStorageMock = new LocalStorageMock()
vi.stubGlobal('localStorage', localStorageMock)

const mockGet = vi.fn()

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
    })),
  },
}))

// Chart.js mocken: echte Klasse statt Arrow-Function, damit "new Chart(...)" funktioniert
vi.mock('chart.js', () => {
  class ChartMock {
    static register = vi.fn()
    destroy = vi.fn()
    constructor(..._args: unknown[]) {}
  }
  return {
    Chart: ChartMock,
    registerables: [],
  }
})

function mountComponent() {
  return mount(ProgressChart, {
    global: {
      stubs: { RouterLink: true },
    },
  })
}

describe('ProgressChart.vue', () => {
  beforeEach(() => {
    mockGet.mockReset()
    localStorageMock.clear()
    mockGet.mockResolvedValue({ data: [] })
  })

  it('zeigt einen Hinweis, wenn kein Profil vorhanden ist', async () => {
    const wrapper = mountComponent()
    await flushPromises()
    expect(wrapper.text()).toContain('Bitte erstelle zuerst dein Profil.')
  })

  it('zeigt einen Hinweis, wenn ein Profil aber kein Ziel vorhanden ist', async () => {
    localStorageMock.setItem('userProfileId', '5')
    mockGet.mockImplementation((url: string) => {
      if (url === '/profiles/5') {
        return Promise.resolve({ data: { weight: 70, height: 175, age: 25, gender: 'male' } })
      }
      return Promise.resolve({ data: [] })
    })

    const wrapper = mountComponent()
    await flushPromises()

    expect(wrapper.text()).toContain('Bitte lege zuerst dein Ziel fest.')
  })

  it('zeigt einen Hinweis, wenn noch keine Mahlzeiten getrackt wurden', async () => {
    localStorageMock.setItem('userProfileId', '5')
    localStorageMock.setItem(
      'userGoal',
      JSON.stringify({ mainGoal: 'lose', tempo: 'moderate', targetWeight: 65 }),
    )
    mockGet.mockImplementation((url: string) => {
      if (url === '/profiles/5') {
        return Promise.resolve({ data: { weight: 70, height: 175, age: 25, gender: 'male' } })
      }
      if (url === '/foodentries') {
        return Promise.resolve({ data: [] })
      }
      return Promise.resolve({ data: [] })
    })

    const wrapper = mountComponent()
    await flushPromises()

    expect(wrapper.text()).toContain('Noch keine Mahlzeiten getrackt.')
  })

  it('zeigt die Zusammenfassung, wenn Profil, Ziel und Einträge vorhanden sind', async () => {
    localStorageMock.setItem('userProfileId', '5')
    localStorageMock.setItem(
      'userGoal',
      JSON.stringify({ mainGoal: 'lose', tempo: 'moderate', targetWeight: 65 }),
    )

    const todayDate = new Date().toISOString().split('T')[0]

    mockGet.mockImplementation((url: string) => {
      if (url === '/profiles/5') {
        return Promise.resolve({ data: { weight: 70, height: 175, age: 25, gender: 'male' } })
      }
      if (url === '/foodentries') {
        return Promise.resolve({
          data: [
            {
              id: 1,
              product: { id: 1, name: 'Testsuppe', calories: 100, protein: 5, carbs: 10 },
              amount: 200,
              date: todayDate,
            },
          ],
        })
      }
      return Promise.resolve({ data: [] })
    })

    const wrapper = mountComponent()
    await flushPromises()

    expect(wrapper.find('.summary').exists()).toBe(true)
    expect(wrapper.text()).toContain('200')
  })
})
