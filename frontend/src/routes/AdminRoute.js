import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");

  let user = null;
  try {
    const raw = localStorage.getItem("user");
    user = raw ? JSON.parse(raw) : null;
  } catch (e) {
    user = null;
  }

  const validRoles = ["admin", "employer", "candidate"];

  // If there's no token or user is malformed, clear auth and send to login
  if (!token || !user || !user.role || !validRoles.includes(user.role)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  // Non-admin users should not access admin routes
  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AdminRoute;