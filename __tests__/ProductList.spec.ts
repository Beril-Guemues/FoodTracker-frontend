import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ProductList from '@/components/lists/ProductList.vue'

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

describe('ProductList.vue', () => {
  beforeEach(() => {
    mockGet.mockReset()
    mockPost.mockReset()
    mockDelete.mockReset()
    // Standard-Antwort für loadEntriesForDate beim Mounten
    mockGet.mockResolvedValue({ data: [] })
  })

  it('rendert die Überschrift korrekt', async () => {
    const wrapper = mount(ProductList)
    await flushPromises()
    expect(wrapper.find('h2').text()).toBe('Lebensmittel suchen')
  })

  it('zeigt "Noch keine Einträge für heute", wenn keine Einträge vorhanden sind', async () => {
    const wrapper = mount(ProductList)
    await flushPromises()
    expect(wrapper.text()).toContain('Noch keine Einträge für heute.')
  })

  it('zeigt Suchergebnisse von OpenFoodFacts an', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/api/proxy/openfoodfacts') {
        return Promise.resolve({
          data: {
            products: [
              {
                code: '123',
                product_name: 'Banane',
                nutriments: {
                  'energy-kcal_100g': 89,
                  proteins_100g: 1.1,
                  carbohydrates_100g: 23,
                },
              },
            ],
          },
        })
      }
      return Promise.resolve({ data: [] })
    })

    const wrapper = mount(ProductList)
    await flushPromises()

    const input = wrapper.find('.search-group input')
    await input.setValue('Banane')
    await input.trigger('input')
    await flushPromises()

    expect(wrapper.text()).toContain('Banane')
    expect(wrapper.text()).toContain('89 kcal / 100g')
  })

  it('zeigt "Kein Produkt gefunden", wenn die Suche leer bleibt', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/api/proxy/openfoodfacts') {
        return Promise.resolve({ data: { products: [] } })
      }
      return Promise.resolve({ data: [] })
    })

    const wrapper = mount(ProductList)
    await flushPromises()

    const input = wrapper.find('.search-group input')
    await input.setValue('xyzabc123')
    await input.trigger('input')
    await flushPromises()

    expect(wrapper.text()).toContain('Kein Produkt gefunden.')
  })

  it('wählt ein Produkt aus der Suche aus und zeigt das Eingabeformular', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/api/proxy/openfoodfacts') {
        return Promise.resolve({
          data: {
            products: [
              {
                code: '123',
                product_name: 'Apfel',
                nutriments: {
                  'energy-kcal_100g': 52,
                  proteins_100g: 0.3,
                  carbohydrates_100g: 14,
                },
              },
            ],
          },
        })
      }
      return Promise.resolve({ data: [] })
    })

    const wrapper = mount(ProductList)
    await flushPromises()

    const input = wrapper.find('.search-group input')
    await input.setValue('Apfel')
    await input.trigger('input')
    await flushPromises()

    await wrapper.find('.result-item').trigger('click')

    expect(wrapper.find('.selected-product').exists()).toBe(true)
    expect(wrapper.find('.selected-product .product-name').text()).toBe('Apfel')
  })

  it('speichert einen Eintrag erfolgreich', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/api/proxy/openfoodfacts') {
        return Promise.resolve({
          data: {
            products: [
              {
                code: '123',
                product_name: 'Apfel',
                nutriments: {
                  'energy-kcal_100g': 52,
                  proteins_100g: 0.3,
                  carbohydrates_100g: 14,
                },
              },
            ],
          },
        })
      }
      return Promise.resolve({ data: [] })
    })
    mockPost.mockResolvedValueOnce({
      data: { id: 1, name: 'Apfel', calories: 52, protein: 0.3, carbs: 14 },
    })
    mockPost.mockResolvedValueOnce({ data: { id: 1 } })

    const wrapper = mount(ProductList)
    await flushPromises()

    const input = wrapper.find('.search-group input')
    await input.setValue('Apfel')
    await input.trigger('input')
    await flushPromises()

    await wrapper.find('.result-item').trigger('click')
    await wrapper.find('input[type="number"]').setValue(150)

    await wrapper.find('.btn-track').trigger('click')
    await flushPromises()

    expect(mockPost).toHaveBeenCalledWith('/products', expect.objectContaining({ name: 'Apfel' }))
    expect(wrapper.find('.success').text()).toContain('erfolgreich gespeichert')
  })
})
