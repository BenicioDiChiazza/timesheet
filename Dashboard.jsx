import { useState } from "react";
import {
  FaHome, FaClock, FaChartBar, FaUser, FaUserShield, FaUsers,
  FaClipboardList, FaMoneyBillWave, FaProjectDiagram
} from "react-icons/fa";

function Dashboard({ usuario, empleados, setEmpleados, proyectos, setProyectos }) {
  const [view, setView] = useState("dashboard");
  const [adminTab, setAdminTab] = useState("reportes");
  const esAdmin = usuario?.cargo === "administrador";
  const [salarios, setSalarios] = useState({
    "Juan Pérez": 500,
    "Ana Gómez": 450,
  });

  // Estado para reportes
  const [reportes, setReportes] = useState([
    { empleado: "Juan Pérez", proyecto: "Proyecto A", horas: 40, fecha: "2025-01-05" },
    { empleado: "Ana Gómez", proyecto: "Proyecto B", horas: 35, fecha: "2025-01-05" },
  ]);

  // Estado para formulario de carga de horas
  const [formHoras, setFormHoras] = useState({
    proyecto: proyectos[0]?.nombre || "",
    horas: "",
    comentario: ""
  });

  // Obtener fecha de hoy en formato YYYY-MM-DD
  const getFechaHoy = () => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  };

  // Manejar carga de horas
  const handleCargarHoras = (e) => {
    e.preventDefault();
    if (!formHoras.proyecto || !formHoras.horas || formHoras.horas <= 0) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    const nuevoReporte = {
      empleado: usuario.nombre,
      proyecto: formHoras.proyecto,
      horas: Number(formHoras.horas),
      fecha: getFechaHoy(),
      comentario: formHoras.comentario
    };

    setReportes(prev => [...prev, nuevoReporte]);
    
    // Resetear formulario
    setFormHoras({
      proyecto: proyectos[0]?.nombre || "",
      horas: "",
      comentario: ""
    });

    alert("Horas cargadas exitosamente");
  };

  // Calcular dedicación por proyecto
  const dedicacionPorProyecto = proyectos.map(proy => ({
    nombre: proy.nombre,
    empleados: empleados
      .filter(e => e.proyecto === proy.nombre)
      .map(e => {
        const horas = reportes.find(r => r.empleado === e.nombre && r.proyecto === proy.nombre)?.horas || 0;
        return { nombre: e.nombre, horas };
      })
  }));

  // Estado para edición de empleado
  const [editEmpleadoIdx, setEditEmpleadoIdx] = useState(null);
  const [editEmpleadoData, setEditEmpleadoData] = useState({ nombre: "", email: "", proyecto: proyectos[0]?.nombre || "" });

  // Abrir formulario de edición
  const handleEditEmpleado = idx => {
    setEditEmpleadoIdx(idx);
    setEditEmpleadoData({ ...empleados[idx] });
  };

  // Guardar cambios de empleado
  const handleSaveEmpleado = () => {
    setEmpleados(emps =>
      emps.map((emp, idx) =>
        idx === editEmpleadoIdx ? { ...editEmpleadoData } : emp
      )
    );
    setEditEmpleadoIdx(null);
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditEmpleadoIdx(null);
  };

  // Cambiar salario por hora
  const handleSalarioChange = (nombre, valor) => {
    setSalarios(prev => ({
      ...prev,
      [nombre]: Number(valor)
    }));
  };

  return (
    <div className="flex-row">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <button onClick={() => setView("dashboard")} className={view === "dashboard" ? "active" : ""}>
          <FaHome /> Inicio
        </button>
        <button onClick={() => setView("horas")} className={view === "horas" ? "active" : ""}>
          <FaClock /> Cargar Horas
        </button>
        <button onClick={() => setView("reportes")} className={view === "reportes" ? "active" : ""}>
          <FaChartBar /> Reportes
        </button>
        <button onClick={() => setView("proyectos")} className={view === "proyectos" ? "active" : ""}>
          <FaProjectDiagram /> Proyectos
        </button>
        <button onClick={() => setView("perfil")} className={view === "perfil" ? "active" : ""}>
          <FaUser /> Perfil
        </button>
        {esAdmin && (
          <button onClick={() => setView("admin")} className={view === "admin" ? "active" : ""}>
            <FaUserShield /> Administrador
          </button>
        )}
      </aside>

      {/* Main Content */}
      <main className="main-content">
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
                <form onSubmit={handleCargarHoras}>
                  <select 
                    className="select" 
                    value={formHoras.proyecto}
                    onChange={e => setFormHoras(prev => ({ ...prev, proyecto: e.target.value }))}
                    required
                  >
                    {proyectos.map((p, i) => (
                      <option key={i} value={p.nombre}>{p.nombre}</option>
                    ))}
                  </select>
                  <input 
                    type="date" 
                    className="input" 
                    value={getFechaHoy()} 
                    readOnly 
                    style={{ backgroundColor: "#f3f4f6", cursor: "not-allowed" }}
                  />
                  <input 
                    type="number" 
                    className="input" 
                    placeholder="Horas trabajadas" 
                    min="1" 
                    value={formHoras.horas}
                    onChange={e => setFormHoras(prev => ({ ...prev, horas: e.target.value }))}
                    required
                  />
                  <textarea 
                    className="input" 
                    placeholder="Comentario (opcional)" 
                    rows={2} 
                    style={{ resize: "vertical" }}
                    value={formHoras.comentario}
                    onChange={e => setFormHoras(prev => ({ ...prev, comentario: e.target.value }))}
                  />
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
                      {esAdmin && <th>Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {empleados.map((e, idx) => (
                      <tr key={idx}>
                        <td>{e.nombre}</td>
                        <td>{e.email}</td>
                        <td>{e.proyecto}</td>
                        {esAdmin && (
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
                {/* Formulario de edición */}
                {esAdmin && editEmpleadoIdx !== null && (
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
            {dedicacionPorProyecto.map((proy, idx) => (
              <div key={idx} style={{ marginBottom: "32px" }}>
                <h3 style={{ color: "#7c3aed", marginBottom: "12px" }}>
                  <FaProjectDiagram style={{ marginRight: 6 }} /> {proy.nombre}
                </h3>
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
            ))}
          </div>
        )}

        {/* Cargar horas */}
        {view === "horas" && (
          <div className="card" style={{ maxWidth: 500 }}>
            <h2>Registrar Horas</h2>
            <form onSubmit={handleCargarHoras}>
              <select 
                className="select"
                value={formHoras.proyecto}
                onChange={e => setFormHoras(prev => ({ ...prev, proyecto: e.target.value }))}
                required
              >
                {proyectos.map((p, i) => (
                  <option key={i} value={p.nombre}>{p.nombre}</option>
                ))}
              </select>
              <input 
                type="date" 
                className="input" 
                value={getFechaHoy()} 
                readOnly
                style={{ backgroundColor: "#f3f4f6", cursor: "not-allowed" }}
              />
              <input 
                type="number" 
                className="input" 
                placeholder="Horas trabajadas"
                min="1"
                value={formHoras.horas}
                onChange={e => setFormHoras(prev => ({ ...prev, horas: e.target.value }))}
                required
              />
              <textarea 
                className="input" 
                placeholder="Comentario (opcional)" 
                rows={3}
                style={{ resize: "vertical" }}
                value={formHoras.comentario}
                onChange={e => setFormHoras(prev => ({ ...prev, comentario: e.target.value }))}
              />
              <button className="button button-green" type="submit">Guardar</button>
            </form>
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
              <p><b>Email:</b> {empleados.find(e => e.nombre === usuario.nombre)?.email || "-"}</p>
              <p><b>Horas trabajadas:</b> 120</p>
              <p><b>Salario estimado:</b> $60,000</p>
            </div>
          </div>
        )}

        {/* Administrador */}
        {esAdmin && view === "admin" && (
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
                    <tr>
                      <td>Proyecto A</td>
                      <td>120</td>
                      <td>5</td>
                    </tr>
                    <tr>
                      <td>Proyecto B</td>
                      <td>95</td>
                      <td>3</td>
                    </tr>
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
                {esAdmin && editEmpleadoIdx !== null && (
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
  );
}

export default Dashboard;
