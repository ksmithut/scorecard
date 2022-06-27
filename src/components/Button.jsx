import React from 'react'
import clsx from 'clsx'

/**
 * @param {React.PropsWithChildren<React.ButtonHTMLAttributes>} props
 */
export default function Button ({ className, disabled, children, ...props }) {
  return (
    <button
      {...props}
      className={clsx(
        className,
        'px-3 py-1 bg-teal-700 text-white rounded',
        disabled && 'text-gray-300 bg-gray-400 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  )
}
