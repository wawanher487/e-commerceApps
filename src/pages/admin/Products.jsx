import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import defaultProduct from "../../assets/default-product.png";
import { IMAGE_URL_PRODUCT } from "../../config/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    image: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const token = localStorage.getItem("token");

  // 🔹 Fetch semua produk
  const fetchProducts = async () => {
    setFetching(true);
    try {
      const res = await api.get("/products", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const productsData = res.data.products || [];
      setProducts(productsData);

      // 🔹 Fetch gambar satu per satu (dengan token)
      for (const product of productsData) {
        if (product.image) {
          try {
            const imageRes = await fetch(
              `${IMAGE_URL_PRODUCT}/${product.image}`,
              {
                headers: { Authorization: `Bearer ${token}` },
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
          } catch (err) {
            console.error("Gagal memuat gambar:", err);
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat produk");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔹 Handle input
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // 🔹 Tambah / update produk
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("description", form.description);
    if (form.image) formData.append("image", form.image);

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Produk berhasil diperbarui!");
        toast.success("Produk berhasil diperbarui!");
      } else {
        await api.post("/products", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Produk berhasil ditambahkan!");
        toast.success("Produk berhasil ditambahkan!");
      }
      setForm({ name: "", price: "", description: "", image: null });
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan produk");
      toast.error("Gagal menyimpan produk");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Hapus produk
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus produk ini?")) return;
    try {
      await api.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Data Berhasil dihapus!!");
      toast.success("Produk berhasil dihapus!");
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus produk");
    }
  };

  // 🔹 Edit produk
  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      price: product.price,
      description: product.description || "",
      image: null,
    });
  };

  return (
    <div className="p-6">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Manajemen Produk</h1>

      {/* Form tambah / edit produk */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-4 mb-6"
      >
        <h2 className="text-lg font-semibold mb-3">
          {editingId ? "Edit Produk" : "Tambah Produk"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Nama Produk"
            value={form.name}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Harga"
            value={form.price}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
          <textarea
            name="description"
            placeholder="Deskripsi"
            value={form.description}
            onChange={handleChange}
            className="border rounded p-2 col-span-2"
          />
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {loading
            ? "Menyimpan..."
            : editingId
            ? "Perbarui Produk"
            : "Tambah Produk"}
        </button>
      </form>

      {/* Tabel produk */}
      <div className="bg-white shadow-md rounded-lg p-4 overflow-x-auto">
        {fetching ? (
          <p className="text-gray-500 text-center">Memuat data produk...</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">Gambar</th>
                <th className="p-2">Nama</th>
                <th className="p-2">Harga</th>
                <th className="p-2">Deskripsi</th>
                <th className="p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(products) && products.length > 0 ? (
                products.map((p) => (
                  <tr key={p._id} className="border-t">
                    <td className="p-2">
                      <img
                        src={imageUrls[p._id] || defaultProduct}
                        onError={(e) => (e.target.src = defaultProduct)}
                        alt={p.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="p-2">{p.name}</td>
                    <td className="p-2">Rp {p.price.toLocaleString()}</td>
                    <td className="p-2">{p.description || "-"}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-gray-500">
                    Tidak ada produk
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
