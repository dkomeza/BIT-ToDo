import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Dashboard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";

import { lazy, Suspense } from "react";
import Layout from "./pages/Layout";
import List from "./pages/List";

const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/:slug" element={<List />} />
              </Route>
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
