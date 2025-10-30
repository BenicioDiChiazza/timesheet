import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabaseService, testConnection } from "./supabaseService";

function Registro({ setUsuario, setEmpleados }) {
  const [registro, setRegistro] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    proyecto: "",
    admin: false
  });
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Cargar proyectos al montar el componente
  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        console.log('🔄 Iniciando carga de proyectos...');
        
        // Primero probar la conexión
        const conexionExitosa = await testConnection();
        if (!conexionExitosa) {
          throw new Error('No se pudo conectar a la base de datos');
        }

        // Luego cargar proyectos
        const proyectosData = await supabaseService.getProyectos();
        setProyectos(proyectosData);
        
        // Si hay proyectos, seleccionar el primero por defecto
        if (proyectosData.length > 0) {
          setRegistro(reg => ({ ...reg, proyecto: proyectosData[0].nombre }));
        }
        
        setCargando(false);
        setError(null);
      } catch (error) {
        console.error('Error cargando proyectos:', error);
        setError(error.message);
        setCargando(false);
      }
    };

    cargarProyectos();
  }, []);

  const handleRegistro = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!registro.nombre || !registro.apellido || !registro.email || !registro.password) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    // Si no hay proyectos, no requerir selección de proyecto
    if (proyectos.length > 0 && !registro.proyecto) {
      alert("Por favor selecciona un proyecto");
      return;
    }

    try {
      // Insertar en Supabase
      const nuevoEmpleado = await supabaseService.addEmpleado({
        nombre: registro.nombre,
        apellido: registro.apellido,
        email: registro.email,
        password: registro.password,
        proyecto: proyectos.length > 0 ? registro.proyecto : 'Sin proyecto asignado',
        admin: registro.admin,
        horas: 0
      });

      // Actualizar estado local
      setEmpleados(emps => [...emps, {
        nombre: `${registro.nombre} ${registro.apellido}`,
        email: registro.email,
        proyecto: registro.proyecto,
        admin: registro.admin
      }]);
      
      setUsuario({ 
        nombre: `${registro.nombre} ${registro.apellido}`, 
        cargo: registro.admin ? "administrador" : "empleado",
        id: nuevoEmpleado.id,
        email: registro.email
      });
      
      alert("¡Cuenta creada exitosamente!");
      navigate("/dashboard");
    } catch (error) {
      console.error('Error registrando empleado:', error);
      alert('Error al crear la cuenta: ' + error.message);
    }
  };

  if (cargando) {
    return (
      <div className="card" style={{ maxWidth: 420, margin: "0 auto", textAlign: "center" }}>
        <h2>Cargando proyectos...</h2>
        <p>Conectando con la base de datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ maxWidth: 420, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ color: "#dc2626" }}>Error de Conexión</h2>
        <p>No se pudieron cargar los proyectos: {error}</p>
        <div style={{ marginTop: 16 }}>
          <button 
            className="button" 
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
          <button
            className="button button-green"
            style={{ marginTop: 8 }}
            onClick={() => navigate("/")}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h2>Crear Cuenta</h2>
      <form onSubmit={handleRegistro}>
        {/* Información personal */}
        <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #eee" }}>
          <h3 style={{ color: "#7c3aed", fontSize: "1rem", marginBottom: "16px" }}>Información Personal</h3>
          <input
            className="input"
            placeholder="Nombre"
            value={registro.nombre}
            onChange={e => setRegistro(reg => ({ ...reg, nombre: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Apellido"
            value={registro.apellido}
            onChange={e => setRegistro(reg => ({ ...reg, apellido: e.target.value }))}
            required
          />
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={registro.email}
            onChange={e => setRegistro(reg => ({ ...reg, email: e.target.value }))}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Contraseña"
            value={registro.password}
            onChange={e => setRegistro(reg => ({ ...reg, password: e.target.value }))}
            required
            minLength={6}
          />
        </div>

        {/* Tipo de usuario */}
        <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #eee" }}>
          <h3 style={{ color: "#7c3aed", fontSize: "1rem", marginBottom: "16px" }}>Tipo de Usuario</h3>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="radio"
                name="tipoUsuario"
                checked={!registro.admin}
                onChange={() => setRegistro(reg => ({ ...reg, admin: false }))}
              />
              <span>Empleado</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="radio"
                name="tipoUsuario"
                checked={registro.admin}
                onChange={() => setRegistro(reg => ({ ...reg, admin: true }))}
              />
              <span>Administrador</span>
            </label>
          </div>
        </div>

        {/* Selección de proyecto */}
        {proyectos.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ color: "#7c3aed", fontSize: "1rem", marginBottom: "16px" }}>Proyecto</h3>
            <select
              className="select"
              value={registro.proyecto}
              onChange={e => setRegistro(reg => ({ ...reg, proyecto: e.target.value }))}
              required
            >
              <option value="">Selecciona un proyecto</option>
              {proyectos.map((p, i) => (
                <option key={i} value={p.nombre}>
                  {p.nombre} {p.estado ? `- ${p.estado}` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Mostrar mensaje si no hay proyectos */}
        {proyectos.length === 0 && (
          <div style={{ 
            marginBottom: "24px",
            padding: "16px", 
            backgroundColor: "#fef3c7", 
            border: "1px solid #f59e0b",
            borderRadius: "8px",
            color: "#92400e"
          }}>
            <strong>No hay proyectos disponibles</strong>
            <p style={{ margin: "8px 0 0 0", fontSize: "0.9rem" }}>
              Puedes crear una cuenta sin proyecto asignado y un administrador te asignará uno después.
            </p>
          </div>
        )}

        {/* Botones */}
        <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
          <button 
            className="button" 
            type="submit"
          >
            Crear Cuenta
          </button>
          <button
            className="button button-green"
            type="button"
            onClick={() => navigate("/")}
          >
            Volver al Inicio
          </button>
        </div>
      </form>
    </div>
  );
}

export default Registro;