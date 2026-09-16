import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Project from "./routes/Project";
import Login from "./routes/Login";
import Register from "./routes/Register";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/project" element={<Project />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
