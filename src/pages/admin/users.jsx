import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import defaultUser from "../../assets/default-avatar.png";
import { IMAGE_URL_USER } from "../../config/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    image: null,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [passwordId, setPasswordId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    setFetching(true);
    try {
      const res = await api.get("/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const usersData = res.data.users || [];
      setUsers(usersData);

      // Ambil gambar user satu-satu
      for (const user of usersData) {
        if (user.profileImage) {
          try {
            const imageRes = await fetch(
              `${IMAGE_URL_USER}/${user.profileImage}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (imageRes.ok) {
              const blob = await imageRes.blob();
              const imageUrl = URL.createObjectURL(blob);
              setImageUrls((prev) => ({ ...prev, [user._id]: imageUrl }));
            }
          } catch (err) {
            console.error("Gagal memuat gambar: ", err);
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat users");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    // reset form bersih saat pertama kali masuk halaman
    setForm({
      name: "",
      email: "",
      password: "",
      role: "",
      image: null,
    });
    fetchUsers();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      email: "",
      password: "",
      role: "",
      image: null,
    });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Nama dan email wajib diisi!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Format email tidak valid!");
      return;
    }

    if (!editingId && !form.password.trim()) {
      toast.error("Password wajib diisi saat menambah user baru!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("role", form.role);
    if (!editingId) {
      formData.append("password", form.password);
    }
    if (form.image) formData.append("profileImage", form.image);

    try {
      if (editingId) {
        await api.patch(`/admin/user/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("User berhasil diperbarui!");
      } else {
        await api.post("/admin/user", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("User berhasil ditambahkan!");
      }

      resetForm();
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan user");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus user ini?")) return;
    try {
      await api.delete(`/admin/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User berhasil dihapus!");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus user");
    }
  };

  const handleEdit = (user) => {
    setEditingId(user._id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
      password: "",
      image: null,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordId) return;
    try {
      await api.patch(`/admin/password/${passwordId}`, passwordForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Password berhasil diperbarui!");
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      console.error(err);
      toast.error("Gagal memperbarui password");
    }
  };

  return (
    <div className="p-6">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Manajemen User</h1>

      {/* Form tambah / edit user */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-4 mb-6"
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">
            {editingId ? "Edit User" : "Tambah User"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
            >
              + Tambah User Baru
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Nama"
            value={form.name}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
          {!editingId && (
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="border rounded p-2"
              required
            />
          )}
          <input
            type="text"
            name="role"
            placeholder="Role"
            value={form.role}
            onChange={handleChange}
            className="border rounded p-2"
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
            ? "Perbarui User"
            : "Tambah User"}
        </button>
      </form>

      {/* Tabel User */}
      <div className="bg-white shadow-md rounded-lg p-4 overflow-x-auto">
        {fetching ? (
          <p className="text-gray-500 text-center">Memuat data User...</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">Gambar</th>
                <th className="p-2">Nama</th>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u._id} className="border-t">
                    <td className="p-2">
                      <img
                        src={imageUrls[u._id] || defaultUser}
                        onError={(e) => (e.target.src = defaultUser)}
                        alt={u.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="p-2">{u.name}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.role || "-"}</td>
                    <td className="p-2 flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleEdit(u)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setPasswordId(u._id);
                          setShowPasswordModal(true);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                      >
                        Ubah Password
                      </button>
                      <button
                        onClick={() => handleDelete(u._id)}
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
                    Tidak ada user
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal ubah password */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-3">Ubah Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <input
                type="password"
                name="currentPassword"
                placeholder="Password Lama"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                className="border rounded p-2 w-full"
                required
              />
              <input
                type="password"
                name="newPassword"
                placeholder="Password Baru"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                className="border rounded p-2 w-full"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
