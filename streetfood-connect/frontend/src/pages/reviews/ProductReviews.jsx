import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useProduct, useCreateReview } from '../../api/hooks';

export default function ProductReviews() {
  const { id: productId } = useParams();
  const { data: product } = useProduct(productId);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const createReview = useCreateReview(productId);

  async function onSubmit(e) {
    e.preventDefault();
    await createReview.mutateAsync({ rating: Number(rating), text });
    setText('');
  }

  if (!product) return null;
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold">Reviews for {product.name}</h2>
      <div className="text-sm text-gray-600">Average: {product.averageRating?.toFixed(1) ?? 0} ({product.ratingCount})</div>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="text-sm">Rating (1–5)</span>
          <input className="border p-2 w-full" type="number" min="1" max="5" value={rating} onChange={e=>setRating(e.target.value)}/>
        </label>
        <label className="block">
          <span className="text-sm">Comment</span>
          <textarea className="border p-2 w-full" rows={3} value={text} onChange={e=>setText(e.target.value)}/>
        </label>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Submit Review</button>
      </form>
      {/* Once a list endpoint exists, render reviews below */}
    </div>
  );
}
