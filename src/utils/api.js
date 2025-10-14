// src/utils/api.js
import axios from "axios";
import { API_URL } from "../config/api";

const api = axios.create({
  baseURL: API_URL,
});

// otomatis tambahkan token ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tangani error dari server
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Jika token expired → arahkan ke login
      if (error.response.status === 401) {
        alert("Sesi Anda telah berakhir, silakan login kembali.");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      // Jika token invalid atau ditolak
      if (error.response.status === 403) {
        alert("Token tidak valid, silakan login ulang.");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }
    }

    return Promise.reject(error);
  }
);

// //Tangani token expired (401) dan refresh token otomatis
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     //jika token expired dan belum di-retry
//     if (
//       error.response &&
//       (error.response.status === 401 || error.response.status === 403) &&
//       !originalRequest._retry
//     ) {
//       originalRequest._retry = true;

//       const refreshtoken = localStorage.getItem("refreshToken");
//       if (!refreshtoken) {
//         console.warn("Refresh tiken tidak ditemukan, arahkan ke login");
//         localStorage.clear();
//         window.location.href = "/login";
//         return Promise.reject(error);
//       }

//       try {
//         //minta token baru ke backen
//         const { data } = await axios.post(`${API_URL}/auth/refresh`, {
//           refreshToken: refreshtoken,
//         });

//         //simpan token baru
//         localStorage.setItem("token", data.token);

//         //update header Authorization
//         api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
//         originalRequest.headers["Authorization"] = `Bearer ${data.token}`;

//         //ulang request yang gagal
//         return api(originalRequest);
//       } catch (refreshError) {
//         console.error("Gagal memperbarui token: ", refreshError);
//         localStorage.clear();
//         window.location.href = "/login";
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export default api;
