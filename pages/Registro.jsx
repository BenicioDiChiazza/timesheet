import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Registro({ proyectos, setUsuario, setEmpleados }) {
  const [registro, setRegistro] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    proyecto: proyectos[0]?.nombre || ""
  });
  const navigate = useNavigate();

  const handleRegistro = (e) => {
    e.preventDefault();
    setEmpleados(emps => [
      ...emps,
      {
        nombre: `${registro.nombre} ${registro.apellido}`,
        email: registro.email,
        proyecto: registro.proyecto
      }
    ]);
    setUsuario({ nombre: `${registro.nombre} ${registro.apellido}`, cargo: "empleado" });
    navigate("/dashboard");
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h2>Registrarse</h2>
      <form onSubmit={handleRegistro}>
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
        />
        <select
          className="select"
          value={registro.proyecto}
          onChange={e => setRegistro(reg => ({ ...reg, proyecto: e.target.value }))}
          required
        >
          {proyectos.map((p, i) => (
            <option key={i} value={p.nombre}>{p.nombre}</option>
          ))}
        </select>
        <button className="button" type="submit" style={{ marginTop: 8 }}>
          Crear Cuenta
        </button>
        <button
          className="button button-green"
          type="button"
          style={{ marginTop: 8 }}
          onClick={() => navigate("/")}
        >
          Volver
        </button>
      </form>
    </div>
  );
}

export default Registro;