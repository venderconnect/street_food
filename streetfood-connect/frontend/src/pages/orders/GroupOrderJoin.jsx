import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../../socket';
import { useJoinGroupOrder, useUpdateQuantity, useCloseGroupOrder } from '../../api/hooks';

export default function GroupOrderJoin() {
  const { id } = useParams();
  const [qty, setQty] = useState(1);
  const join = useJoinGroupOrder(id);
  const updateQty = useUpdateQuantity(id);
  const close = useCloseGroupOrder(id);

  useEffect(() => {
    socket.connect();
    socket.emit('subscribe:order', id);
    socket.on('order:update', () => {
      // could invalidate queries here if we fetched the order
    });
    return () => {
      socket.emit('unsubscribe:order', id);
      socket.disconnect();
    };
  }, [id]);

  return (
    <div className="p-6 space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold">Join Group Order</h2>
      <div className="flex gap-2">
        <input className="border p-2 w-full" type="number" min="1" value={qty} onChange={e=>setQty(Number(e.target.value))}/>
        <button onClick={()=>join.mutate(qty)} className="bg-green-600 text-white px-4 py-2 rounded">Join/Add</button>
      </div>
      <div className="flex gap-2">
        <input className="border p-2 w-full" type="number" min="1" value={qty} onChange={e=>setQty(Number(e.target.value))}/>
        <button onClick={()=>updateQty.mutate(qty)} className="bg-blue-600 text-white px-4 py-2 rounded">Update My Qty</button>
      </div>
      <button onClick={()=>close.mutate()} className="bg-gray-800 text-white px-4 py-2 rounded">Close Order</button>
    </div>
  );
}
    