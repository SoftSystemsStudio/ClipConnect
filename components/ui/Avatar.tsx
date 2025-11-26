export default function Avatar({ src, alt, size = 8 }: { src?: string, alt?: string, size?: number }) {
  const s = `${size * 0.25}rem` // convert tailwind-like size to rem approximation
  return (
    <img src={src || '/placeholder.png'} alt={alt || 'avatar'} style={{ width: `${size}rem`, height: `${size}rem` }} className="rounded-full object-cover" />
  )
}
