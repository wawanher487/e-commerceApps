import { useEffect, useState } from "react";
import api from "../../utils/api";
import { IMAGE_URL_PRODUCT, IMAGE_URL_USER } from "../../config/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productImages, setProductImages] = useState({});
  const [userImages, setUserImages] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // ambil produk dan user dari API
        const [productsRes, usersRes, ordersRes] = await Promise.all([
          api.get("/products"),
          api.get("/admin"),
          api.get("/orders/admin"),
        ]);

        const products = productsRes.data.products || [];
        const users = usersRes.data.users || [];
        const orders = ordersRes.data.orders || [];

        // Hitung total penjualan & jumlah order per bulan
        const monthlyStats = {};

        orders.forEach((o) => {
          const orderYear = new Date(o.createdAt).getFullYear();
          if (orderYear === selectedYear) {
            const month = new Date(o.createdAt).toLocaleString("id-ID", {
              month: "short",
            });

            if (!monthlyStats[month]) {
              monthlyStats[month] = {
                sales: 0,
                paidCount: 0,
                completedCount: 0,
              };
            }

            // Tambahkan total penjualan hanya untuk paid/completed
            if (["paid", "completed"].includes(o.status)) {
              monthlyStats[month].sales += o.total;
            }

            if (o.status === "paid") monthlyStats[month].paidCount++;
            if (o.status === "completed") monthlyStats[month].completedCount++;
          }
        });

        // Ubah ke array untuk grafik & tabel
        const monthlySalesData = Object.entries(monthlyStats).map(
          ([month, data]) => ({
            month,
            sales: data.sales,
            paidCount: data.paidCount,
            completedCount: data.completedCount,
          })
        );

        //jumlah semua order
        const totalOrders = orders.length;

        //hitung total penjualan (hanya status paid atau completed)
        const totalSales = orders
          .filter((o) => ["paid", "completed"].includes(o.status))
          .reduce((sum, o) => sum + o.total, 0);

        const outOfStock = products.filter((p) => p.stock === 0).length;
        const latestP = [...products].slice(-5).reverse();
        const latestU = [...users].slice(-5).reverse();

        setStats({
          products: products.length,
          users: users.length,
          outOfStock,
          totalSales,
          totalOrders,
        });

        // simpan data produk & user terbaru
        setLatestProducts(latestP);
        setLatestUsers(latestU);
        setSalesData(monthlySalesData);

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
  }, [selectedYear]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      salesData.map((item, index) => ({
        No: index + 1,
        Bulan: item.month,
        "Total Pendapatan (Rp)": item.sales,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pendapatan Bulanan");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `Pendapatan-${selectedYear}.xlsx`);
  };

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
          title="Jumlah Order"
          value={stats.totalOrders}
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
                  onError={(e) => (e.target.src = defaultProduct)}
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Statistik Penjualan
          </h2>
          <div>
            <label className="mr-2 text-sm text-gray-600">Pilih Tahun:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              {[2023, 2024, 2025, 2026].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={salesData}
              margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
              barCategoryGap="20%"
            >
              {/* Grid latar belakang */}
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

              {/* Sumbu X dan Y */}
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />

              {/* Tooltip */}
              <Tooltip
                cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                formatter={(value) => `Rp ${value.toLocaleString("id-ID")}`}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                }}
              />

              {/* Bar chart utama */}
              <Bar
                dataKey="sales"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                barSize={25}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🧾 Tabel Pendapatan Bulanan */}
      <div className="bg-white mt-6 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">
          Rincian Pendapatan per Bulan
        </h2>
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={exportToExcel}
            className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600"
          >
            Export Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100 text-gray-700 uppercase">
              <tr>
                <th className="py-2 px-4 text-left">No</th>
                <th className="py-2 px-4 text-left">Bulan</th>
                <th className="py-2 px-4 text-left">Total Pendapatan</th>
                <th className="py-2 px-4 text-left">Paid</th>
                <th className="py-2 px-4 text-left">Completed</th>
              </tr>
            </thead>
            <tbody>
              {salesData.length > 0 ? (
                salesData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{index + 1}</td>
                    <td className="py-2 px-4">{item.month}</td>
                    <td className="py-2 px-4">
                      Rp {item.sales.toLocaleString("id-ID")}
                    </td>
                    <td className="py-2 px-4">{item.paidCount}</td>
                    <td className="py-2 px-4">{item.completedCount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-gray-500">
                    Belum ada data penjualan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
