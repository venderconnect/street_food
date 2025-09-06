#!/usr/bin/env bash
set -euo pipefail

# Config
REPO_NAME="streetfood-connect"
REPO_VISIBILITY="private" # change to public if preferred

# Create root
mkdir -p "$REPO_NAME"
cd "$REPO_NAME"

# Root files
cat > README.md << 'EOF'
# StreetFood Connect

MERN-like monorepo with:
- Frontend: React + Vite, Tailwind + shadcn/ui, React Router v6, TanStack Query, Recharts
- Backend: Node.js + Express, JWT + bcrypt, MongoDB Atlas + Mongoose transactions, Socket.IO
- Optional: Firebase Cloud Messaging for web push

See backend/.env.example and frontend/.env.example for required environment variables.
EOF

cat > .gitignore << 'EOF'
# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
dist/
build/
.cache/
*.log

# Env
.env
.env.local
.env.*.local

# Editor/OS
.DS_Store
.idea/
.vscode/
*.swp
EOF

# Root package (optional helper scripts)
cat > package.json << 'EOF'
{
  "private": true,
  "scripts": {
    "dev": "npm-run-all -p dev:server dev:client",
    "dev:server": "npm --prefix backend run dev",
    "dev:client": "npm --prefix frontend run dev",
    "build": "npm --prefix frontend run build"
  },
  "devDependencies": {
    "npm-run-all": "^4.1.5"
  }
}
EOF

# Backend
mkdir -p backend/src/{config,controllers,middleware,models,routes,services,sockets,utils}
cat > backend/package.json << 'EOF'
{
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.4.1",
    "morgan": "^1.10.0",
    "socket.io": "^4.7.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
EOF

cat > backend/.env.example << 'EOF'
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=replace_with_strong_secret
CLIENT_ORIGIN=http://localhost:5173
EOF

cat > backend/src/config/db.js << 'EOF'
import mongoose from 'mongoose';

export async function connectDB(uri) {
  try {
    await mongoose.connect(uri, { dbName: 'streetfood-connect' });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}
EOF

cat > backend/src/middleware/error.js << 'EOF'
export function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
}
EOF

cat > backend/src/middleware/auth.js << 'EOF'
import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}
EOF

cat > backend/src/models/User.js << 'EOF'
import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, index: true },
  passwordHash: String,
  role: { type: String, enum: ['vendor','supplier'], required: true },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('User', userSchema);
EOF

cat > backend/src/models/Product.js << 'EOF'
import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  description: String,
  price: Number,
  unit: String,
  isPrepped: { type: Boolean, default: false },
  averageRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('Product', productSchema);
EOF

cat > backend/src/models/GroupOrder.js << 'EOF'
import mongoose from 'mongoose';
const participantSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quantity: { type: Number, required: true }
}, { _id: false });

const groupOrderSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['open','processing','completed','cancelled'], default: 'open' },
  participants: [participantSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  closedAt: Date
});
export default mongoose.model('GroupOrder', groupOrderSchema);
EOF

cat > backend/src/models/Review.js << 'EOF'
import mongoose from 'mongoose';
const reviewSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  text: String,
  createdAt: { type: Date, default: Date.now }
});
reviewSchema.index({ vendor: 1, product: 1 }, { unique: true });
export default mongoose.model('Review', reviewSchema);
EOF

cat > backend/src/utils/calcAverageRating.js << 'EOF'
export function updateAverage(currentAvg, currentCount, newRating) {
  const total = currentAvg * currentCount + newRating;
  const nextCount = currentCount + 1;
  return { avg: total / nextCount, count: nextCount };
}
EOF

cat > backend/src/controllers/authController.js << 'EOF'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function register(req, res) {
  const { name, email, password, role } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role });
  return res.status(201).json({ id: user._id });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ sub: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
  return res.json({ token, role: user.role, userId: user._id });
}
EOF

cat > backend/src/controllers/productController.js << 'EOF'
import Product from '../models/Product.js';

export async function listProducts(req, res) {
  const { isPrepped } = req.query;
  const filter = {};
  if (isPrepped !== undefined) filter.isPrepped = isPrepped === 'true';
  const products = await Product.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json(products);
}

export async function getProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });
  res.json(product);
}

