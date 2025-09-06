import { useProducts } from '../../api/hooks';

export default function PreparedHub() {
  const { data = [] } = useProducts({ isPrepped: true });
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-6">
      {data.map(p => (
        <div key={p._id} className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{p.name}</h3>
            <span className="text-xs bg-gray-200 px-2 py-1 rounded">Prepared</span>
          </div>
          <p className="text-sm text-gray-600">{p.description}</p>
          <div className="mt-2 text-sm">₹{p.price} / {p.unit}</div>
        </div>
      ))}
    </div>
  );
}
