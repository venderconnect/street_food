import { Link } from 'react-router-dom';
import { useProducts } from '../../api/hooks';

export default function ProductsList() {
  const { data: products = [] } = useProducts();
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Products</h2>
        <Link to="/prepared" className="text-blue-600 underline">Prepared Hub</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map(p => (
          <Link key={p._id} to={`/products/${p._id}`} className="border rounded-lg p-4 block">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{p.name}</h3>
              {p.isPrepped && <span className="text-xs bg-gray-200 px-2 py-1 rounded">Prepared</span>}
            </div>
            <p className="text-sm text-gray-600">{p.description}</p>
            <div className="mt-2 text-sm">₹{p.price} / {p.unit}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
