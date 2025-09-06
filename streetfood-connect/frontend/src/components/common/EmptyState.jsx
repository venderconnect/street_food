export default function EmptyState({ title = 'Nothing here yet', subtitle }) {
  return (
    <div className="p-6 border border-gray-200 bg-white rounded-md text-center">
      <div className="font-semibold">{title}</div>
      {subtitle && <div className="text-sm text-gray-600 mt-1">{subtitle}</div>}
    </div>
  );
}
