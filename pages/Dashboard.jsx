import { useState, useEffect } from "react";
import {
  FaHome, FaClock, FaChartBar, FaUser, FaUserShield, FaUsers,
  FaClipboardList, FaMoneyBillWave, FaProjectDiagram, FaEdit, FaSave, FaTimes, FaDownload, FaTrash
} from "react-icons/fa";
import { supabaseService } from "./supabaseService";
import * as XLSX from 'xlsx';

function Dashboard({ usuario, empleados, setEmpleados, proyectos, setProyectos }) {
  const [view, setView] = useState("dashboard");
  const [adminTab, setAdminTab] = useState("reportes");
  const [resumenHoras, setResumenHoras] = useState([]);
  const [cargando, setCargando] = useState(false);
  
  const esAdmin = usuario?.cargo === "administrador";

  // Obtener el empleado actual y su proyecto - AHORA INCLUYE ADMINISTRADORES
  const empleadoActual = empleados.find(emp => emp.id === usuario.id);
  const proyectoEmpleado = empleadoActual?.proyecto;

  const [editProyectoIdx, setEditProyectoIdx] = useState(null);
  const [editProyectoData, setEditProyectoData] = useState({ 
    nombre: "", 
    estado: "RELEVAMIENTO" 
  });

  // Estado para formulario de horas - SOLO el proyecto del empleado
  const [formHoras, setFormHoras] = useState({
    proyecto: proyectoEmpleado || "",
    horas: ""
  });

  const [editEmpleadoIdx, setEditEmpleadoIdx] = useState(null);
  const [editEmpleadoData, setEditEmpleadoData] = useState({ 
    nombre: "", 
    apellido: "",
    email: "", 
    proyecto: proyectos[0]?.nombre || "" 
  });

  const [salarios, setSalarios] = useState({});

  useEffect(() => {
    if (view === "reportes" || view === "dashboard") {
      cargarResumenHoras();
    }
  }, [view]);

  // Actualizar el proyecto del formulario cuando cambie el proyecto del empleado
  useEffect(() => {
    if (proyectoEmpleado) {
      setFormHoras(prev => ({ ...prev, proyecto: proyectoEmpleado }));
    }
  }, [proyectoEmpleado]);

  const cargarResumenHoras = async () => {
    setCargando(true);
    try {
      const resumen = await supabaseService.getResumenHoras();
      setResumenHoras(resumen);
    } catch (error) {
      console.error('Error cargando resumen de horas:', error);
    } finally {
      setCargando(false);
    }
  };

  const getFechaHoy = () => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  };

  const handleCargarHoras = async (e) => {
    e.preventDefault();
    
    if (!formHoras.horas || formHoras.horas <= 0) {
      alert("Por favor ingresa la cantidad de horas trabajadas");
      return;
    }

    // Verificar que el empleado (incluyendo administradores) tenga un proyecto asignado
    if (!proyectoEmpleado) {
      alert("No tienes un proyecto asignado. Contacta al administrador para que te asigne a un proyecto.");
      return;
    }

    try {
      setCargando(true);

      const resultado = await supabaseService.registrarHorasTrabajadas(
        usuario.id,
        proyectoEmpleado, // Siempre usar el proyecto del empleado/administrador
        formHoras.horas,
        getFechaHoy(),
        ""
      );

      // Actualizar estado local de empleados
      setEmpleados(prev => prev.map(emp => 
        emp.id === usuario.id 
          ? { ...emp, horas: resultado.empleado.horas }
          : emp
      ));

      // Actualizar estado local de proyectos
      setProyectos(prev => prev.map(proy => 
        proy.nombre === proyectoEmpleado
          ? { ...proy, tiempototal: resultado.proyecto.tiempototal }
          : proy
      ));

      await cargarResumenHoras();

      // Limpiar formulario
      setFormHoras(prev => ({ ...prev, horas: "" }));

      alert(`✅ ¡Horas registradas exitosamente!\nSe agregaron ${formHoras.horas} horas al proyecto ${proyectoEmpleado}`);

    } catch (error) {
      console.error('Error registrando horas:', error);
      alert('Error al registrar las horas: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  // Función para descargar Excel de salarios
  const descargarExcelSalarios = () => {
    const datosExcel = empleados.map(emp => {
      const horas = emp.horas || 0;
      const salarioHora = salarios[emp.nombre] || 0;
      const salarioTotal = horas * salarioHora;
      
      return {
        'Empleado': `${emp.nombre} ${emp.apellido || ''}`,
        'Email': emp.email,
        'Proyecto': emp.proyecto,
        'Horas Trabajadas': horas,
        'Salario por Hora': salarioHora,
        'Salario Total': salarioTotal
      };
    });

    // Crear libro de Excel
    const wb = XLSX.utils.book_new();
    
    // Crear hoja con los datos
    const ws = XLSX.utils.json_to_sheet(datosExcel);
    
    // Ajustar el ancho de las columnas
    const columnWidths = [
      { wch: 25 }, // Empleado
      { wch: 30 }, // Email
      { wch: 20 }, // Proyecto
      { wch: 15 }, // Horas Trabajadas
      { wch: 15 }, // Salario por Hora
      { wch: 15 }  // Salario Total
    ];
    ws['!cols'] = columnWidths;
    
    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Salarios');
    
    // Crear segunda hoja con resumen por proyecto
    const resumenProyectos = proyectos.map(proy => {
      const empleadosProyecto = empleados.filter(emp => emp.proyecto === proy.nombre);
      const totalHorasProyecto = empleadosProyecto.reduce((sum, emp) => sum + (emp.horas || 0), 0);
      const totalSalariosProyecto = empleadosProyecto.reduce((sum, emp) => {
        const salarioHora = salarios[emp.nombre] || 0;
        return sum + ((emp.horas || 0) * salarioHora);
      }, 0);
      
      return {
        'Proyecto': proy.nombre,
        'Estado': proy.estado,
        'Cantidad de Empleados': empleadosProyecto.length,
        'Total Horas': totalHorasProyecto,
        'Total Salarios': totalSalariosProyecto
      };
    });
    
    const wsResumen = XLSX.utils.json_to_sheet(resumenProyectos);
    const columnWidthsResumen = [
      { wch: 20 }, // Proyecto
      { wch: 15 }, // Estado
      { wch: 20 }, // Cantidad de Empleados
      { wch: 15 }, // Total Horas
      { wch: 15 }  // Total Salarios
    ];
    wsResumen['!cols'] = columnWidthsResumen;
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen por Proyecto');
    
    // Generar y descargar archivo
    XLSX.writeFile(wb, `reporte_salarios_${getFechaHoy()}.xlsx`);
  };

  // FUNCIONES PARA EMPLEADOS - CONECTADAS A SUPABASE
  const handleEditEmpleado = idx => {
    setEditEmpleadoIdx(idx);
    const empleado = empleados[idx];
    setEditEmpleadoData({ 
      nombre: empleado.nombre, 
      apellido: empleado.apellido || "",
      email: empleado.email, 
      proyecto: empleado.proyecto 
    });
  };

  const handleSaveEmpleado = async () => {
    try {
      setCargando(true);
      
      const empleadoOriginal = empleados[editEmpleadoIdx];
      const updates = {
        nombre: editEmpleadoData.nombre,
        apellido: editEmpleadoData.apellido,
        email: editEmpleadoData.email,
        proyecto: editEmpleadoData.proyecto
      };

      // Actualizar en Supabase
      const empleadoActualizado = await supabaseService.updateEmpleado(empleadoOriginal.id, updates);
      
      // Actualizar estado local
      setEmpleados(emps =>
        emps.map((emp, idx) =>
          idx === editEmpleadoIdx ? { 
            ...emp, 
            nombre: editEmpleadoData.nombre,
            apellido: editEmpleadoData.apellido,
            email: editEmpleadoData.email,
            proyecto: editEmpleadoData.proyecto
          } : emp
        )
      );

      setEditEmpleadoIdx(null);
      alert('✅ Empleado actualizado exitosamente');
      
    } catch (error) {
      console.error('Error actualizando empleado:', error);
      alert('Error al actualizar empleado: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleDeleteEmpleado = async (empleadoId, empleadoNombre) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al empleado "${empleadoNombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setCargando(true);
      
      // Eliminar de Supabase
      await supabaseService.deleteEmpleado(empleadoId);
      
      // Actualizar estado local
      setEmpleados(emps => emps.filter(emp => emp.id !== empleadoId));
      
      alert('✅ Empleado eliminado exitosamente');
      
    } catch (error) {
      console.error('Error eliminando empleado:', error);
      alert('Error al eliminar empleado: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleCancelEdit = () => {
    setEditEmpleadoIdx(null);
  };

  // FUNCIONES PARA PROYECTOS - CONECTADAS A SUPABASE
  const handleEditProyecto = (idx) => {
    setEditProyectoIdx(idx);
    setEditProyectoData({ ...proyectos[idx] });
  };

  const handleSaveProyecto = async () => {
    try {
      setCargando(true);
      
      const proyectoOriginal = proyectos[editProyectoIdx];
      const updates = {
        nombre: editProyectoData.nombre,
        estado: editProyectoData.estado
      };

      // Actualizar en Supabase
      const proyectoActualizado = await supabaseService.updateProyecto(proyectoOriginal.id, updates);
      
      // Actualizar estado local
      setProyectos(proys =>
        proys.map((proy, idx) =>
          idx === editProyectoIdx ? { 
            ...proy, 
            nombre: editProyectoData.nombre,
            estado: editProyectoData.estado
          } : proy
        )
      );

      setEditProyectoIdx(null);
      alert('✅ Proyecto actualizado exitosamente');
      
    } catch (error) {
      console.error('Error actualizando proyecto:', error);
      alert('Error al actualizar proyecto: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleCancelEditProyecto = () => {
    setEditProyectoIdx(null);
  };

  const handleSalarioChange = (nombre, valor) => {
    setSalarios(prev => ({
      ...prev,
      [nombre]: Number(valor)
    }));
  };

  const dedicacionPorProyecto = proyectos.map(proy => ({
    ...proy,
    empleados: empleados
      .filter(e => e.proyecto === proy.nombre)
      .map(e => ({
        nombre: `${e.nombre} ${e.apellido || ''}`,
        horas: e.horas || 0
      }))
  }));

  const estadosProyecto = [
    "RELEVAMIENTO", "ANALISIS", "DISEÑO", "DESARROLLO", "TESTEO", "COMPLETADO"
  ];

  const getEstadoColor = (estado) => {
    const index = estadosProyecto.indexOf(estado);
    const progress = (index / (estadosProyecto.length - 1)) * 100;
    const red = Math.floor(255 * (1 - progress / 100));
    const green = Math.floor(255 * (progress / 100));
    return `rgb(${red}, ${green}, 0)`;
  };

  const getEstadoProgreso = (estado) => {
    const index = estadosProyecto.indexOf(estado);
    return ((index + 1) / estadosProyecto.length) * 100;
  };

  return (
    <div className="flex-row">
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

      <main className="main-content">
        {view === "dashboard" && (
          <div>
            <h2 style={{ color: "#7c3aed", fontWeight: "bold", marginBottom: 24 }}>Panel Principal</h2>
            <div className="grid" style={{ gridTemplateColumns: "1fr", gap: "24px" }}>
              <div className="card" style={{ maxWidth: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <FaChartBar style={{ fontSize: 28, color: "#7c3aed" }} />
                  <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Resumen de Horas</span>
                </div>
                {cargando ? (
                  <p>Cargando...</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Empleado</th>
                        <th>Proyecto</th>
                        <th>Horas Totales</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumenHoras.slice(0, 5).map((r, idx) => (
                        <tr key={idx}>
                          <td>{r.empleado}</td>
                          <td>{r.proyecto}</td>
                          <td>{r.horas}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              
              <div className="card" style={{ maxWidth: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <FaClock style={{ fontSize: 28, color: "#7c3aed" }} />
                  <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Cargar horas</span>
                </div>
                {!proyectoEmpleado ? (
                  <div style={{ 
                    padding: "16px", 
                    backgroundColor: "#fef3c7", 
                    border: "1px solid #f59e0b",
                    borderRadius: "8px",
                    color: "#92400e",
                    textAlign: "center"
                  }}>
                    <strong>No tienes un proyecto asignado</strong>
                    <p style={{ margin: "8px 0 0 0", fontSize: "0.9rem" }}>
                      Contacta al administrador para que te asigne a un proyecto.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleCargarHoras}>
                    <div style={{ 
                      padding: "12px", 
                      backgroundColor: "#f0f9ff", 
                      border: "1px solid #7c3aed",
                      borderRadius: "8px",
                      marginBottom: "16px",
                      textAlign: "center"
                    }}>
                      <strong>Proyecto asignado:</strong> {proyectoEmpleado}
                    </div>
                    <input 
                      type="number" 
                      className="input" 
                      placeholder="Horas trabajadas" 
                      min="1" 
                      value={formHoras.horas}
                      onChange={e => setFormHoras(prev => ({ ...prev, horas: e.target.value }))}
                      required
                    />
                    <button className="button button-green" type="submit" disabled={cargando}>
                      {cargando ? "Guardando..." : "Guardar Horas"}
                    </button>
                  </form>
                )}
              </div>
              
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
                      <th>Horas</th>
                      {esAdmin && <th>Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {empleados.map((e, idx) => (
                      <tr key={idx}>
                        <td>{`${e.nombre} ${e.apellido || ''}`}</td>
                        <td>{e.email}</td>
                        <td>{e.proyecto}</td>
                        <td>{e.horas || 0}</td>
                        {esAdmin && (
                          <td>
                            <button 
                              className="button" 
                              style={{ width: "auto", padding: "6px 12px", fontSize: "0.9rem" }}
                              onClick={() => handleEditEmpleado(idx)}
                              disabled={cargando}
                            >
                              <FaEdit style={{ marginRight: 4 }} /> Editar
                            </button>
                            <button 
                              className="button button-green" 
                              style={{ width: "auto", padding: "6px 12px", fontSize: "0.9rem", marginLeft: "6px" }}
                              onClick={() => handleDeleteEmpleado(e.id, `${e.nombre} ${e.apellido || ''}`)}
                              disabled={cargando}
                            >
                              <FaTrash style={{ marginRight: 4 }} /> Eliminar
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                      value={editEmpleadoData.apellido}
                      onChange={e => setEditEmpleadoData(data => ({ ...data, apellido: e.target.value }))}
                      placeholder="Apellido"
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
                      <button 
                        className="button" 
                        style={{ width: "auto" }} 
                        onClick={handleSaveEmpleado}
                        disabled={cargando}
                      >
                        {cargando ? "Guardando..." : "Guardar"}
                      </button>
                      <button 
                        className="button button-green" 
                        style={{ width: "auto" }} 
                        onClick={handleCancelEdit}
                        disabled={cargando}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === "proyectos" && (
          <div className="table-container">
            <h2>Proyectos y Dedicación</h2>
            {dedicacionPorProyecto.map((proy, idx) => (
              <div key={idx} className="card" style={{ marginBottom: "24px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ color: "#7c3aed", margin: 0 }}>
                    <FaProjectDiagram style={{ marginRight: 6 }} /> {proy.nombre}
                  </h3>
                  <span 
                    style={{ 
                      backgroundColor: getEstadoColor(proy.estado),
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "0.9rem",
                      fontWeight: "bold"
                    }}
                  >
                    {proy.estado}
                  </span>
                </div>
                
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    fontSize: "0.8rem", 
                    marginBottom: "8px",
                    color: "#666"
                  }}>
                    <span>RELEVAMIENTO</span>
                    <span>COMPLETADO</span>
                  </div>
                  <div style={{ 
                    width: "100%", 
                    height: "8px", 
                    backgroundColor: "#e5e7eb", 
                    borderRadius: "4px",
                    overflow: "hidden"
                  }}>
                    <div 
                      style={{ 
                        width: `${getEstadoProgreso(proy.estado)}%`, 
                        height: "100%", 
                        backgroundColor: getEstadoColor(proy.estado),
                        transition: "all 0.3s ease"
                      }} 
                    />
                  </div>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    fontSize: "0.7rem", 
                    marginTop: "4px",
                    color: "#999"
                  }}>
                    {estadosProyecto.map((estado, i) => (
                      <span key={i}>{estado.substring(0, 3)}</span>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
                  <div style={{ 
                    padding: "12px", 
                    backgroundColor: "#f0f9ff", 
                    borderRadius: "8px",
                    minWidth: "120px"
                  }}>
                    <div style={{ fontSize: "0.8rem", color: "#0369a1" }}>Tiempo Total</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#7c3aed" }}>
                      {proy.tiempototal || 0} horas
                    </div>
                  </div>
                  <div style={{ 
                    padding: "12px", 
                    backgroundColor: "#f0fdf4", 
                    borderRadius: "8px",
                    minWidth: "120px"
                  }}>
                    <div style={{ fontSize: "0.8rem", color: "#166534" }}>Empleados</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#7c3aed" }}>
                      {proy.empleados.length}
                    </div>
                  </div>
                </div>

                <table style={{ marginTop: "16px" }}>
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

        {view === "horas" && (
          <div className="card" style={{ maxWidth: 500 }}>
            <h2>Registrar Horas</h2>
            {!proyectoEmpleado ? (
              <div style={{ 
                padding: "20px", 
                backgroundColor: "#fef3c7", 
                border: "1px solid #f59e0b",
                borderRadius: "8px",
                color: "#92400e",
                textAlign: "center"
              }}>
                <h3 style={{ color: "#92400e", marginBottom: "12px" }}>Proyecto No Asignado</h3>
                <p style={{ margin: "0" }}>
                  No tienes un proyecto asignado. Contacta al administrador para que te asigne a un proyecto.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCargarHoras}>
                <div style={{ 
                  padding: "16px", 
                  backgroundColor: "#f0f9ff", 
                  border: "2px solid #7c3aed",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  textAlign: "center",
                  fontWeight: "bold"
                }}>
                  <div style={{ fontSize: "0.9rem", color: "#0369a1" }}>Estás cargando horas para:</div>
                  <div style={{ fontSize: "1.2rem", color: "#7c3aed" }}>{proyectoEmpleado}</div>
                </div>
                <input 
                  type="number" 
                  className="input" 
                  placeholder="Horas trabajadas"
                  min="1"
                  value={formHoras.horas}
                  onChange={e => setFormHoras(prev => ({ ...prev, horas: e.target.value }))}
                  required
                />
                <button className="button button-green" type="submit" disabled={cargando}>
                  {cargando ? "Guardando..." : "Registrar Horas"}
                </button>
              </form>
            )}
          </div>
        )}

        {view === "reportes" && (
          <div className="table-container">
            <h2>Resumen de Horas Trabajadas</h2>
            {cargando ? (
              <p>Cargando reportes...</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Proyecto</th>
                    <th>Horas Totales</th>
                  </tr>
                </thead>
                <tbody>
                  {resumenHoras.map((r, idx) => (
                    <tr key={idx}>
                      <td>{r.empleado}</td>
                      <td>{r.proyecto}</td>
                      <td>{r.horas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {view === "perfil" && (
          <div className="card">
            <h2>Mi Perfil</h2>
            <div className="profile-info">
              <p><b>Nombre:</b> {usuario.nombre}</p>
              <p><b>Email:</b> {usuario.email}</p>
              <p><b>Proyecto:</b> {proyectoEmpleado || "Sin proyecto asignado"}</p>
              <p><b>Horas trabajadas:</b> {empleadoActual?.horas || 0}</p>
              <p><b>Rol:</b> {usuario.cargo}</p>
            </div>
          </div>
        )}

        {esAdmin && view === "admin" && (
          <div>
            <h2 style={{ color: "#7c3aed", fontWeight: "bold", marginBottom: 24 }}>Panel Administrador</h2>
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
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
            
            {adminTab === "reportes" && (
              <div className="table-container">
                <h2>Reportes Generales</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Proyecto</th>
                      <th>Total Horas</th>
                      <th>Empleados</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dedicacionPorProyecto.map((proy, idx) => (
                      <tr key={idx}>
                        <td>{proy.nombre}</td>
                        <td>{proy.tiempototal || 0}</td>
                        <td>{proy.empleados.length}</td>
                        <td>
                          <span style={{ 
                            backgroundColor: getEstadoColor(proy.estado),
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "0.8rem"
                          }}>
                            {proy.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
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
                      <th>Horas</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empleados.map((e, idx) => (
                      <tr key={idx}>
                        <td>{`${e.nombre} ${e.apellido || ''}`}</td>
                        <td>{e.email}</td>
                        <td>{e.proyecto}</td>
                        <td>{e.horas || 0}</td>
                        <td>
                          <button 
                            className="button" 
                            style={{ width: "auto", padding: "6px 12px", fontSize: "0.9rem" }}
                            onClick={() => handleEditEmpleado(idx)}
                            disabled={cargando}
                          >
                            <FaEdit style={{ marginRight: 4 }} /> Editar
                          </button>
                          <button 
                            className="button button-green" 
                            style={{ width: "auto", padding: "6px 12px", fontSize: "0.9rem", marginLeft: "6px" }}
                            onClick={() => handleDeleteEmpleado(e.id, `${e.nombre} ${e.apellido || ''}`)}
                            disabled={cargando}
                          >
                            <FaTrash style={{ marginRight: 4 }} /> Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                      value={editEmpleadoData.apellido}
                      onChange={e => setEditEmpleadoData(data => ({ ...data, apellido: e.target.value }))}
                      placeholder="Apellido"
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
                      <button 
                        className="button" 
                        style={{ width: "auto" }} 
                        onClick={handleSaveEmpleado}
                        disabled={cargando}
                      >
                        {cargando ? "Guardando..." : "Guardar"}
                      </button>
                      <button 
                        className="button button-green" 
                        style={{ width: "auto" }} 
                        onClick={handleCancelEdit}
                        disabled={cargando}
                      >
                        Cancelar
                      </button>
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
                      <th>Empleados</th>
                      <th>Horas Totales</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proyectos.map((proy, idx) => (
                      <tr key={idx}>
                        <td>{proy.nombre}</td>
                        <td>
                          <span style={{ 
                            backgroundColor: getEstadoColor(proy.estado),
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "0.8rem"
                          }}>
                            {proy.estado}
                          </span>
                        </td>
                        <td>{empleados.filter(e => e.proyecto === proy.nombre).length}</td>
                        <td>{proy.tiempototal || 0}</td>
                        <td>
                          <button 
                            className="button" 
                            style={{ width: "auto", padding: "6px 12px", fontSize: "0.9rem" }}
                            onClick={() => handleEditProyecto(idx)}
                            disabled={cargando}
                          >
                            <FaEdit style={{ marginRight: 4 }} /> Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {editProyectoIdx !== null && (
                  <div className="card" style={{ marginTop: 24, background: "#ede9fe" }}>
                    <h2 style={{ color: "#7c3aed" }}>Editar Proyecto</h2>
                    <input
                      className="input"
                      value={editProyectoData.nombre}
                      onChange={e => setEditProyectoData(data => ({ ...data, nombre: e.target.value }))}
                      placeholder="Nombre del proyecto"
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
                    <div style={{ 
                      width: "100%", 
                      height: "8px", 
                      backgroundColor: "#e5e7eb", 
                      borderRadius: "4px",
                      marginBottom: "16px",
                      overflow: "hidden"
                    }}>
                      <div 
                        style={{ 
                          width: `${getEstadoProgreso(editProyectoData.estado)}%`, 
                          height: "100%", 
                          backgroundColor: getEstadoColor(editProyectoData.estado),
                          transition: "all 0.3s ease"
                        }} 
                      />
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button 
                        className="button" 
                        style={{ width: "auto" }} 
                        onClick={handleSaveProyecto}
                        disabled={cargando}
                      >
                        {cargando ? "Guardando..." : <><FaSave style={{ marginRight: 4 }} /> Guardar</>}
                      </button>
                      <button 
                        className="button button-green" 
                        style={{ width: "auto" }} 
                        onClick={handleCancelEditProyecto}
                        disabled={cargando}
                      >
                        <FaTimes style={{ marginRight: 4 }} /> Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {adminTab === "salarios" && (
              <div className="table-container">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h2 style={{ margin: 0 }}>Cálculo de Salarios</h2>
                  <button 
                    className="button button-green"
                    onClick={descargarExcelSalarios}
                    style={{ 
                      width: "auto", 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px",
                      padding: "10px 16px"
                    }}
                  >
                    <FaDownload /> Descargar Excel
                  </button>
                </div>
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
                      const horas = e.horas || 0;
                      const salarioHora = salarios[e.nombre] || 0;
                      const salarioTotal = horas * salarioHora;
                      return (
                        <tr key={idx}>
                          <td>{`${e.nombre} ${e.apellido || ''}`}</td>
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
