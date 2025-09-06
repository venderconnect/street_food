export default function OrderRow({ order }) {
  return (
    <div className="border rounded p-4 bg-white">
      <div className="font-medium">Order: {order._id}</div>
      <div className="text-sm text-gray-600">Status: {order.status}</div>
    </div>
  );
}
