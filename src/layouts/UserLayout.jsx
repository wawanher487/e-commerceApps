// src/layouts/UserLayout.jsx
import { Outlet, Link } from "react-router-dom";

export default function UserLayout() {
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    if (confirm("Yakin ingin logout?")) {
      localStorage.clear();
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
        {/* Judul kiri */}
        <h1 className="font-bold text-lg">👋 Hi, {user?.name || "User"}</h1>

        <div className="space-x-4">
          <Link to="/user/dashboard" className="hover:underline">
            Produk
          </Link>
          <Link to="/user/profile" className="hover:underline">
            Profil
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="flex-1 p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
