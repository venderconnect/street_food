export default function Badge({ children, className = '', variant = 'default' }) {
  const base = 'inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold smooth';
  const variants = {
    default: 'bg-muted-100 text-gray-800',
    secondary: 'bg-primary-100 text-primary-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-700',
  };
  return <span className={`${base} ${variants[variant] || variants.default} ${className}`}>{children}</span>;
}
