export default function Input({ className = '', ...props }) {
  const base = 'block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500';
  return <input className={`${base} ${className}`} {...props} />;
}
