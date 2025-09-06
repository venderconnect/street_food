import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();
  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium smooth ${pathname === to ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}
    >
      {children}
    </Link>
  );
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm shadow-sm">
      <div className="app-container h-16 flex items-center justify-between">
        <Link to="/" className="font-semibold text-lg text-primary-700">StreetFood Connect</Link>
        <nav className="flex gap-2 items-center">
          <NavLink to="/">Products</NavLink>
          <NavLink to="/prepared">Prepared</NavLink>
          <NavLink to="/orders/mine">My Orders</NavLink>
          <NavLink to="/supplier/dashboard">Dashboard</NavLink>
        </nav>
      </div>
    </header>
  );
}
