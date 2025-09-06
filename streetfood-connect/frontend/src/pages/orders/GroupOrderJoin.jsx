import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../../socket';
import { useJoinGroupOrder, useUpdateQuantity, useCloseGroupOrder } from '../../api/hooks';
import Input from '../../components/ui/input';
import Button from '../../components/ui/button';

export default function GroupOrderJoin() {
  const { id } = useParams();
  const [qty, setQty] = useState(1);
  const join = useJoinGroupOrder(id);
  const updateQty = useUpdateQuantity(id);
  const close = useCloseGroupOrder(id);

  useEffect(() => {
    socket.connect();
    socket.emit('subscribe:order', id);
    return () => {
      socket.emit('unsubscribe:order', id);
      socket.disconnect();
    };
  }, [id]);

  return (
    <div className="p-6 space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold">Join Group Order</h2>
      <div className="flex gap-2">
        <Input type="number" min="1" value={qty} onChange={e=>setQty(Number(e.target.value))}/>
        <Button onClick={()=>join.mutate(qty)} variant="primary">Join/Add</Button>
      </div>
      <div className="flex gap-2">
        <Input type="number" min="1" value={qty} onChange={e=>setQty(Number(e.target.value))}/>
        <Button onClick={()=>updateQty.mutate(qty)} variant="primary">Update My Qty</Button>
      </div>
      <Button onClick={()=>close.mutate()} variant="ghost">Close Order</Button>
    </div>
  );
}
    