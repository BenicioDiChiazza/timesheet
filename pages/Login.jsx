import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabaseService } from "./supabaseService";

function Login({ setUsuario }) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      setError("Por favor ingresa email y contraseña");
      return;
    }

    setCargando(true);
    setError("");

    try {
      console.log('🔐 Intentando login...', { email: loginEmail });
      
      const empleado = await supabaseService.loginEmpleado(loginEmail, loginPassword);
      
      console.log('✅ Login exitoso:', empleado);
      
      setUsuario({ 
        nombre: `${empleado.nombre} ${empleado.apellido}`, 
        cargo: empleado.admin ? "administrador" : "empleado",
        id: empleado.id,
        email: empleado.email,
        proyecto: empleado.proyecto
      });
      
      alert(`¡Bienvenido ${empleado.nombre} ${empleado.apellido}!`);
      navigate("/dashboard");
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      if (error.message.includes('No rows found')) {
        setError("Email o contraseña incorrectos");
      } else {
        setError("Error al iniciar sesión: " + error.message);
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h2>Iniciar Sesión</h2>
      
      {error && (
        <div style={{ 
          padding: "12px", 
          backgroundColor: "#fef2f2", 
          border: "1px solid #fecaca",
          borderRadius: "8px",
          color: "#dc2626",
          marginBottom: "16px",
          fontSize: "0.9rem"
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={loginEmail}
          onChange={e => setLoginEmail(e.target.value)}
          required
          disabled={cargando}
        />
        <input 
          type="password" 
          className="input" 
          placeholder="Contraseña" 
          value={loginPassword}
          onChange={e => setLoginPassword(e.target.value)}
          required
          disabled={cargando}
        />
        
        <button 
          className="button" 
          type="submit"
          disabled={cargando}
          style={{ 
            opacity: cargando ? 0.6 : 1,
            cursor: cargando ? "not-allowed" : "pointer"
          }}
        >
          {cargando ? "Iniciando sesión..." : "Entrar"}
        </button>
        
        <button
          className="button button-green"
          type="button"
          style={{ marginTop: 8 }}
          onClick={() => navigate("/")}
          disabled={cargando}
        >
          Volver al Inicio
        </button>
      </form>

      <div style={{ 
        marginTop: "24px", 
        paddingTop: "16px", 
        borderTop: "1px solid #eee",
        textAlign: "center" 
      }}>
        <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>
          ¿No tienes cuenta?{" "}
          <button 
            type="button"
            onClick={() => navigate("/registro")}
            style={{
              background: "none",
              border: "none",
              color: "#7c3aed",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "0.9rem"
            }}
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;