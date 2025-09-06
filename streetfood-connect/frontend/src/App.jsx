import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/Toast';
import { LoadingOverlay } from './components/common/LoadingOverlay';
import { RouteProgressBar } from './components/common/RouteProgressBar';
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
import ProductReviews from './pages/reviews/ProductReviews.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <LoadingOverlay>
          <RouteProgressBar />
          <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>

            <Route path="/" element={<ProductsList/>}/>
            <Route path="/products/:id" element={<ProductDetail/>}/>
            <Route path="/products/:id/reviews" element={<ProductReviews/>}/>
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
        </LoadingOverlay>
      </ToastProvider>
    </ErrorBoundary>
  );
}
