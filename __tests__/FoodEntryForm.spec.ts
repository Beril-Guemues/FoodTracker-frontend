import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import FoodEntryForm from '@/components/form/FoodEntryForm.vue'
import axios from 'axios'

// Mock für axios.create(), da die Komponente eine eigene axios-Instanz erstellt
const mockGet = vi.fn()
const mockPost = vi.fn()
const mockDelete = vi.fn()

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      post: mockPost,
      delete: mockDelete,
    })),
  },
}))

describe('FoodEntryForm.vue', () => {
  beforeEach(() => {
    mockGet.mockReset()
    mockPost.mockReset()
    mockDelete.mockReset()
    // Standard-Antwort für beide GET-Aufrufe beim Mounten (Produkte + Einträge)
    mockGet.mockResolvedValue({ data: [] })
  })

  it('rendert die Überschrift korrekt', async () => {
    const wrapper = mount(FoodEntryForm)
    await flushPromises()
    expect(wrapper.find('h2').text()).toBe('Mahlzeit eintragen')
  })

  it('zeigt "Noch keine Einträge für heute" wenn keine Einträge vorhanden sind', async () => {
    const wrapper = mount(FoodEntryForm)
    await flushPromises()
    expect(wrapper.text()).toContain('Noch keine Einträge für heute.')
  })

  it('zeigt heutige Einträge, wenn das Backend welche liefert', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/foodentries/date') {
        return Promise.resolve({
          data: [
            {
              id: 1,
              product: { id: 1, name: 'Testsuppe', calories: 100, protein: 5, carbs: 10 },
              amount: 200,
              date: '2026-07-05',
            },
          ],
        })
      }
      return Promise.resolve({ data: [] })
    })

    const wrapper = mount(FoodEntryForm)
    await flushPromises()

    expect(wrapper.text()).toContain('Testsuppe')
    // 200g bei 100 kcal/100g => 200 kcal
    expect(wrapper.text()).toContain('200 kcal')
  })

  it('öffnet und schließt das Formular zum Anlegen einer neuen Mahlzeit', async () => {
    const wrapper = mount(FoodEntryForm)
    await flushPromises()

    expect(wrapper.find('.create-form').exists()).toBe(false)

    await wrapper.find('.btn-toggle-create').trigger('click')
    expect(wrapper.find('.create-form').exists()).toBe(true)

    await wrapper.find('.btn-toggle-create').trigger('click')
    expect(wrapper.find('.create-form').exists()).toBe(false)
  })

  it('filtert die Produktsuche korrekt', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/products') {
        return Promise.resolve({
          data: [
            { id: 1, name: 'Tomatensuppe', calories: 50, protein: 1, carbs: 5 },
            { id: 2, name: 'Apfel', calories: 52, protein: 0, carbs: 14 },
          ],
        })
      }
      return Promise.resolve({ data: [] })
    })

    const wrapper = mount(FoodEntryForm)
    await flushPromises()

    const searchInput = wrapper.find('.search-group input')
    await searchInput.setValue('Tomat')
    await searchInput.trigger('input')

    expect(wrapper.text()).toContain('Tomatensuppe')
    expect(wrapper.text()).not.toContain('Apfel')
  })
})
