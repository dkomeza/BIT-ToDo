import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Dashboard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/context/AuthContext";

const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
            </Route>

            {/* Authentication routes */}
            <Route
              path="/login"
              element={
                <Suspense>
                  <Login />
                </Suspense>
              }
            />
            <Route
              path="/signup"
              element={
                <Suspense>
                  <Signup />
                </Suspense>
              }
            />

            {/* Complementary routes */}
            <Route path="/404" element={<h1>Not Found</h1>} />
            <Route path="*" element={<Navigate to={"/404"} replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
