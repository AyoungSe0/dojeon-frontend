import type { CSSProperties } from 'react'
import './ThemedIcon.css'

interface ThemedIconProps {
  src: string
  className?: string
}

function ThemedIcon({ src, className = '' }: ThemedIconProps) {
  const maskStyle = {
    '--themed-icon-url': `url("${src}")`,
  } as CSSProperties

  return (
    <span
      className={`themed-icon ${className}`.trim()}
      style={maskStyle}
      aria-hidden="true"
    />
  )
}

export default ThemedIcon
