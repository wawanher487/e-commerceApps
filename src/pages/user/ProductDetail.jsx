import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../utils/api";
import { IMAGE_URL_PRODUCT } from "../../config/api";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const product = res.data.product;
        setProduct(product);

        //ambil gambar dengan token
        if (product.image) {
          const token = localStorage.getItem("token");
          const imageRes = await fetch(
            `${IMAGE_URL_PRODUCT}/${product.image}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (imageRes.ok) {
            const blob = await imageRes.blob();
            const url = URL.createObjectURL(blob);
            setImageUrl(url);
          } else {
            console.error("Gagal ambil gambar", imageRes.status);
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

  if (!product)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Memuat detail produk...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Link
        to="/user/dashboard"
        className="text-blue-600 hover:underline inline-block mb-4"
      >
        ← Kembali ke Dashboard
      </Link>

      <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto">
        <img
          src={imageUrl || "https://via.placeholder.com/200x150?text=No+Image"}
          alt={product.name}
          className="w-full h-full object-cover rounded-lg"
        />

        <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
        <p className="text-gray-700 mb-4">{product.description}</p>
        <p className="text-xl font-semibold text-blue-600 mb-4">
          Rp {product.price.toLocaleString("id-ID")}
        </p>
        <p className="text-sm text-gray-500">
          Ditambahkan pada: {new Date(product.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
