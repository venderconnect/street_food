import { useState } from 'react';
import { useCreateGroupOrder } from '../../api/hooks';
import { useNavigate } from 'react-router-dom';

export default function GroupOrderCreate() {
  const [productId,setProductId]=useState('');
  const [quantity,setQuantity]=useState(1);
  const { mutateAsync, isPending } = useCreateGroupOrder();
  const navigate = useNavigate();

  async function onSubmit(e){
    e.preventDefault();
    const order = await mutateAsync({ productId, quantity: Number(quantity) });
    navigate(`/orders/${order._id}/join`, { replace: true });
  }

  return (<form onSubmit={onSubmit} className="max-w-md mx-auto p-6 space-y-4">
    <input className="border p-2 w-full" placeholder="Product ID" value={productId} onChange={e=>setProductId(e.target.value)} required/>
    <input className="border p-2 w-full" type="number" min="1" value={quantity} onChange={e=>setQuantity(e.target.value)} required/>
    <button disabled={isPending} className="bg-blue-600 text-white px-4 py-2 rounded">{isPending?'Creating...':'Create'}</button>
  </form>);
}
