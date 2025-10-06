import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Menu from "./pages/Menu";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  const [usuario, setUsuario] = useState({ nombre: "", cargo: "" });
  const [proyectos, setProyectos] = useState([
    { nombre: "Proyecto A", estado: "Desarrollo" },
    { nombre: "Proyecto B", estado: "Testeo" },
  ]);
  const [empleados, setEmpleados] = useState([
    { nombre: "Juan Pérez", email: "juan@mail.com", proyecto: "Proyecto A" },
    { nombre: "Ana Gómez", email: "ana@mail.com", proyecto: "Proyecto B" },
  ]);

  const globalProps = {
    usuario, setUsuario,
    proyectos, setProyectos,
    empleados, setEmpleados,
  };

  const showBar = usuario.nombre;

  return (
    <div className="app-container">
      {showBar && (
        <div style={{
          width: "100%",
          background: "#ede9fe",
          color: "#7c3aed",
          padding: "10px 0",
          marginBottom: 18,
          borderRadius: 10,
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "1.1rem",
          letterSpacing: 1
        }}>
          {usuario.nombre ? `${usuario.nombre} - ${usuario.cargo.charAt(0).toUpperCase() + usuario.cargo.slice(1)}` : ""}
        </div>
      )}
      <div className="header">Sistema de Horas Trabajadas</div>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/login" element={<Login setUsuario={setUsuario} />} />
        <Route path="/registro" element={<Registro proyectos={proyectos} setUsuario={setUsuario} setEmpleados={setEmpleados} />} />
        <Route path="/dashboard" element={usuario.nombre ? <Dashboard {...globalProps} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;