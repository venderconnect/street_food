import { useState } from 'react';
import api from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const { login } = useAuth(); const navigate = useNavigate();
  async function onSubmit(e){ e.preventDefault();
    const { data } = await api.post('/api/auth/login',{ email, password });
    login(data.token, data.role, data.userId); navigate('/', { replace: true });
  }
  return (<form onSubmit={onSubmit} className="max-w-sm mx-auto p-6 space-y-4">
    <input className="border p-2 w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
    <input className="border p-2 w-full" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/>
    <button className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
  </form>);
}