export async function createProduct(req, res) {
  if (req.user.role !== 'supplier') return res.status(403).json({ message: 'Forbidden' });
  const doc = await Product.create({ ...req.body, supplier: req.user.sub });
  res.status(201).json(doc);
}
EOF

cat > backend/src/controllers/orderController.js << 'EOF'
import mongoose from 'mongoose';
import GroupOrder from '../models/GroupOrder.js';
import Product from '../models/Product.js';

export async function createGroupOrder(req, res) {
  const { productId, quantity } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const order = await GroupOrder.create({
    product: product._id,
    supplier: product.supplier,
    participants: [{ vendor: req.user.sub, quantity }],
    createdBy: req.user.sub
  });
  res.status(201).json(order);
}

export async function joinGroupOrder(req, res) {
  const { id } = req.params;
  const { quantity } = req.body;
  const order = await GroupOrder.findById(id);
  if (!order || order.status !== 'open') return res.status(400).json({ message: 'Cannot join' });
  const idx = order.participants.findIndex(p => p.vendor.toString() === req.user.sub);
  if (idx === -1) order.participants.push({ vendor: req.user.sub, quantity });
  else order.participants[idx].quantity += quantity;
  await order.save();
  res.json(order);
}

export async function updateQuantity(req, res) {
  const { id } = req.params;
  const { quantity } = req.body;
  const order = await GroupOrder.findById(id);
  if (!order || order.status !== 'open') return res.status(400).json({ message: 'Cannot modify' });
  const p = order.participants.find(p => p.vendor.toString() === req.user.sub);
  if (!p) return res.status(404).json({ message: 'Not in order' });
  p.quantity = quantity;
  await order.save();
  res.json(order);
}

export async function closeGroupOrder(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const order = await GroupOrder.findById(id).session(session).populate('product');
    if (!order || order.status !== 'open') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Invalid order state' });
    }
    order.status = 'completed';
    order.closedAt = new Date();
    await order.save({ session });
    await session.commitTransaction();
    session.endSession();
    return res.json(order);
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: 'Close failed' });
  }
}

export async function myOrders(req, res) {
  const orders = await GroupOrder.find({ 'participants.vendor': req.user.sub }).sort({ createdAt: -1 }).limit(100);
  res.json(orders);
}
EOF

cat > backend/src/controllers/reviewController.js << 'EOF'
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { updateAverage } from '../utils/calcAverageRating.js';

export async function createReview(req, res) {
  const { productId, rating, text } = req.body;
  const review = await Review.create({ vendor: req.user.sub, product: productId, rating, text });
  const product = await Product.findById(productId);
  const { avg, count } = updateAverage(product.averageRating, product.ratingCount, rating);
  product.averageRating = avg;
  product.ratingCount = count;
  await product.save();
  res.status(201).json(review);
}
EOF

cat > backend/src/controllers/profileController.js << 'EOF'
import Product from '../models/Product.js';
import GroupOrder from '../models/GroupOrder.js';

export async function supplierProfile(req, res) {
  const { id } = req.params;
  const products = await Product.find({ supplier: id }).sort({ createdAt: -1 });
  res.json({ products });
}

export async function vendorProfile(req, res) {
  const { id } = req.params;
  const orders = await GroupOrder.find({ 'participants.vendor': id }).sort({ createdAt: -1 }).limit(100);
  res.json({ orders });
}
EOF

cat > backend/src/controllers/dashboardController.js << 'EOF'
export async function revenue(req, res) {
  // Placeholder: replace with aggregation over orders and time buckets
  res.json([
    { period: '2025-01', amount: 12000 },
    { period: '2025-02', amount: 15800 },
    { period: '2025-03', amount: 17150 }
  ]);
}
EOF

cat > backend/src/routes/authRoutes.js << 'EOF'
import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
const router = Router();
router.post('/register', register);
router.post('/login', login);
export default router;
EOF

cat > backend/src/routes/productRoutes.js << 'EOF'
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listProducts, createProduct, getProduct } from '../controllers/productController.js';
const router = Router();
router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', requireAuth, createProduct);
export default router;
EOF

cat > backend/src/routes/orderRoutes.js << 'EOF'
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createGroupOrder, joinGroupOrder, updateQuantity, closeGroupOrder, myOrders } from '../controllers/orderController.js';
const router = Router();
router.post('/', requireAuth, createGroupOrder);
router.post('/:id/join', requireAuth, joinGroupOrder);
router.patch('/:id/quantity', requireAuth, updateQuantity);
router.post('/:id/close', requireAuth, closeGroupOrder);
router.get('/mine', requireAuth, myOrders);
export default router;
EOF

