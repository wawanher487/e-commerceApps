import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { API_URL } from "../../config/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const handlesubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Simpan token & data user ke localStorage
        localStorage.setItem("token", data.accessToken || data.token);
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.user.role);

        // Arahkan ke dashboard sesuai role
        if (data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      } else {
        alert(data.message || "Login gagal!");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Terjadi kesalahan pada server");
    }
  };

  if (token && user?.role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return (
    <div className="flex min-h-screen">
      {/* kiri - gambar */}
      <div className="hidden md:flex w-1/2 bg-blue-50 items-center justify-center">
        <div className="text-center p-10">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3081/3081559.png"
            alt="shopping"
            className="w-80 mx-auto"
          />
          <h2 className="text-xl font-semibold mt-4 text-gray-700">
            Temukan Penawaran Terbaik
          </h2>
        </div>
      </div>

      {/* kanan - form login */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3081/3081559.png"
              alt="Logo"
              className="w-8 h-8 mr-2"
            />
            <h1 className="text-2xl font-bold text-gray-800">E-COMMERCE</h1>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-1">
            Masuk ke Akun Anda
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Lupa kata sandi?{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Klik di sini
            </a>
          </p>

          <form onSubmit={handlesubmit}>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <input
                type="password"
                placeholder="Kata Sandi"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center mb-6">
              <input type="checkbox" className="mr-2" />
              <label className="text-sm text-gray-600">Ingat Saya</label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
            >
              Masuk
            </button>
          </form>

          <div className="flex items-center my-6">
            <hr className="flex-1 border-gray-300" />
            <span className="mx-3 text-gray-400 text-sm">ATAU</span>
            <hr className="flex-1 border-gray-300" />
          </div>

          <div className="flex gap-3">
            <button className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-100">
              <i className="fa-brands fa-facebook text-blue-600 mr-2"></i>{" "}
              Facebook
            </button>
            <button className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-100">
              <i className="fa-brands fa-google text-red-500 mr-2"></i> Google
            </button>
          </div>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-medium hover:underline"
            >
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
