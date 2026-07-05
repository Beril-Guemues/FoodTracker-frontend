import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import NutritionSummary from '@/components/charts/NutritionSummary.vue'

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

// Hilfsfunktion zum Mounten mit gestubbtem router-link
function mountComponent() {
  return mount(NutritionSummary, {
    global: {
      stubs: { RouterLink: true },
    },
  })
}

describe('NutritionSummary.vue', () => {
  beforeEach(() => {
    mockGet.mockReset()
    localStorageMock.clear()
  })

  it('zeigt einen Hinweis, wenn kein Profil vorhanden ist', async () => {
    const wrapper = mountComponent()
    await flushPromises()
    expect(wrapper.text()).toContain('Bitte erstelle zuerst dein Profil.')
  })

  it('zeigt einen Hinweis, wenn ein Profil aber kein Ziel vorhanden ist', async () => {
    localStorageMock.setItem('userProfileId', '5')
    mockGet.mockResolvedValueOnce({
      data: { weight: 70, height: 175, age: 25, gender: 'male' },
    })

    const wrapper = mountComponent()
    await flushPromises()

    expect(wrapper.text()).toContain('Bitte lege zuerst dein Ziel fest.')
  })

  it('berechnet und zeigt die Nährwerte korrekt, wenn Profil und Ziel vorhanden sind', async () => {
    localStorageMock.setItem('userProfileId', '5')
    localStorageMock.setItem(
      'userGoal',
      JSON.stringify({ mainGoal: 'lose', tempo: 'moderate', targetWeight: 65, buildMuscle: false }),
    )
    mockGet.mockResolvedValueOnce({
      data: { weight: 70, height: 175, age: 25, gender: 'male' },
    })

    const wrapper = mountComponent()
    await flushPromises()

    // BMR: 10*70 + 6.25*175 - 5*25 + 5 = 700+1093.75-125+5=1673.75 * 1.2 = 2008.5 → 2009 (baseCalorieNeed)
    // Anpassung: weightDiff = 65-70 = -5, tempoFactor moderate=1.0, totalDeficit=5*50*1=250, adjustment negativ da "lose": -250
    // calorieNeed = max(2009-250, 1200) = 1759
    expect(wrapper.find('.nutrition-card .value').text()).toBe('1759')
    expect(wrapper.text()).toContain('kg')
    expect(wrapper.text()).toContain('65') // Ziel-Gewicht wird angezeigt
  })

  it('zeigt eine Fehlermeldung, wenn kein Profil im localStorage existiert', async () => {
    const wrapper = mountComponent()
    await flushPromises()
    expect(wrapper.find('.error-message').text()).toContain('Kein Profil gefunden')
  })
})
