import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function OrderListPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/admin");
      setOrders(res.data.orders);
    } catch (err) {
      toast.error("Gagal memuat data order");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      toast.success("Status order diperbarui!");
      fetchOrders();
    } catch (err) {
      toast.error("Gagal mengubah status order");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Apakah yakin ingin menghapus order ini?")) {
      try {
        await api.delete(`/admin/order/${id}`);
        toast.success("Order berhasil dihapus!");
        fetchOrders();
      } catch (err) {
        toast.error("Gagal menghapus order");
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">📦 Daftar Order</h1>

      <div className="overflow-x-auto bg-white shadow-md rounded-xl">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-gray-800 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Nama Pembeli</th>
              <th className="px-4 py-3">Produk</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b">
                <td className="px-4 py-3">
                  {order.userId?.name || "Tidak diketahui"}
                </td>
                <td className="px-4 py-3">
                  {order.items.map((item) => (
                    <div key={item._id}>
                      {item.nameAtOrder} x{item.quantity}
                    </div>
                  ))}
                </td>
                <td className="px-4 py-3 font-semibold">
                  Rp {order.total.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                    className="border rounded-md px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="processed">Processed</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  {new Date(order.createdAt).toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleDelete(order._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}
