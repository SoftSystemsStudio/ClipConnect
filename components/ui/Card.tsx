export default function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white border rounded-md shadow-sm p-4 ${className}`}>
      {children}
    </div>
  )
}
