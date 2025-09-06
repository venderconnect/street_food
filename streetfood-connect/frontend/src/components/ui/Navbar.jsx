import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();
  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === to ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
    >
      {children}
    </Link>
  );
  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold">StreetFood Connect</Link>
        <nav className="flex gap-2">
          <NavLink to="/">Products</NavLink>
          <NavLink to="/prepared">Prepared</NavLink>
          <NavLink to="/orders/mine">My Orders</NavLink>
          <NavLink to="/supplier/dashboard">Dashboard</NavLink>
        </nav>
      </div>
    </header>
  );
}
