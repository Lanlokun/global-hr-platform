import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem("token");

  let user = null;
  try {
    const raw = localStorage.getItem("user");
    user = raw ? JSON.parse(raw) : null;
  } catch (e) {
    user = null;
  }

  const validRoles = ["admin", "employer", "candidate"];

  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If user object is malformed or has an unexpected role, clear auth and send to login
  if (!user || !user.role || !validRoles.includes(user.role)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is set, enforce it
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;