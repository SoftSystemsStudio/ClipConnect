type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }

export default function Button({ variant = 'primary', className = '', ...props }: Props) {
  const base = 'px-3 py-1 rounded-md text-sm font-medium'
  const styles = variant === 'primary' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-transparent text-gray-700 hover:bg-gray-100'
  return <button className={`${base} ${styles} ${className}`} {...props} />
}
