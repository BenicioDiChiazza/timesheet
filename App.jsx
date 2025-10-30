import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Menu from "./pages/Menu";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Dashboard from "./pages/Dashboard";
import { supabaseService } from "./pages/supabaseService";
import "./App.css";

function App() {
  const [usuario, setUsuario] = useState({ nombre: "", cargo: "" });
  const [proyectos, setProyectos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Cargar datos iniciales desde Supabase
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        console.log('📦 Cargando datos iniciales...');
        const [proyectosData, empleadosData] = await Promise.all([
          supabaseService.getProyectos(),
          supabaseService.getEmpleados()
        ]);
        
        setProyectos(proyectosData);
        setEmpleados(empleadosData);
        console.log('✅ Datos cargados:', { 
          proyectos: proyectosData.length, 
          empleados: empleadosData.length 
        });
      } catch (error) {
        console.error('❌ Error cargando datos iniciales:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  const globalProps = {
    usuario, setUsuario,
    proyectos, setProyectos,
    empleados, setEmpleados,
  };

  const showBar = usuario.nombre;

  if (cargando) {
    return (
      <div className="app-container">
        <div className="header">Sistema de Horas Trabajadas</div>
        <div className="card" style={{ maxWidth: 420, margin: "0 auto", textAlign: "center" }}>
          <h2>Cargando aplicación...</h2>
          <p>Por favor espera mientras cargamos los datos.</p>
        </div>
      </div>
    );
  }

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
        <Route path="/registro" element={<Registro setUsuario={setUsuario} setEmpleados={setEmpleados} />} />
        <Route path="/dashboard" element={usuario.nombre ? <Dashboard {...globalProps} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;