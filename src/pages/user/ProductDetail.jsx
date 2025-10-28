import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../../utils/api";
import { IMAGE_URL_PRODUCT } from "../../config/api";
import defaultProduct from "../../assets/default-product.png";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const product = res.data.product;
        setProduct(product);

        if (product.image) {
          const token = localStorage.getItem("token");
          const imageRes = await fetch(
            `${IMAGE_URL_PRODUCT}/${product.image}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (imageRes.ok) {
            const blob = await imageRes.blob();
            const url = URL.createObjectURL(blob);
            setImageUrl(url);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil detail produk:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Silakan login terlebih dahulu!");
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id, quantity }),
      });

      const data = await res.json();
      alert(
        data.message ||
          (res.ok
            ? "Berhasil menambahkan ke keranjang"
            : "Gagal menambahkan ke keranjang")
      );
    } catch (err) {
      console.error("Gagal menambahkan ke keranjang:", err);
      alert("Terjadi kesalahan saat menambahkan ke keranjang");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Memuat detail produk...
      </div>
    );

  if (!product)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Produk tidak ditemukan
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/user/Dashboard"
          className="inline-flex items-center gap-2 text-gray-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 mb-4"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Kembali ke Dashboard</span>
        </Link>
        <div className="bg-white rounded-2xl shadow-lg p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Gambar Produk */}
          <div className="flex justify-center items-center">
            <img
              src={imageUrl || defaultProduct}
              alt={product.name}
              className="w-full max-w-md h-auto object-contain rounded-xl border border-gray-200 shadow-sm"
            />
          </div>

          {/* Detail Produk */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              {product.name}
            </h1>
            <p className="text-gray-600 leading-relaxed mb-4">
              {product.description}
            </p>

            <div className="flex items-center gap-4 mb-3">
              <p className="text-lg font-medium text-gray-700">
                Stok:{" "}
                <span className="font-semibold text-green-600">
                  {product.stock}
                </span>
              </p>
            </div>

            <p className="text-2xl font-extrabold text-blue-600 mb-4">
              Rp {product.price.toLocaleString("id-ID")}
            </p>

            <p className="text-sm text-gray-500 mb-6">
              Ditambahkan pada:{" "}
              <span className="font-medium text-gray-700">
                {new Date(product.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </p>

            {/* Input jumlah + tombol */}
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="border border-gray-300 rounded-lg p-2 w-20 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />

              <button
                onClick={handleAddToCart}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md transition-transform transform hover:scale-105 active:scale-95"
              >
                🛒 Tambah ke Keranjang
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
