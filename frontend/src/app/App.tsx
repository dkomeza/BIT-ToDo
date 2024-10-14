import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Dashboard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";

import { lazy, Suspense } from "react";

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
                // TODO: Add a loading spinner
                <Suspense fallback={<h1>Loading...</h1>}>
                  <Login />
                </Suspense>
              }
            />
            <Route
              path="/signup"
              element={
                <Suspense fallback={<h1>Loading...</h1>}>
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
