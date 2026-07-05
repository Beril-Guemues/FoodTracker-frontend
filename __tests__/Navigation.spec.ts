import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import Navigation from '../src/components/Navigation.vue'

// ===== ROUTER MOCK =====
const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// ===== ROUTER-LINK STUB (behält Slot-Inhalt) =====
const RouterLinkStub = {
  template: '<a><slot /></a>',
}

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

describe('Navigation.vue', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new LocalStorageMock())
    mockPush.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the brand name and all navigation links', () => {
    const wrapper = shallowMount(Navigation, {
      global: {
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    expect(wrapper.text()).toContain('FoodTracker')
    expect(wrapper.text()).toContain('Lebensmittel')
    expect(wrapper.text()).toContain('Mahlzeiten')
    expect(wrapper.text()).toContain('Profil')
    expect(wrapper.text()).toContain('Ziel')
    expect(wrapper.text()).toContain('Nährwerte')
    expect(wrapper.text()).toContain('Fortschritt')
  })

  it('renders a logout button', () => {
    const wrapper = shallowMount(Navigation, {
      global: {
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    expect(wrapper.find('.btn-logout').exists()).toBe(true)
    expect(wrapper.find('.btn-logout').text()).toBe('Abmelden')
  })

  it('clears localStorage and redirects to /login on logout', async () => {
    const wrapper = shallowMount(Navigation, {
      global: {
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    localStorage.setItem('user', JSON.stringify({ id: 1 }))
    localStorage.setItem('userId', '1')

    await wrapper.find('.btn-logout').trigger('click')
    await flushPromises()

    expect(localStorage.getItem('user')).toBeNull()
    expect(localStorage.getItem('userId')).toBeNull()
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})
