import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { IMAGE_URL_PRODUCT } from "../../config/api";
import defaultProduct from "../../assets/default-product.png";

export default function OrderListPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      const ordersData = res.data.orders || [];
      setOrders(ordersData);

      //ambil token dari localStorage
      const token = localStorage.getItem("token");
      const newImageUrls = {};

      // ambil gambar satu per satu dari setiap produk dalam pesanan
      for (const order of ordersData) {
        for (const item of order.items) {
          const product = item.productId;
          if (product?.image) {
            try {
              const imgRes = await fetch(
                `${IMAGE_URL_PRODUCT}/${product.image}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (imgRes.ok) {
                const blob = await imgRes.blob();
                newImageUrls[product._id] = URL.createObjectURL(blob);
              }
            } catch (imgErr) {
              console.error("Gagal memuat gambar:", imgErr);
            }
          }
        }
      }

      setImageUrls(newImageUrls);
    } catch (err) {
      console.error("Gagal mengambil pesanan:", err);
      alert("Gagal mengambil daftar pesanan");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Memuat daftar pesanan...
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <p className="text-lg">Belum ada pesanan 😔</p>
        <a
          href="/user/dashboard"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Belanja Sekarang
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-3 text-gray-800">
        📦 Riwayat Pesanan
      </h1>
      <Link
        to="/user/Dashboard"
        className="inline-flex items-center gap-2 text-gray-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 mb-4"
      >
        <ArrowLeft size={18} />
        <span className="font-medium">Kembali ke Dashboard</span>
      </Link>
      <div className="space-y-6 max-w-5xl mx-auto">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
          >
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h2 className="font-semibold text-lg text-gray-700">
                ID Pesanan: {order._id.slice(-6).toUpperCase()}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : order.status === "paid"
                    ? "bg-blue-100 text-blue-700"
                    : order.status === "shipped"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <div key={item._id} className="flex items-center gap-4 py-2">
                  <img
                    src={
                      imageUrls[item.productId?._id] ||
                      (item.productId?.image
                        ? `${IMAGE_URL_PRODUCT}/${item.productId.image}`
                        : defaultProduct)
                    }
                    onError={(e) => (e.target.src = defaultProduct)}
                    alt={item.productId?.name || item.nameAtOrder}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {item.productId?.name || item.nameAtOrder}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × Rp{" "}
                      {item.priceAtOrder.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-4">
              <p className="font-semibold text-gray-700">
                Total: Rp {order.total.toLocaleString("id-ID")}
              </p>
              <a
                href={`/user/orders/${order._id}`}
                className="text-blue-600 hover:underline"
              >
                Lihat Detail →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
