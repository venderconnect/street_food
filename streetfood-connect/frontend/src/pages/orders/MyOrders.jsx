import { useMyOrders } from '../../api/hooks';

export default function MyOrders() {
  const { data: orders = [] } = useMyOrders();
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">My Orders</h2>
      {orders.map(o => (
        <div key={o._id} className="border rounded p-4">
          <div>Order: {o._id}</div>
          <div>Status: {o.status}</div>
        </div>
      ))}
    </div>
  );
}
