
import { useParams } from 'react-router-dom';
import { useSupplierProfile } from '../../api/hooks';

export default function SupplierProfile() {
  const { id } = useParams();
  const { data } = useSupplierProfile(id);
  const products = data?.products ?? [];
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Supplier Products</h2>
      <ul className="list-disc ml-6">{products.map(p => <li key={p._id}>{p.name}</li>)}</ul>
    </div>
  );
}
