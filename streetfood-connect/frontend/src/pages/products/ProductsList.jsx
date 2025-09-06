import { Link } from 'react-router-dom';
import { useProducts } from '../../api/hooks';
import ProductCard from '../../components/common/ProductCard';

export default function ProductsList() {
  const { data: products = [] } = useProducts();
  return (
    <div className="app-container py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <Link to="/prepared" className="text-primary-700">Prepared Hub</Link>
      </div>
      <div className="grid-cards">
        {products.map(p => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
