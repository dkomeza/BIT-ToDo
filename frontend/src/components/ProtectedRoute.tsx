import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const { user } = useAuth();
  return <>{user ? <Outlet /> : <Navigate to="/login" replace />}</>;
}

export default ProtectedRoute;
