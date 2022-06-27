/**
 * @template T
 * @param {string} key
 * @param {() => T} getDefault
 */
export function createStorage (key, getDefault) {
  return {
    get () {
      try {
        const rawData = localStorage.getItem(key)
        if (rawData == null) return getDefault()
        return JSON.parse(rawData)
      } catch {
        return getDefault()
      }
    },
    /**
     * @param {T} data
     */
    set (data) {
      try {
        localStorage.setItem(key, JSON.stringify(data))
      } catch {}
    },
    clear () {
      try {
        localStorage.removeItem(key)
      } catch {}
    }
  }
}
