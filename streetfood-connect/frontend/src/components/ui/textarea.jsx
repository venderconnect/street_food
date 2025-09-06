export default function Textarea({ className = '', rows = 3, ...props }) {
  const base = 'block w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-white smooth input-focus resize-y';
  return <textarea rows={rows} className={`${base} ${className}`} {...props} />;
}
