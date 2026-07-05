import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import GoalForm from '@/components/form/GoalForm.vue'

// Eigener localStorage-Mock (gleiches Muster wie bei ProfileForm)
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
const mockPost = vi.fn()

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      post: mockPost,
    })),
  },
}))

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('GoalForm.vue', () => {
  beforeEach(() => {
    mockGet.mockReset()
    mockPost.mockReset()
    mockPush.mockReset()
    localStorageMock.clear()
    mockGet.mockResolvedValue({ data: [] })
  })

  it('rendert die Überschrift und Optionen korrekt', async () => {
    const wrapper = mount(GoalForm)
    await flushPromises()
    expect(wrapper.find('h2').text()).toBe('Dein Ziel')
    expect(wrapper.text()).toContain('Abnehmen')
    expect(wrapper.text()).toContain('Zunehmen')
  })

  it('der Button ist standardmäßig deaktiviert', async () => {
    const wrapper = mount(GoalForm)
    await flushPromises()
    const button = wrapper.find('button[type="submit"]')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('zeigt eine Fehlermeldung, wenn kein Hauptziel gewählt wurde', async () => {
    const wrapper = mount(GoalForm)
    await flushPromises()

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.find('.error-message').text()).toContain('Abnehmen oder Zunehmen')
  })

  it('markiert eine Option als aktiv, wenn sie angeklickt wird', async () => {
    const wrapper = mount(GoalForm)
    await flushPromises()

    const options = wrapper.findAll('.option-card')
    await options[0]!.trigger('click') // "Abnehmen"

    expect(options[0]!.classes()).toContain('active')
  })

  it('zeigt eine Fehlermeldung, wenn kein Profil im localStorage existiert', async () => {
    const wrapper = mount(GoalForm)
    await flushPromises()

    const mainGoalCard = wrapper.findAll('.option-card')[0]!
    await mainGoalCard.trigger('click') // Abnehmen

    await wrapper.find('input[type="number"]').setValue(65)

    const muscleCards = wrapper.findAll('.option-card')
    await muscleCards[3]!.trigger('click') // "Nein" bei Muskeln

    const tempoCard = wrapper.findAll('.tempo-card')[0]!
    await tempoCard.trigger('click') // Langsam

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.error-message').text()).toContain('Bitte lege zuerst dein Profil an')
  })

  it('speichert das Ziel erfolgreich, wenn ein Profil existiert', async () => {
    localStorageMock.setItem('userProfileId', '5')
    mockGet.mockImplementation((url: string) => {
      if (url === '/profiles/5') {
        return Promise.resolve({ data: { id: 5, weight: 80 } })
      }
      return Promise.resolve({ data: [] })
    })
    mockPost.mockResolvedValueOnce({ data: { id: 1 } })

    const wrapper = mount(GoalForm)
    await flushPromises()

    const mainGoalCard = wrapper.findAll('.option-card')[0]!
    await mainGoalCard.trigger('click') // Abnehmen

    await wrapper.find('input[type="number"]').setValue(65)

    const muscleCards = wrapper.findAll('.option-card')
    await muscleCards[3]!.trigger('click') // "Nein"

    const tempoCard = wrapper.findAll('.tempo-card')[0]!
    await tempoCard.trigger('click') // Langsam

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(mockPost).toHaveBeenCalledWith('/goals', expect.objectContaining({ type: 'abnehmen' }))
    expect(wrapper.find('.success').text()).toContain('erfolgreich gespeichert')
  })
})
