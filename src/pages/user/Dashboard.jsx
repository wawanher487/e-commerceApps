import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { Link } from "react-router-dom";
import { IMAGE_URL_PRODUCT } from "../../config/api";
import defaultProduct from "../../assets/default-product.png";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        const productsData = res.data.products;
        setProducts(productsData);

        // Ambil semua gambar dengan token
        for (const product of productsData) {
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
              const imageUrl = URL.createObjectURL(blob);
              setImageUrls((prev) => ({
                ...prev,
                [product._id]: imageUrl,
              }));
            }
          }
        }
      } catch (err) {
        console.error("Gagal mengambil produk:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Memuat produk...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        🛍️ Daftar Produk
      </h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-4 flex flex-col"
          >
            <div className="aspect-[4/3] w-full mb-3">
              <img
                src={imageUrls[product._id] || defaultProduct}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              {product.name}
            </h2>
            <p className="text-gray-600 text-sm flex-grow">
              {product.description.length > 60
                ? product.description.substring(0, 60) + "..."
                : product.description}
            </p>
            <p className=" text-bold-600 font-semibold">
              stock : {product.stock}
            </p>
            <p className="mt-2 text-blue-600 font-semibold">
              Rp {product.price.toLocaleString("id-ID")}
            </p>

            <Link
              to={`/user/product/${product._id}`}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg transition"
            >
              Lihat Detail
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
