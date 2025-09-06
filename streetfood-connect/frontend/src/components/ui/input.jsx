export default function Input({ className = '', ...props }) {
  const base = 'block w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-white smooth input-focus';
  return <input className={`${base} ${className}`} {...props} />;
}