cat > backend/src/routes/reviewRoutes.js << 'EOF'
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createReview } from '../controllers/reviewController.js';
const router = Router();
router.post('/', requireAuth, createReview);
export default router;
EOF

cat > backend/src/routes/profileRoutes.js << 'EOF'
import { Router } from 'express';
import { supplierProfile, vendorProfile } from '../controllers/profileController.js';
const router = Router();
router.get('/supplier/:id', supplierProfile);
router.get('/vendor/:id', vendorProfile);
export default router;
EOF

cat > backend/src/routes/dashboardRoutes.js << 'EOF'
import { Router } from 'express';
import { revenue } from '../controllers/dashboardController.js';
const router = Router();
router.get('/revenue', revenue);
export default router;
EOF

cat > backend/src/sockets/index.js << 'EOF'
export function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    const { userId } = socket.handshake.auth || {};
    if (userId) socket.join(`user:${userId}`);
    socket.on('subscribe:order', (orderId) => socket.join(`order:${orderId}`));
    socket.on('unsubscribe:order', (orderId) => socket.leave(`order:${orderId}`));
  });
}
EOF

cat > backend/src/app.js << 'EOF'
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { errorHandler } from './middleware/error.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);
export default app;
EOF

cat > backend/src/server.js << 'EOF'
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { registerSocketHandlers } from './sockets/index.js';

dotenv.config();
const PORT = process.env.PORT || 5000;

await connectDB(process.env.MONGO_URI);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    methods: ['GET','POST','PATCH'],
    credentials: true,
  },
});

registerSocketHandlers(io);
server.listen(PORT, () => console.log(`API running on :${PORT}`));
EOF

# Frontend
mkdir -p frontend/{public,src/{api,components/{ui,common},context,pages/{auth,products,orders,reviews,profiles,dashboard},routes}}
cat > frontend/package.json << 'EOF'
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --host"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.51.0",
    "axios": "^1.7.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.25.1",
    "recharts": "^2.12.7",
    "socket.io-client": "^4.8.1"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.7",
    "vite": "^5.3.3"
  }
}
EOF

cat > frontend/.env.example << 'EOF'
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
# Optional Firebase Web Push
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
EOF

cat > frontend/index.html << 'EOF'
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>StreetFood Connect</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF

cat > frontend/src/styles/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

cat > frontend/tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: []
}
EOF

cat > frontend/postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

cat > frontend/src/main.jsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.jsx';
import App from './App.jsx';
import './styles/index.css';

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);
EOF

cat > frontend/src/App.jsx << 'EOF'
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import ProductsList from './pages/products/ProductsList.jsx';
import ProductDetail from './pages/products/ProductDetail.jsx';
import PreparedHub from './pages/products/PreparedHub.jsx';
import GroupOrderCreate from './pages/orders/GroupOrderCreate.jsx';
import GroupOrderJoin from './pages/orders/GroupOrderJoin.jsx';
import MyOrders from './pages/orders/MyOrders.jsx';
import SupplierDashboard from './pages/dashboard/SupplierDashboard.jsx';
import SupplierProfile from './pages/profiles/SupplierProfile.jsx';
import VendorProfile from './pages/profiles/VendorProfile.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/" element={<ProductsList/>}/>
      <Route path="/products/:id" element={<ProductDetail/>}/>
      <Route path="/prepared" element={<PreparedHub/>}/>
      <Route element={<ProtectedRoute/>}>
        <Route path="/orders/new" element={<GroupOrderCreate/>}/>
        <Route path="/orders/:id/join" element={<GroupOrderJoin/>}/>
        <Route path="/orders/mine" element={<MyOrders/>}/>
        <Route path="/supplier/dashboard" element={<SupplierDashboard/>}/>
        <Route path="/supplier/:id" element={<SupplierProfile/>}/>
        <Route path="/vendor/:id" element={<VendorProfile/>}/>
      </Route>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  );
}
EOF

cat > frontend/src/routes/ProtectedRoute.jsx << 'EOF'
import { Navigate, Outlet, useLocation } from 'react-router-dom';
export default function ProtectedRoute() {
  const token = localStorage.getItem('token');
  const location = useLocation();
  return token ? <Outlet/> : <Navigate to="/login" replace state={{ from: location }}/>
}
EOF

