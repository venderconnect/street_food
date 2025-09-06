import { useParams } from 'react-router-dom';
import { useVendorProfile } from '../../api/hooks';

export default function VendorProfile() {
  const { id } = useParams();
  const { data } = useVendorProfile(id);
  const orders = data?.orders ?? [];
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Vendor Orders</h2>
      <ul className="list-disc ml-6">
        {orders.map(o => <li key={o._id}>{o._id} - {o.status}</li>)}
      </ul>
    </div>
  );
}
