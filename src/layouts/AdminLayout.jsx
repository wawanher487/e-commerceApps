// src/layouts/AdminLayout.jsx
import { Outlet, Link } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-gray-800 text-white p-4 flex justify-between">
        <h1 className="font-bold text-lg">Admin Dashboard</h1>
        <div className="space-x-4">
          <Link to="/admin/dashboard" className="hover:underline">
            Home
          </Link>
          <Link to="/admin/products" className="hover:underline">
            Produk
          </Link>
          <Link to="/admin/users" className="hover:underline">
            Users
          </Link>
          <Link to="/admin/profile" className="hover:underline">
            Profile
          </Link>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
}