cat > frontend/src/context/AuthContext.jsx << 'EOF'
import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));

  const login = (t, r, u) => {
    localStorage.setItem('token', t);
    localStorage.setItem('role', r);
    localStorage.setItem('userId', u);
    setToken(t); setRole(r); setUserId(u);
  };
  const logout = () => {
    ['token','role','userId'].forEach(k => localStorage.removeItem(k));
    setToken(null); setRole(null); setUserId(null);
  };

  const value = useMemo(() => ({ token, role, userId, login, logout }), [token, role, userId]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
EOF

cat > frontend/src/api/util.js << 'EOF'
export function getBaseUrl() {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
}
EOF

cat > frontend/src/api/client.js << 'EOF'
import axios from 'axios';
import { getBaseUrl } from './util';

const api = axios.create({ baseURL: getBaseUrl() });
api.interceptors.request.use((config) => {
  const t = localStorage.getItem('token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});
export default api;
EOF

cat > frontend/src/api/hooks.js << 'EOF'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './client';

export const useProducts = (opts) =>
  useQuery({
    queryKey: ['products', opts],
    queryFn: async () => (await api.get('/api/products', { params: opts })).data
  });

export const useCreateGroupOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/api/orders', body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-orders'] })
  });
};
EOF

cat > frontend/src/socket.js << 'EOF'
import { io } from 'socket.io-client';
export const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
  autoConnect: false,
  auth: () => ({ userId: localStorage.getItem('userId') }),
});
EOF

# Minimal pages (stubs)
cat > frontend/src/pages/auth/Login.jsx << 'EOF'
import { useState } from 'react';
import api from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const { login } = useAuth(); const navigate = useNavigate();
  async function onSubmit(e){ e.preventDefault();
    const { data } = await api.post('/api/auth/login',{ email, password });
    login(data.token, data.role, data.userId); navigate('/');
  }
  return (<form onSubmit={onSubmit} className="max-w-sm mx-auto p-6 space-y-4">
    <input className="border p-2 w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
    <input className="border p-2 w-full" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/>
    <button className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
  </form>);
}
EOF

cat > frontend/src/pages/auth/Register.jsx << 'EOF'
import { useState } from 'react';
import api from '../../api/client';

export default function Register() {
  const [form,setForm]=useState({ name:'', email:'', password:'', role:'vendor' });
  async function onSubmit(e){ e.preventDefault(); await api.post('/api/auth/register', form); alert('Registered, please login'); }
  return (<form onSubmit={onSubmit} className="max-w-sm mx-auto p-6 space-y-4">
    <input className="border p-2 w-full" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
    <input className="border p-2 w-full" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
    <input className="border p-2 w-full" type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
    <select className="border p-2 w-full" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
      <option value="vendor">Vendor</option>
      <option value="supplier">Supplier</option>
    </select>
    <button className="bg-blue-600 text-white px-4 py-2 rounded">Register</button>
  </form>);
}
EOF

cat > frontend/src/pages/products/ProductsList.jsx << 'EOF'
import { Link } from 'react-router-dom';
import { useProducts } from '../../api/hooks';

