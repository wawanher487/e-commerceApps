import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;

  if (!token || !userRole) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  return children;
}
