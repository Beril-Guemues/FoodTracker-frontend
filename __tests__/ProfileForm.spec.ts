import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ProfileForm from '@/components/form/ProfileForm.vue'

// Eigener localStorage-Mock, da Node 22+ mit jsdom kollidiert
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

describe('ProfileForm.vue', () => {
  beforeEach(() => {
    mockGet.mockReset()
    mockPost.mockReset()
    mockPush.mockReset()
    localStorageMock.clear()
  })

  it('rendert das Formular korrekt', async () => {
    const wrapper = mount(ProfileForm)
    await flushPromises()
    expect(wrapper.find('.page-title').text()).toBe('Profil einrichten')
    expect(wrapper.find('input[type="number"]').exists()).toBe(true)
  })

  it('lädt kein Profil, wenn keine userProfileId im localStorage steht', async () => {
    const wrapper = mount(ProfileForm)
    await flushPromises()
    expect(mockGet).not.toHaveBeenCalled()
  })

  it('lädt ein vorhandenes Profil, wenn eine userProfileId im localStorage steht', async () => {
    localStorageMock.setItem('userProfileId', '5')
    mockGet.mockResolvedValueOnce({
      data: { weight: 70, height: 175, age: 25, gender: 'male' },
    })

    const wrapper = mount(ProfileForm)
    await flushPromises()

    expect(mockGet).toHaveBeenCalledWith('/profiles/5')
    const weightInput = wrapper.find('input[type="number"]')
    expect((weightInput.element as HTMLInputElement).value).toBe('70')
  })

  it('zeigt eine Fehlermeldung, wenn Pflichtfelder fehlen', async () => {
    const wrapper = mount(ProfileForm)
    await flushPromises()

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.find('.error-message').text()).toContain('alle Felder ausfüllen')
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('speichert das Profil erfolgreich und leitet danach weiter', async () => {
    mockPost.mockResolvedValueOnce({
      data: { id: 1, weight: 70, height: 175, age: 25, gender: 'male' },
    })

    const wrapper = mount(ProfileForm)
    await flushPromises()

    const inputs = wrapper.findAll('input[type="number"]')
    await inputs[0]!.setValue(70)
    await inputs[1]!.setValue(175)
    await inputs[2]!.setValue(25)
    await wrapper.find('select').setValue('male')

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(mockPost).toHaveBeenCalledWith('/profiles', {
      weight: 70,
      height: 175,
      age: 25,
      gender: 'male',
    })
    expect(wrapper.find('.success').text()).toContain('erfolgreich gespeichert')
    expect(localStorageMock.getItem('userProfileId')).toBe('1')
  })
})
