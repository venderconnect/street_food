export default function Textarea({ className = '', rows = 3, ...props }) {
  const base = 'block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500';
  return <textarea rows={rows} className={`${base} ${className}`} {...props} />;
}
