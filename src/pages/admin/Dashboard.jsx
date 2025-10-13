import { useEffect, useState } from "react";
import api from "../../utils/api";
import { IMAGE_URL_PRODUCT, IMAGE_URL_USER } from "../../config/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Import default images
import defaultProduct from "../../assets/default-product.png";
import defaultAvatar from "../../assets/default-avatar.png";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    users: 0,
    outOfStock: 0,
    totalSales: 0,
  });
  const [latestProducts, setLatestProducts] = useState([]);
  const [latestUsers, setLatestUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productImages, setProductImages] = useState({});
  const [userImages, setUserImages] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // ambil produk dan user dari API
        const [productsRes, usersRes] = await Promise.all([
          api.get("/products"),
          api.get("/admin"),
        ]);

        const products = productsRes.data.products || [];
        const users = usersRes.data.users || [];

        const outOfStock = products.filter((p) => p.stock === 0).length;
        const latestP = [...products].slice(-5).reverse();
        const latestU = [...users].slice(-5).reverse();

        setStats({
          products: products.length,
          users: users.length,
          outOfStock,
          totalSales: 25000000, // dummy sementara
        });

        // simpan data produk & user terbaru
        setLatestProducts(latestP);
        setLatestUsers(latestU);

        // ambil gambar produk (dengan token)
        for (const p of latestP) {
          if (p.image) {
            try {
              const res = await fetch(`${IMAGE_URL_PRODUCT}/${p.image}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                setProductImages((prev) => ({ ...prev, [p._id]: url }));
              } else {
                setProductImages((prev) => ({
                  ...prev,
                  [p._id]: defaultProduct,
                }));
              }
            } catch {
              setProductImages((prev) => ({
                ...prev,
                [p._id]: defaultProduct,
              }));
            }
          } else {
            setProductImages((prev) => ({ ...prev, [p._id]: defaultProduct }));
          }
        }

        // ambil gambar user (dengan token)
        for (const u of latestU) {
          if (u.profileImage) {
            try {
              const res = await fetch(`${IMAGE_URL_USER}/${u.profileImage}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                setUserImages((prev) => ({ ...prev, [u._id]: url }));
              } else {
                setUserImages((prev) => ({ ...prev, [u._id]: defaultAvatar }));
              }
            } catch {
              setUserImages((prev) => ({ ...prev, [u._id]: defaultAvatar }));
            }
          } else {
            setUserImages((prev) => ({ ...prev, [u._id]: defaultAvatar }));
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const salesData = [
    { month: "Jan", sales: 12000000 },
    { month: "Feb", sales: 15000000 },
    { month: "Mar", sales: 18000000 },
    { month: "Apr", sales: 13000000 },
    { month: "May", sales: 22000000 },
    { month: "Jun", sales: 20000000 },
  ];

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="space-y-8">
      {/* Judul */}
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

      {/* Statistik utama */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Produk"
          value={stats.products}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Users"
          value={stats.users}
          color="bg-green-500"
        />
        <StatCard
          title="Produk Habis Stok"
          value={stats.outOfStock}
          color="bg-red-500"
        />
        <StatCard
          title="Total Penjualan"
          value={`Rp ${stats.totalSales.toLocaleString("id-ID")}`}
          color="bg-yellow-500"
        />
      </div>

      {/* Produk & User Terbaru */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Produk Terbaru */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Produk Terbaru</h2>
          <ul className="divide-y divide-gray-200">
            {latestProducts.map((p) => (
              <li key={p._id} className="py-3 flex items-center space-x-3">
                <img
                  src={productImages[p._id] || defaultProduct}
                  alt={p.name}
                  className="w-12 h-12 rounded-md object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-gray-500 text-sm">
                    Rp {p.price.toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* User Terbaru */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">User Terbaru</h2>
          <ul className="divide-y divide-gray-200">
            {latestUsers.map((u) => (
              <li key={u._id} className="py-3 flex items-center space-x-3">
                <img
                  src={userImages[u._id] || defaultAvatar}
                  alt={u.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-gray-500 text-sm">{u.email}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Grafik Penjualan */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">
          Statistik Penjualan (Dummy)
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Info Sistem */}
      <div className="text-sm text-gray-500 mt-8 text-center">
        <p>
          Login sebagai: <b>{user?.username}</b> ({user?.role})
        </p>
        <p>Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}</p>
        <p>Sistem E-Commerce v1.0.0</p>
      </div>
    </div>
  );
}

// Komponen kartu statistik
function StatCard({ title, value, color }) {
  return (
    <div className={`${color} text-white p-6 rounded-lg shadow`}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
