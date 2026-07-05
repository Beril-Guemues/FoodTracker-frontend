import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import LoginView from '../src/components/LoginView.vue'

// ===== ROUTER MOCK =====
const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// ===== LOCALSTORAGE MOCK =====
class LocalStorageMock {
  private store: Record<string, string> = {}

  getItem(key: string) {
    return this.store[key] ?? null
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value)
  }

  removeItem(key: string) {
    delete this.store[key]
  }

  clear() {
    this.store = {}
  }
}

describe('LoginView.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('localStorage', new LocalStorageMock())
    mockPush.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('renders the login form with prefilled demo credentials', () => {
    const wrapper = shallowMount(LoginView)

    expect(wrapper.text()).toContain('Willkommen zurück')

    const emailInput = wrapper.find('input#email')
    const passwordInput = wrapper.find('input#password')

    expect(emailInput.exists()).toBe(true)
    expect(passwordInput.exists()).toBe(true)
    expect((emailInput.element as HTMLInputElement).value).toBe('benutzer@foodtracker.de')
    expect((passwordInput.element as HTMLInputElement).value).toBe('123456')
  })

  it('shows an error message on wrong credentials', async () => {
    const wrapper = shallowMount(LoginView)

    await wrapper.find('input#email').setValue('falsch@test.de')
    await wrapper.find('input#password').setValue('falschesPasswort')
    await wrapper.find('form').trigger('submit.prevent')

    await vi.advanceTimersByTimeAsync(500)
    await flushPromises()

    expect(wrapper.text()).toContain('Falsche E-Mail oder Passwort')
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('navigates to home on correct (prefilled) credentials', async () => {
    const wrapper = shallowMount(LoginView)

    await wrapper.find('form').trigger('submit.prevent')

    await vi.advanceTimersByTimeAsync(500)
    await flushPromises()

    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('disables the submit button while loading', async () => {
    const wrapper = shallowMount(LoginView)

    const submitPromise = wrapper.find('form').trigger('submit.prevent')
    await Promise.resolve()

    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    expect(wrapper.find('button').text()).toBe('Wird angemeldet...')

    await vi.advanceTimersByTimeAsync(500)
    await submitPromise
    await flushPromises()
  })
})
