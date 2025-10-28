import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { IMAGE_URL_PRODUCT } from "../../config/api";
import defaultProduct from "../../assets/default-product.png";

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      setCart(res.data.cart);
    } catch (err) {
      console.error("Gagal mengambil cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      if (newQuantity < 1) return;
      await api.patch(`/cart/${itemId}`, { quantity: newQuantity });
      fetchCart();
    } catch (err) {
      console.error("Gagal update quantity:", err);
      alert("Gagal mengubah jumlah produk");
    }
  };

  const removeItem = async (itemId) => {
    if (!confirm("Yakin ingin menghapus produk ini dari keranjang?")) return;
    try {
      await api.delete(`/cart/${itemId}`);
      fetchCart();
    } catch (err) {
      console.error("Gagal menghapus produk:", err);
      alert("Terjadi kesalahan saat menghapus produk");
    }
  };

  const handleCheckout = async () => {
    if (!confirm("Yakin ingin melakukan checkout semua produk di keranjang?"))
      return;

    try {
      const res = await api.post("/orders/checkout");
      alert("Checkout berhasil!");
      // Redirect ke halaman riwayat pesanan
      window.location.href = "/user/orders";
    } catch (err) {
      console.error("Gagal checkout:", err);
      alert(err.response?.data?.message || "Terjadi kesalahan saat checkout");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Memuat keranjang...
      </div>
    );
  }

  if (!cart.items.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <p className="text-lg">Keranjang kamu masih kosong 😔</p>
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
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        🛒 Keranjang Belanja
      </h1>

      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-5xl mx-auto">
        <div className="divide-y divide-gray-200">
          {cart.items.map((item) => (
            <div
              key={item._id}
              className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={
                    item.productId?.image
                      ? `${IMAGE_URL_PRODUCT}/${item.productId.image}`
                      : defaultProduct
                  }
                  onError={(e) => (e.target.src = defaultProduct)}
                  alt={item.productId?.name || item.nameAtAdded}
                  className="w-20 h-20 object-cover rounded-lg"
                />

                <div>
                  <p className="font-semibold text-lg text-gray-800">
                    {item.productId?.name || item.nameAtAdded}
                  </p>
                  <p className="text-gray-500">
                    Rp {item.priceAtAdded.toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Stok: {item.productId?.stock ?? "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto gap-3">
                <div className="flex items-center gap-2">
                  <button
                    className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    readOnly
                    className="w-16 text-center border rounded-lg py-1"
                  />
                  <button
                    className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <p className="text-blue-600 font-semibold w-28 text-right">
                  Rp{" "}
                  {(item.priceAtAdded * item.quantity).toLocaleString("id-ID")}
                </p>

                <button
                  className="bg-red-600 text-white px-2 py-2 rounded-lg hover:bg-red-700 text-sm"
                  onClick={() => removeItem(item._id)}
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-8 border-t pt-6">
          <h2 className="text-xl font-bold text-gray-700">
            Total:{" "}
            <span className="text-blue-600">
              Rp {cart.total.toLocaleString("id-ID")}
            </span>
          </h2>

          <button
            onClick={handleCheckout}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mt-4 md:mt-0"
          >
            Lanjut ke Checkout →
          </button>
        </div>
      </div>
    </div>
  );
}
