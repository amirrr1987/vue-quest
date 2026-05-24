import { describe, expect, it, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useProgressStore } from '@/stores/progress.store'

describe('useProgressStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('adds and removes wrong question ids per section', () => {
    const store = useProgressStore()
    store.addWrong('vue', 'reactivity', 'vue-01')
    expect(store.getWrongIds('vue', 'reactivity')).toEqual(['vue-01'])

    store.addWrong('vue', 'reactivity', 'vue-01')
    expect(store.getWrongIds('vue', 'reactivity')).toHaveLength(1)

    store.removeWrong('vue', 'reactivity', 'vue-01')
    expect(store.getWrongIds('vue', 'reactivity')).toEqual([])
  })

  it('records answer and clears wrong on correct', () => {
    const store = useProgressStore()
    store.addWrong('pinia', 'store-basics', 'pinia-01')
    store.recordAnswer('pinia', 'store-basics', 'pinia-01', true)
    expect(store.getWrongIds('pinia', 'store-basics')).toEqual([])
  })

  it('adds wrong on incorrect answer', () => {
    const store = useProgressStore()
    store.recordAnswer('vue', 'reactivity', 'vue-02', false)
    expect(store.getWrongIds('vue', 'reactivity')).toContain('vue-02')
  })

  it('tracks unique answered questions', () => {
    const store = useProgressStore()
    store.recordAnswer('vue', 'reactivity', 'vue-01', true)
    store.recordAnswer('vue', 'reactivity', 'vue-01', true)
    expect(store.getAnsweredCount('vue', 'reactivity')).toBe(1)
  })

  it('resets section progress', () => {
    const store = useProgressStore()
    store.recordAnswer('pinia', 'store-basics', 'pinia-01', false)
    store.resetSection('pinia', 'store-basics')
    expect(store.getWrongIds('pinia', 'store-basics')).toEqual([])
    expect(store.getAnsweredCount('pinia', 'store-basics')).toBe(0)
  })
})