export default function ProductsList() {
  const { data: products = [] } = useProducts();
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Products</h2>
        <Link to="/prepared" className="text-blue-600 underline">Prepared Hub</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map(p => (
          <Link key={p._id} to={`/products/${p._id}`} className="border rounded-lg p-4 block">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{p.name}</h3>
              {p.isPrepped && <span className="text-xs bg-gray-200 px-2 py-1 rounded">Prepared</span>}
            </div>
            <p className="text-sm text-gray-600">{p.description}</p>
            <div className="mt-2 text-sm">₹{p.price} / {p.unit}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
EOF

cat > frontend/src/pages/products/ProductDetail.jsx << 'EOF'
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';

export default function ProductDetail() {
  const { id } = useParams();
  const { data } = useQuery({ queryKey:['product', id], queryFn: async()=> (await api.get(`/api/products/${id}`)).data });
  if (!data) return null;
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">{data.name}</h1>
      <p className="text-gray-600">{data.description}</p>
      <div className="mt-2">₹{data.price} / {data.unit}</div>
      <div className="mt-1 text-sm text-gray-500">Rating: {data.averageRating?.toFixed(1) ?? 0} ({data.ratingCount})</div>
    </div>
  );
}
EOF

cat > frontend/src/pages/products/PreparedHub.jsx << 'EOF'
import { useProducts } from '../../api/hooks';

export default function PreparedHub() {
  const { data = [] } = useProducts({ isPrepped: true });
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-6">
      {data.map(p => (
        <div key={p._id} className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{p.name}</h3>
            <span className="text-xs bg-gray-200 px-2 py-1 rounded">Prepared</span>
          </div>
          <p className="text-sm text-gray-600">{p.description}</p>
          <div className="mt-2 text-sm">₹{p.price} / {p.unit}</div>
        </div>
      ))}
    </div>
  );
}
EOF

cat > frontend/src/pages/orders/GroupOrderCreate.jsx << 'EOF'
import { useState } from 'react';
import { useCreateGroupOrder } from '../../api/hooks';

export default function GroupOrderCreate() {
  const [productId,setProductId]=useState('');
  const [quantity,setQuantity]=useState(1);
  const { mutateAsync } = useCreateGroupOrder();
  async function onSubmit(e){ e.preventDefault(); await mutateAsync({ productId, quantity: Number(quantity) }); alert('Group order created'); }
  return (<form onSubmit={onSubmit} className="max-w-md mx-auto p-6 space-y-4">
    <input className="border p-2 w-full" placeholder="Product ID" value={productId} onChange={e=>setProductId(e.target.value)}/>
    <input className="border p-2 w-full" type="number" min="1" value={quantity} onChange={e=>setQuantity(e.target.value)}/>
    <button className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
  </form>);
}
EOF

cat > frontend/src/pages/orders/GroupOrderJoin.jsx << 'EOF'
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../../socket';

export default function GroupOrderJoin() {
  const { id } = useParams();
  useEffect(() => {
    socket.connect();
    socket.emit('subscribe:order', id);
    socket.on('order:update', () => {});
    return () => {
      socket.emit('unsubscribe:order', id);
      socket.disconnect();
    };
  }, [id]);

  return <div className="p-6">Join order UI (subscribe to updates)</div>;
}
EOF

cat > frontend/src/pages/orders/MyOrders.jsx << 'EOF'
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';

export default function MyOrders() {
  const { data: orders = [] } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => (await api.get('/api/orders/mine')).data
  });
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
EOF

cat > frontend/src/pages/dashboard/SupplierDashboard.jsx << 'EOF'
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function SupplierDashboard() {
  const { data: revenue = [] } = useQuery({
    queryKey: ['dash-revenue'],
    queryFn: async () => (await api.get('/api/dashboard/revenue')).data
  });

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Revenue Over Time</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenue}>
            <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2}/>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3"/>
            <XAxis dataKey="period"/>
            <YAxis/>
            <Tooltip/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
EOF

cat > frontend/src/pages/profiles/SupplierProfile.jsx << 'EOF'
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';

export default function SupplierProfile() {
  const { id } = useParams();
  const { data } = useQuery({ queryKey:['supplier',id], queryFn: async()=> (await api.get(`/api/profiles/supplier/${id}`)).data });
  const products = data?.products ?? [];
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Supplier Products</h2>
      <ul className="list-disc ml-6">{products.map(p => <li key={p._id}>{p.name}</li>)}</ul>
    </div>
  );
}
EOF

cat > frontend/src/pages/profiles/VendorProfile.jsx << 'EOF'
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';

export default function VendorProfile() {
  const { id } = useParams();
  const { data } = useQuery({ queryKey:['vendor',id], queryFn: async()=> (await api.get(`/api/profiles/vendor/${id}`)).data });
  const orders = data?.orders ?? [];
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Vendor Orders</h2>
      <ul className="list-disc ml-6">{orders.map(o => <li key={o._id}>{o._id} - {o.status}</li>)}</ul>
    </div>
  );
}
EOF

# Done creating files
npm --prefix backend install
npm --prefix frontend install

git init
git add .
git commit -m "feat: initial StreetFood Connect monorepo"

# Create GitHub repo and push using gh
# Requires: gh auth login (interactive) done beforehand
gh repo create "$REPO_NAME" --"$REPO_VISIBILITY" --source=. --remote=origin --push

echo "Repository created and pushed."
