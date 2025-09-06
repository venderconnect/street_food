import { Link } from 'react-router-dom';
import Badge from '../ui/badge';
import { Card, CardHeader, CardContent } from '../ui/card';
import RatingStars from './RatingStars';

export default function ProductCard({ product }) {
  return (
    <Card className="overflow-hidden hover:translate-y-[-4px] hover:shadow-lg smooth">
      <div className="bg-gradient-to-br from-primary-50 to-white p-4">
        <div className="h-36 rounded-md bg-white/60 flex items-center justify-center text-gray-300">
          {/* Placeholder for product image */}
          <span className="text-3xl">🍲</span>
        </div>
      </div>
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="font-semibold text-lg leading-snug">{product.name}</div>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">₹{product.price}</div>
            <div className="text-xs text-gray-400">/{product.unit}</div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RatingStars value={product.averageRating || 0} />
            <div className="text-sm text-muted">{product.ratingCount || 0} reviews</div>
          </div>
          <Link to={`/products/${product._id}`} className="text-sm bg-primary-500 text-white px-3 py-1 rounded-md">View</Link>
        </div>
      </CardContent>
    </Card>
  );
}
