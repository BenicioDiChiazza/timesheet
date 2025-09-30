import { useState, useEffect } from "react";
import { FaHome, FaClock, FaChartBar, FaUser, FaUserShield, FaUsers, FaClipboardList, FaMoneyBillWave, FaProjectDiagram } from "react-icons/fa";
import "./App.css";

// Imágenes de ejemplo para el carrusel (relacionadas a manejo de proyectos)
const imagenesCarrusel = [
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80", // equipo en reunión
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80", // planificación en pizarra
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80", // trabajo colaborativo
  "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=600&q=80", // gestión de tareas
];

function App() {
  const [view, setView] = useState("inicio");
  const [adminTab, setAdminTab] = useState("reportes");
  const [salarios, setSalarios] = useState({
    "Juan Pérez": 500,
    "Ana Gómez": 450,
  });
  const [usuario, setUsuario] = useState({ nombre: "", cargo: "" });
  const [proyectos, setProyectos] = useState([
    { nombre: "Proyecto A", estado: "Desarrollo" },
    { nombre: "Proyecto B", estado: "Testeo" },
  ]);
  const estadosProyecto = [
    "Relevamiento",
    "Analisis",
    "Diseño",
    "Desarrollo",
    "Testeo",
    "Mantenimiento",
    "Completado"
  ];
  const [empleados, setEmpleados] = useState([
    { nombre: "Juan Pérez", email: "juan@mail.com", proyecto: "Proyecto A" },
    { nombre: "Ana Gómez", email: "ana@mail.com", proyecto: "Proyecto B" },
  ]);
  const [reportes, setReportes] = useState([
    { empleado: "Juan Pérez", proyecto: "Proyecto A", horas: 40 },
    { empleado: "Ana Gómez", proyecto: "Proyecto B", horas: 35 },
  ]);
  const [editEmpleadoIdx, setEditEmpleadoIdx] = useState(null);
  const [editEmpleadoData, setEditEmpleadoData] = useState({ nombre: "", email: "", proyecto: proyectos[0].nombre });
  const [editProyectoIdx, setEditProyectoIdx] = useState(null);
  const [editProyectoData, setEditProyectoData] = useState({ nombre: "", estado: estadosProyecto[0] });
  const [loginNombre, setLoginNombre] = useState("");
  const [loginCargo, setLoginCargo] = useState("empleado");
  const [registro, setRegistro] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    proyecto: proyectos[0]?.nombre || ""
  });

  // Carrusel
  const [carruselIdx, setCarruselIdx] = useState(0);

  // Carrusel automático
  useEffect(() => {
    if (view !== "inicio") return;
    const timer = setInterval(() => {
      setCarruselIdx(idx => (idx + 1) % imagenesCarrusel.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [view]);

  // Abrir formulario de edición
  const handleEditEmpleado = idx => {
    setEditEmpleadoIdx(idx);
    setEditEmpleadoData({ ...empleados[idx] });
  };

  // Guardar cambios de empleado
  const handleSaveEmpleado = () => {
    const oldNombre = empleados[editEmpleadoIdx].nombre;
    const newNombre = editEmpleadoData.nombre;
    const newProyecto = editEmpleadoData.proyecto;

    setEmpleados(emps =>
      emps.map((emp, idx) =>
        idx === editEmpleadoIdx ? { ...editEmpleadoData } : emp
      )
    );

    setReportes(reps =>
      reps.map(rep =>
        rep.empleado === oldNombre
          ? { ...rep, empleado: newNombre, proyecto: newProyecto }
          : rep
      )
    );

    if (oldNombre !== newNombre) {
      setSalarios(prev => {
        const nuevoSalarios = { ...prev };
        if (nuevoSalarios[oldNombre] !== undefined) {
          nuevoSalarios[newNombre] = nuevoSalarios[oldNombre];
          delete nuevoSalarios[oldNombre];
        }
        return nuevoSalarios;
      });
    }

    setEditEmpleadoIdx(null);
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditEmpleadoIdx(null);
  };

  // Abrir formulario de edición de proyecto
  const handleEditProyecto = idx => {
    setEditProyectoIdx(idx);
    setEditProyectoData({ ...proyectos[idx] });
  };

  // Guardar cambios de proyecto
  const handleSaveProyecto = () => {
    const oldNombre = proyectos[editProyectoIdx].nombre;
    const newNombre = editProyectoData.nombre;
    const newEstado = editProyectoData.estado;

    setProyectos(proys =>
      proys.map((proy, idx) =>
        idx === editProyectoIdx ? { ...editProyectoData } : proy
      )
    );

    if (oldNombre !== newNombre) {
      setEmpleados(emps =>
        emps.map(emp =>
          emp.proyecto === oldNombre
            ? { ...emp, proyecto: newNombre }
            : emp
        )
      );
      setReportes(reps =>
        reps.map(rep =>
          rep.proyecto === oldNombre
            ? { ...rep, proyecto: newNombre }
            : rep
        )
      );
    }

    setEditProyectoIdx(null);
  };

  // Cancelar edición de proyecto
  const handleCancelEditProyecto = () => {
    setEditProyectoIdx(null);
  };

  // Handler para cambiar salario por hora
  const handleSalarioChange = (nombre, valor) => {
    setSalarios(prev => ({
      ...prev,
      [nombre]: Number(valor)
    }));
  };

  // Calcular dedicación por proyecto y total de horas
  const dedicacionPorProyecto = proyectos.map(proy => {
    const empleadosProyecto = empleados
      .filter(e => e.proyecto === proy.nombre)
      .map(e => {
        const horas = reportes.find(r => r.empleado === e.nombre && r.proyecto === proy.nombre)?.horas || 0;
        return { nombre: e.nombre, horas };
      });
    const totalHoras = empleadosProyecto.reduce((acc, emp) => acc + emp.horas, 0);
    return {
      nombre: proy.nombre,
      estado: proy.estado,
      empleados: empleadosProyecto,
      totalHoras
    };
  });

  // NUEVO: Manejar login y guardar usuario/cargo
  const handleLogin = (e) => {
    e.preventDefault();
    setUsuario({ nombre: loginNombre, cargo: loginCargo });
    setView("dashboard");
  };

  // NUEVO: Manejar registro
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
    setView("dashboard");
  };

  return (
    <div className="app-container">
      {/* NUEVO: Barra superior con usuario y cargo */}
      {view !== "login" && view !== "inicio" && view !== "registro" && (
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
      <div className="flex-row">
        {/* Sidebar Navigation */}
        {view !== "login" && view !== "inicio" && view !== "registro" && (
          <aside className="sidebar">
            <button
              onClick={() => setView("dashboard")}
              className={view === "dashboard" ? "active" : ""}
            >
              <FaHome /> Inicio
            </button>
            <button
              onClick={() => setView("horas")}
              className={view === "horas" ? "active" : ""}
            >
              <FaClock /> Cargar Horas
            </button>
            <button
              onClick={() => setView("reportes")}
              className={view === "reportes" ? "active" : ""}
            >
              <FaChartBar /> Reportes
            </button>
            <button
              onClick={() => setView("proyectos")}
              className={view === "proyectos" ? "active" : ""}
            >
              <FaProjectDiagram /> Proyectos
            </button>
            <button
              onClick={() => setView("perfil")}
              className={view === "perfil" ? "active" : ""}
            >
              <FaUser /> Perfil
            </button>
            {/* Mostrar botón Administrador solo si el usuario es administrador */}
            {usuario.cargo === "administrador" && (
              <button
                onClick={() => setView("admin")}
                className={view === "admin" ? "active" : ""}
              >
                <FaUserShield /> Administrador
              </button>
            )}
          </aside>
        )}

        {/* Main Content */}
        <main className="main-content">
          {/* INICIO DE LA PAGINA */}
          {view === "inicio" && (
            <div style={{ maxWidth: 420, margin: "0 auto", textAlign: "center" }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  width: "100%",
                  height: 220,
                  borderRadius: 16,
                  overflow: "hidden",
                  marginBottom: 16,
                  boxShadow: "0 4px 24px rgba(124, 58, 237, 0.08)"
                }}>
                  <img
                    src={imagenesCarrusel[carruselIdx]}
                    alt="Personas trabajando"
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.7s" }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 }}>
                  {imagenesCarrusel.map((_, idx) => (
                    <button
                      key={idx}
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        border: "none",
                        background: idx === carruselIdx ? "#7c3aed" : "#ede9fe",
                        cursor: "pointer",
                        transition: "background 0.2s"
                      }}
                      onClick={() => setCarruselIdx(idx)}
                      aria-label={`Imagen ${idx + 1}`}
                    />
                  ))}
                </div>
                <h1 style={{ color: "#7c3aed", fontWeight: 800, fontSize: "2rem", marginBottom: 8 }}>
                  Sistema de Horas Trabajadas
                </h1>
                <p style={{ color: "#444", marginBottom: 24 }}>
                  Organiza y controla las horas trabajadas de tu equipo de manera simple y eficiente.
                </p>
                <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                  <button className="button" style={{ width: 140 }} onClick={() => setView("login")}>
                    Iniciar Sesión
                  </button>
                  <button className="button button-green" style={{ width: 140 }} onClick={() => setView("registro")}>
                    Registrarse
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* REGISTRARSE */}
          {view === "registro" && (
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
                  onClick={() => setView("inicio")}
                >
                  Volver
                </button>
              </form>
            </div>
          )}

          {/* Login */}
          {view === "login" && (
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
                  onClick={() => setView("inicio")}
                >
                  Volver
                </button>
              </form>
            </div>
          )}

          {/* Dashboard */}
          {view === "dashboard" && (
            <div>
              <h2 style={{ color: "#7c3aed", fontWeight: "bold", marginBottom: 24 }}>Panel Principal</h2>
              <div className="grid" style={{ gridTemplateColumns: "1fr", gap: "24px" }}>
                {/* Reportes rápidos */}
                <div className="card" style={{ maxWidth: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <FaChartBar style={{ fontSize: 28, color: "#7c3aed" }} />
                    <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Reportes rápidos</span>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Empleado</th>
                        <th>Proyecto</th>
                        <th>Horas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportes.map((r, idx) => (
                        <tr key={idx}>
                          <td>{r.empleado}</td>
                          <td>{r.proyecto}</td>
                          <td>{r.horas}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Cargar horas */}
                <div className="card" style={{ maxWidth: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <FaClock style={{ fontSize: 28, color: "#7c3aed" }} />
                    <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Cargar horas</span>
                  </div>
                  <form>
                    <select className="select" defaultValue="">
                      <option value="" disabled>Selecciona un proyecto</option>
                      {proyectos.map((p, i) => (
                        <option key={i}>{p.nombre}</option>
                      ))}
                    </select>
                    <input type="date" className="input" />
                    <input type="number" className="input" placeholder="Horas trabajadas" min="1" />
                    <textarea className="input" placeholder="Comentario (opcional)" rows={2} style={{ resize: "vertical" }} />
                    <button className="button button-green" type="submit">Guardar</button>
                  </form>
                </div>
                {/* Empleados */}
                <div className="card" style={{ maxWidth: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <FaUsers style={{ fontSize: 28, color: "#7c3aed" }} />
                    <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Empleados</span>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Proyecto</th>
                        {/* Solo mostrar acciones si es administrador */}
                        {usuario.cargo === "administrador" && <th>Acciones</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {empleados.map((e, idx) => (
                        <tr key={idx}>
                          <td>{e.nombre}</td>
                          <td>{e.email}</td>
                          <td>{e.proyecto}</td>
                          {/* Solo mostrar acciones si es administrador */}
                          {usuario.cargo === "administrador" && (
                            <td>
                              <button className="button" style={{ width: "auto", padding: "6px 12px", fontSize: "0.9rem" }}
                                onClick={() => handleEditEmpleado(idx)}
                              >Editar</button>
                              <button className="button button-green" style={{ width: "auto", padding: "6px 12px", fontSize: "0.9rem", marginLeft: "6px" }}>Eliminar</button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Formulario de edición solo visible para administrador */}
                  {usuario.cargo === "administrador" && editEmpleadoIdx !== null && (
                    <div className="card" style={{ marginTop: 24, background: "#ede9fe" }}>
                      <h2 style={{ color: "#7c3aed" }}>Editar Empleado</h2>
                      <input
                        className="input"
                        value={editEmpleadoData.nombre}
                        onChange={e => setEditEmpleadoData(data => ({ ...data, nombre: e.target.value }))}
                        placeholder="Nombre"
                      />
                      <input
                        className="input"
                        value={editEmpleadoData.email}
                        onChange={e => setEditEmpleadoData(data => ({ ...data, email: e.target.value }))}
                        placeholder="Email"
                      />
                      <select
                        className="select"
                        value={editEmpleadoData.proyecto}
                        onChange={e => setEditEmpleadoData(data => ({ ...data, proyecto: e.target.value }))}
                      >
                        {proyectos.map((p, i) => (
                          <option key={i} value={p.nombre}>{p.nombre}</option>
                        ))}
                      </select>
                      <div style={{ display: "flex", gap: 12 }}>
                        <button className="button" style={{ width: "auto" }} onClick={handleSaveEmpleado}>Guardar</button>
                        <button className="button button-green" style={{ width: "auto" }} onClick={handleCancelEdit}>Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Proyectos */}
          {view === "proyectos" && (
            <div className="table-container">
              <h2>Proyectos y Dedicación</h2>
              {dedicacionPorProyecto.map((proy, idx) => {
                // Calcular color de la barra según el estado (de rojo a verde)
                const estadoIdx = estadosProyecto.indexOf(proy.estado);
                const percent = (estadoIdx + 1) / estadosProyecto.length;
                // Interpolación de color de rojo (#ef4444) a verde (#22c55e)
                const r = Math.round(239 + (34 - 239) * percent); // 239 -> 34
                const g = Math.round(68 + (197 - 68) * percent);  // 68 -> 197
                const b = Math.round(68 + (94 - 68) * percent);   // 68 -> 94
                const barraColor = `rgb(${r},${g},${b})`;

                return (
                  <div key={idx} style={{ marginBottom: "32px" }}>
                    <h3 style={{ color: "#7c3aed", marginBottom: "12px" }}>
                      <FaProjectDiagram style={{ marginRight: 6 }} /> {proy.nombre}
                    </h3>
                    {/* Estado del proyecto y barra de progreso */}
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ fontWeight: "bold" }}>Estado: </span>
                      <span>{proy.estado}</span>
                      <div style={{
                        background: "#ede9fe",
                        borderRadius: 8,
                        height: 18,
                        marginTop: 6,
                        marginBottom: 6,
                        width: "100%",
                        maxWidth: 350,
                        position: "relative"
                      }}>
                        <div style={{
                          height: "100%",
                          borderRadius: 8,
                          background: barraColor,
                          width: `${percent * 100}%`,
                          transition: "width 0.4s, background 0.4s"
                        }} />
                        <div style={{
                          position: "absolute",
                          top: 0,
                          left: 8,
                          fontSize: 12,
                          color: "#444",
                          height: "100%",
                          display: "flex",
                          alignItems: "center"
                        }}>
                          {proy.estado}
                        </div>
                      </div>
                    </div>
                    {/* Total de horas dedicadas */}
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ fontWeight: "bold" }}>Horas dedicadas en total: </span>
                      <span>{proy.totalHoras}</span>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>Empleado</th>
                          <th>Horas dedicadas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {proy.empleados.length === 0 ? (
                          <tr>
                            <td colSpan={2}>Sin empleados asignados</td>
                          </tr>
                        ) : (
                          proy.empleados.map((emp, i) => (
                            <tr key={i}>
                              <td>{emp.nombre}</td>
                              <td>{emp.horas}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}

          {/* Cargar horas */}
          {view === "horas" && (
            <div className="card" style={{ maxWidth: 500 }}>
              <h2>Registrar Horas</h2>
              <select className="select">
                {proyectos.map((p, i) => (
                  <option key={i}>{p.nombre}</option>
                ))}
              </select>
              <input type="date" className="input" />
              <input type="number" className="input" placeholder="Horas trabajadas" />
              <button className="button button-green">Guardar</button>
            </div>
          )}

          {/* Reportes */}
          {view === "reportes" && (
            <div className="table-container">
              <h2>Reportes</h2>
              <table>
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Proyecto</th>
                    <th>Horas</th>
                  </tr>
                </thead>
                <tbody>
                  {reportes.map((r, idx) => (
                    <tr key={idx}>
                      <td>{r.empleado}</td>
                      <td>{r.proyecto}</td>
                      <td>{r.horas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Perfil */}
          {view === "perfil" && (
            <div className="card">
              <h2>Mi Perfil</h2>
              <div className="profile-info">
                <p><b>Nombre:</b> {usuario.nombre}</p>
                <p><b>Cargo:</b> {usuario.cargo ? usuario.cargo.charAt(0).toUpperCase() + usuario.cargo.slice(1) : ""}</p>
                <p><b>Email:</b> {
                  empleados.find(e => e.nombre === usuario.nombre)?.email || ""
                }</p>
                {/* Solo mostrar estos datos si es empleado */}
                {usuario.cargo === "empleado" && (
                  <>
                    <p><b>Proyecto:</b> {
                      empleados.find(e => e.nombre === usuario.nombre)?.proyecto || ""
                    }</p>
                    <p><b>Horas trabajadas:</b> {
                      reportes.filter(r => r.empleado === usuario.nombre).reduce((acc, r) => acc + r.horas, 0)
                    }</p>
                    <p><b>Salario estimado:</b> ${
                      (
                        reportes.filter(r => r.empleado === usuario.nombre).reduce((acc, r) => acc + r.horas, 0)
                        * (salarios[usuario.nombre] || 0)
                      ).toLocaleString()
                    }</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Administrador */}
          {view === "admin" && usuario.cargo === "administrador" && (
            <div>
              <h2 style={{ color: "#7c3aed", fontWeight: "bold", marginBottom: 24 }}>Panel Administrador</h2>
              {/* Admin Tabs */}
              <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                <button
                  className={`button${adminTab === "reportes" ? " active" : ""}`}
                  style={{
                    width: "auto",
                    background: adminTab === "reportes" ? "#ede9fe" : "#fff",
                    color: adminTab === "reportes" ? "#7c3aed" : "#222",
                    border: "1px solid #ede9fe",
                  }}
                  onClick={() => setAdminTab("reportes")}
                >
                  <FaClipboardList style={{ marginRight: 6 }} /> Reportes Generales
                </button>
                <button
                  className={`button${adminTab === "empleados" ? " active" : ""}`}
                  style={{
                    width: "auto",
                    background: adminTab === "empleados" ? "#ede9fe" : "#fff",
                    color: adminTab === "empleados" ? "#7c3aed" : "#222",
                    border: "1px solid #ede9fe",
                  }}
                  onClick={() => setAdminTab("empleados")}
                >
                  <FaUsers style={{ marginRight: 6 }} /> Gestión de Empleados
                </button>
                <button
                  className={`button${adminTab === "proyectos" ? " active" : ""}`}
                  style={{
                    width: "auto",
                    background: adminTab === "proyectos" ? "#ede9fe" : "#fff",
                    color: adminTab === "proyectos" ? "#7c3aed" : "#222",
                    border: "1px solid #ede9fe",
                  }}
                  onClick={() => setAdminTab("proyectos")}
                >
                  <FaProjectDiagram style={{ marginRight: 6 }} /> Gestión de Proyectos
                </button>
                <button
                  className={`button${adminTab === "salarios" ? " active" : ""}`}
                  style={{
                    width: "auto",
                    background: adminTab === "salarios" ? "#ede9fe" : "#fff",
                    color: adminTab === "salarios" ? "#7c3aed" : "#222",
                    border: "1px solid #ede9fe",
                  }}
                  onClick={() => setAdminTab("salarios")}
                >
                  <FaMoneyBillWave style={{ marginRight: 6 }} /> Cálculo de Salarios
                </button>
              </div>
              {/* Admin Tab Content */}
              {adminTab === "reportes" && (
                <div className="table-container">
                  <h2>Reportes Generales</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>Proyecto</th>
                        <th>Total Horas</th>
                        <th>Empleados</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proyectos.map((p, idx) => {
                        const empleadosProyecto = empleados.filter(e => e.proyecto === p.nombre);
                        const totalHoras = reportes.filter(r => r.proyecto === p.nombre).reduce((acc, r) => acc + r.horas, 0);
                        return (
                          <tr key={idx}>
                            <td>{p.nombre}</td>
                            <td>{totalHoras}</td>
                            <td>{empleadosProyecto.length}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {adminTab === "empleados" && (
                <div className="table-container">
                  <h2>Gestión de Empleados</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Proyecto</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empleados.map((e, idx) => (
                        <tr key={idx}>
                          <td>{e.nombre}</td>
                          <td>{e.email}</td>
                          <td>{e.proyecto}</td>
                          <td>
                            <button className="button" style={{ width: "auto", padding: "6px 12px", fontSize: "0.9rem" }}
                              onClick={() => handleEditEmpleado(idx)}
                            >Editar</button>
                            <button className="button button-green" style={{ width: "auto", padding: "6px 12px", fontSize: "0.9rem", marginLeft: "6px" }}>Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Formulario de edición */}
                  {editEmpleadoIdx !== null && (
                    <div className="card" style={{ marginTop: 24, background: "#ede9fe" }}>
                      <h2 style={{ color: "#7c3aed" }}>Editar Empleado</h2>
                      <input
                        className="input"
                        value={editEmpleadoData.nombre}
                        onChange={e => setEditEmpleadoData(data => ({ ...data, nombre: e.target.value }))}
                        placeholder="Nombre"
                      />
                      <input
                        className="input"
                        value={editEmpleadoData.email}
                        onChange={e => setEditEmpleadoData(data => ({ ...data, email: e.target.value }))}
                        placeholder="Email"
                      />
                      <select
                        className="select"
                        value={editEmpleadoData.proyecto}
                        onChange={e => setEditEmpleadoData(data => ({ ...data, proyecto: e.target.value }))}
                      >
                        {proyectos.map((p, i) => (
                          <option key={i} value={p.nombre}>{p.nombre}</option>
                        ))}
                      </select>
                      <div style={{ display: "flex", gap: 12 }}>
                        <button className="button" style={{ width: "auto" }} onClick={handleSaveEmpleado}>Guardar</button>
                        <button className="button button-green" style={{ width: "auto" }} onClick={handleCancelEdit}>Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {adminTab === "proyectos" && (
                <div className="table-container">
                  <h2>Gestión de Proyectos</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proyectos.map((p, idx) => (
                        <tr key={idx}>
                          <td>{p.nombre}</td>
                          <td>{p.estado}</td>
                          <td>
                            <button
                              className="button"
                              style={{ width: "auto", padding: "6px 12px", fontSize: "0.9rem" }}
                              onClick={() => handleEditProyecto(idx)}
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Formulario de edición de proyecto */}
                  {editProyectoIdx !== null && (
                    <div className="card" style={{ marginTop: 24, background: "#ede9fe" }}>
                      <h2 style={{ color: "#7c3aed" }}>Editar Proyecto</h2>
                      <input
                        className="input"
                        value={editProyectoData.nombre}
                        onChange={e => setEditProyectoData(data => ({ ...data, nombre: e.target.value }))}
                        placeholder="Nombre del Proyecto"
                      />
                      <select
                        className="select"
                        value={editProyectoData.estado}
                        onChange={e => setEditProyectoData(data => ({ ...data, estado: e.target.value }))}
                      >
                        {estadosProyecto.map((estado, i) => (
                          <option key={i} value={estado}>{estado}</option>
                        ))}
                      </select>
                      <div style={{ display: "flex", gap: 12 }}>
                        <button className="button" style={{ width: "auto" }} onClick={handleSaveProyecto}>Guardar</button>
                        <button className="button button-green" style={{ width: "auto" }} onClick={handleCancelEditProyecto}>Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {adminTab === "salarios" && (
                <div className="table-container">
                  <h2>Cálculo de Salarios</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>Empleado</th>
                        <th>Horas trabajadas</th>
                        <th>Salario por hora</th>
                        <th>Salario total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empleados.map((e, idx) => {
                        const horas = reportes.find(r => r.empleado === e.nombre)?.horas || 0;
                        const salarioHora = salarios[e.nombre] || 0;
                        const salarioTotal = horas * salarioHora;
                        return (
                          <tr key={idx}>
                            <td>{e.nombre}</td>
                            <td>{horas}</td>
                            <td>
                              <input
                                type="number"
                                value={salarioHora}
                                min="0"
                                style={{ width: 80, padding: "4px", borderRadius: 6, border: "1px solid #ddd" }}
                                onChange={ev => handleSalarioChange(e.nombre, ev.target.value)}
                              />
                            </td>
                            <td>${salarioTotal.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;