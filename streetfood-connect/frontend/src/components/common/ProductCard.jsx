import { Link } from 'react-router-dom';
import Badge from '../ui/badge';
import { Card, CardHeader, CardContent } from '../ui/card';
import RatingStars from './RatingStars';

export default function ProductCard({ product }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex items-center justify-between">
        <div className="font-semibold">{product.name}</div>
        {product.isPrepped && <Badge variant="secondary">Prepared</Badge>}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        <div className="mt-2 text-sm">₹{product.price} / {product.unit}</div>
        <div className="mt-1"><RatingStars value={product.averageRating || 0} /></div>
        <Link to={`/products/${product._id}`} className="inline-block mt-3 text-blue-600 underline text-sm">View</Link>
      </CardContent>
    </Card>
  );
}
