import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handlesubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      navigate("/login");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* kiri - gambar */}
      <div className="hidden md:flex w-1/2 bg-blue-50 items-center justify-center">
        <div className="text-center p-10">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3081/3081559.png"
            alt="shopping "
            className="w-80 mx-auto"
          />
          <h2 className="text-xl font semi-bold mt-4 text-gray-700">
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
            Buat Akun Anda
          </h2>

          <form onSubmit={handlesubmit}>
            <div className="mb-4">
              <input
                type="name"
                placeholder="Nama Lengkap"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
            >
              Register
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Login Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
