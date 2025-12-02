interface PlayIconProps {
  size?: number
  color?: string
  className?: string
}

export default function PlayIcon({ size = 16, color = 'currentColor', className = '' }: PlayIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
    >
      <path d="M8 5v14l11-7z"/>
    </svg>
  )
}
