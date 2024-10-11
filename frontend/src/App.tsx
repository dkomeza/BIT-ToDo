import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Authentication routes */}
          <Route path="/login" element={<h1>Login</h1>} />
          <Route path="/register" element={<h1>Register</h1>} />

          {/* Complementary routes */}
          <Route path="/404" element={<h1>Not Found</h1>} />
          <Route path="*" element={<Navigate to={"/404"} replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
