import { Link, useParams } from 'react-router-dom';
import { useProduct } from '../../api/hooks';

export default function ProductDetail() {
  const { id } = useParams();
  const { data } = useProduct(id);
  if (!data) return null;
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">{data.name}</h1>
      <p className="text-gray-600">{data.description}</p>
      <div className="mt-2">₹{data.price} / {data.unit}</div>
      <div className="mt-1 text-sm text-gray-500">Rating: {data.averageRating?.toFixed(1) ?? 0} ({data.ratingCount})</div>
      <div className="mt-4 flex gap-3">
        <Link className="text-blue-600 underline" to={`/orders/new`}>Create Group Order</Link>
        <Link className="text-blue-600 underline" to={`/products/${id}/reviews`}>Reviews</Link>
      </div>
    </div>
  );
}
