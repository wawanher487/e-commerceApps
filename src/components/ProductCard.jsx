// src/components/ProductCard.jsx
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <div className="border rounded-xl shadow p-4 hover:shadow-lg transition">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="rounded-xl mb-3 w-full h-40 object-cover"
      />
      <h2 className="text-lg font-semibold">{product.name}</h2>
      <p className="text-gray-500 text-sm mb-2">{product.category}</p>
      <p className="font-bold mb-3">Rp {product.price}</p>
      <Link
        to={`/user/products/${product.id}`}
        className="text-blue-600 hover:underline"
      >
        Lihat Detail
      </Link>
    </div>
  );
}
