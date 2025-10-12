import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// User Pages
import UserDashboard from "./pages/user/Dashboard";
import ProductDetailUser from "./pages/user/ProductDetail";
import UserProfile from "./pages/user/Profile";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/*Halaman User */}
        <Route
          path="/user"
          element={
            <ProtectedRoute role="user">
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="product/:id" element={<ProductDetailUser />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* Admin Area */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          {/* <Route path="users" element={<Users />} />
          <Route path="products" element={<Products />} />
          <Route path="profile" element={<AdminProfile />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
