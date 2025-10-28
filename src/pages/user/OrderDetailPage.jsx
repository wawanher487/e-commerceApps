import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../../utils/api";
import { IMAGE_URL_PRODUCT } from "../../config/api";
import defaultProduct from "../../assets/default-product.png";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.order);
    } catch (err) {
      console.error("Gagal mengambil detail pesanan:", err);
      alert("Gagal mengambil detail pesanan");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Memuat detail pesanan...
      </div>
    );

  if (!order)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Pesanan tidak ditemukan
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-3xl mx-auto">
      {/* Tombol kembali */}
      <div className="mb-6">
        <Link
          to="/user/orders"
          className="inline-flex items-center gap-2 text-gray-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Kembali ke Riwayat Pesanan</span>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        Detail Pesanan #{order._id.slice(-6).toUpperCase()}
      </h1>

      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <p className="text-gray-600">
            Status:{" "}
            <span className="font-semibold text-blue-600">{order.status}</span>
          </p>
          <p className="text-gray-500 text-sm">
            Tanggal: {new Date(order.createdAt).toLocaleString("id-ID")}
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {order.items.map((item) => (
            <div key={item._id} className="flex items-center gap-4 py-3">
              <img
                src={
                  item.productId?.image
                    ? `${IMAGE_URL_PRODUCT}/${item.productId.image}`
                    : defaultProduct
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

        <div className="mt-6 text-right">
          <h3 className="text-xl font-semibold text-gray-800">
            Total: Rp {order.total.toLocaleString("id-ID")}
          </h3>
        </div>
      </div>
    </div>
  );
}
