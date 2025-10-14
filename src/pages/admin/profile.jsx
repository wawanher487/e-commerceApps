import React, { useEffect, useState, useRef } from "react";
import api from "../../utils/api";
import { IMAGE_URL_USER } from "../../config/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import defaultAvatar from "../../assets/default-avatar.png";

export default function Profile() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser?._id || storedUser?.id;
  const [user, setUser] = useState(null);

  // form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    image: null, // file
  });

  const [preview, setPreview] = useState(null); // preview selected file
  const [imageSrc, setImageSrc] = useState(null); // object URL fetched from server
  const objectUrlRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  // helper untuk revoke object URL
  const revokeObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        toast.error("User ID tidak ditemukan. Silakan login ulang.");
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/user/${userId}`);
        const userData = res.data.user || res.data;
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          image: null,
        });

        // jika ada profileImage, fetch gambar dengan token di header
        if (userData.profileImage) {
          await fetchProfileImage(userData.profileImage);
        } else {
          setImageSrc(null);
        }
      } catch (err) {
        console.error("Gagal memuat profil:", err);
        toast.error("Gagal memuat profil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      // cleanup object URL
      revokeObjectUrl();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // fetch image with Authorization header and create object URL
  const fetchProfileImage = async (filename) => {
    try {
      // revoke previous
      revokeObjectUrl();
      setImageSrc(null);

      const token = localStorage.getItem("token");
      const url = `${IMAGE_URL_USER}/${filename}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.warn("Gagal fetch gambar:", res.status);
        setImageSrc(null);
        return;
      }

      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      objectUrlRef.current = objUrl;
      setImageSrc(objUrl);
    } catch (err) {
      console.error("Error fetchProfileImage:", err);
      setImageSrc(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // set file to formData
    setFormData((prev) => ({ ...prev, image: file }));

    // revoke old preview/objectURL
    if (objectUrlRef.current) {
      revokeObjectUrl();
    }
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPreview(url);

    // Note: we keep imageSrc (server image) untouched until user saves
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const body = new FormData();
      body.append("name", formData.name);
      body.append("email", formData.email);
      if (formData.image) body.append("profileImage", formData.image);

      // gunakan PATCH sesuai backend
      const res = await api.patch("/user/profile", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = res.data.user || res.data;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Jika ada gambar baru, refresh gambar dari server
      if (updatedUser.profileImage) {
        if (preview) {
          URL.revokeObjectURL(preview);
          setPreview(null);
        }
        await fetchProfileImage(updatedUser.profileImage);
      }

      // reset image file in form
      setFormData((p) => ({ ...p, image: null }));

      console.log("✅ update success:", res);
      alert("Profil berhasil diperbarui!");
      toast.success("Profil berhasil diperbarui!", { autoClose: 2500 });
    } catch (err) {
      console.log("❌ error update:", err);
      toast.error("Cek toast di error block");

      // Ambil pesan validasi dari backend (misalnya email duplikat)
      const msg = err.response?.data?.message || "❌ Gagal memperbarui profil";

      // Jika email sudah digunakan, kasih pesan khusus
      if (
        msg.toLowerCase().includes("email") &&
        msg.toLowerCase().includes("sudah")
      ) {
        alert("Email ini sudah digunakan oleh pengguna lain!!");
        toast.warn("Email ini sudah digunakan oleh pengguna lain!");
      } else {
        alert(msg);
        toast.error(msg);
      }
      //Kembalikan form ke data lama agar tetap sinkron dengan database
      if (user) {
        setFormData({
          name: user.name || "",
          email: user.email || "",
          image: null,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPwdLoading(true);
    try {
      await api.patch("/user/password", passwordData);
      setPasswordData({ currentPassword: "", newPassword: "" });
      toast.success("Password berhasil diperbarui!");
    } catch (err) {
      console.error("Gagal update password:", err);
      const msg = err.response?.data?.message || "Gagal memperbarui password";
      toast.error(msg);
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Memuat profil...
      </div>
    );

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Profil tidak ditemukan
      </div>
    );

  // choose src: preview (local file) > fetched image (object URL) > placeholder
  const displaySrc = preview || imageSrc || defaultAvatar;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Profil Saya</h1>

        {/* FOTO PROFIL */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={displaySrc}
            alt="User"
            className="w-32 h-32 rounded-full object-cover border"
          />
          <label className="mt-3 cursor-pointer text-blue-600 hover:underline">
            Ganti Foto
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* FORM PROFIL */}
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700">Nama</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>

        <hr className="my-8" />

        {/* FORM PASSWORD */}
        <h2 className="text-xl font-semibold mb-4">Ubah Password</h2>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700">
              Password Saat Ini
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData((p) => ({
                  ...p,
                  currentPassword: e.target.value,
                }))
              }
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700">
              Password Baru
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData((p) => ({ ...p, newPassword: e.target.value }))
              }
              className="w-full border rounded-lg p-2"
            />
          </div>
          <button
            type="submit"
            disabled={pwdLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-300"
          >
            {pwdLoading ? "Menyimpan..." : "Ubah Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
