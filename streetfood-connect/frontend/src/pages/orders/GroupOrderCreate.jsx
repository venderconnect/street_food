import { useState } from 'react';
import { useCreateGroupOrder } from '../../api/hooks';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/input';
import Button from '../../components/ui/button';

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
    <Input placeholder="Product ID" value={productId} onChange={e=>setProductId(e.target.value)} required/>
    <Input type="number" min="1" value={quantity} onChange={e=>setQuantity(e.target.value)} required/>
    <Button disabled={isPending} variant="primary">{isPending?'Creating...':'Create'}</Button>
  </form>);
}
