export default function Badge({ children, className = '', variant = 'default' }) {
  const base = 'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium';
  const variants = {
    default: 'bg-gray-200 text-gray-900',
    secondary: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-700',
  };
  return <span className={`${base} ${variants[variant] || variants.default} ${className}`}>{children}</span>;
}
