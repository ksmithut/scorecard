import React from 'react'

/**
 * @param {(data: Record<string, string>, form: HTMLFormElement) => void} handleSubmit
 */
export default function useSubmit (handleSubmit) {
  return React.useCallback(
    /**
     * @param {React.FormEvent<HTMLFormElement>} e
     */
    e => {
      e.preventDefault()
      /** @type {HTMLFormElement} */
      // @ts-ignore
      const form = e.target
      const formData = new FormData(form)
      /** @type {Record<string, string>} */
      const data = {}
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') data[key] = value
      }
      handleSubmit(data, form)
    },
    []
  )
}
