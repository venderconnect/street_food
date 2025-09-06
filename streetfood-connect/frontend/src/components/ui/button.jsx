/* Minimal button primitive; replace with shadcn/ui Button when added */
export default function Button({ as: As = 'button', className = '', variant = 'primary', children, ...props }) {
  const base = 'inline-flex items-center justify-center rounded-md text-sm font-semibold focus:outline-none disabled:opacity-50 disabled:pointer-events-none smooth';
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm',
  secondary: 'bg-white text-gray-900 border border-gray-200 hover:shadow-sm',
    ghost: 'bg-transparent text-gray-900 hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  const size = 'px-4 py-2';
  return (
    <As className={`${base} ${variants[variant] || variants.primary} ${size} ${className}`} {...props}>
      {children}
    </As>
  );
}
