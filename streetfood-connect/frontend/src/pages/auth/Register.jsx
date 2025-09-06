import { useState } from 'react';
import api from '../../api/client';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form,setForm]=useState({ name:'', email:'', password:'', role:'vendor' });
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const navigate = useNavigate();

  async function onSubmit(e){
    e.preventDefault();
    setError('');
    // Basic client-side validation
    if(!form.name || !form.email || !form.password) {
      setError('Please fill all fields');
      return;
    }
    if(form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      setLoading(true);
      await api.post('/api/auth/register', form);
      navigate('/login', { replace: true });
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto p-6 space-y-4">
      {error && <div className="text-sm text-red-600">{error}</div>}
      <input className="border p-2 w-full" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
      <input className="border p-2 w-full" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
      <input className="border p-2 w-full" type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
      <select className="border p-2 w-full" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
        <option value="vendor">Vendor</option>
        <option value="supplier">Supplier</option>
      </select>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
    </form>
  );
}
