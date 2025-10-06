import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setUsuario }) {
  const [loginNombre, setLoginNombre] = useState("");
  const [loginCargo, setLoginCargo] = useState("empleado");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setUsuario({ nombre: loginNombre, cargo: loginCargo });
    navigate("/dashboard");
  };

  return (
    <div className="card">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLogin}>
        <input
          className="input"
          placeholder="Nombre de usuario"
          value={loginNombre}
          onChange={e => setLoginNombre(e.target.value)}
          required
        />
        <select
          className="select"
          value={loginCargo}
          onChange={e => setLoginCargo(e.target.value)}
        >
          <option value="empleado">Empleado</option>
          <option value="administrador">Administrador</option>
        </select>
        <input type="password" className="input" placeholder="Contraseña" required />
        <button className="button" type="submit">
          Entrar
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

export default Login;