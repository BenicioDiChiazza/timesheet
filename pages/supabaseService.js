import { supabase } from '../supabaseClient'

// Función de prueba de conexión separada
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('proyecto')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    console.log('✅ Conexión a Supabase exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a Supabase:', error);
    return false;
  }
}

// Servicio principal
export const supabaseService = {
  // Obtener todos los proyectos con diagnóstico
  async getProyectos() {
    console.log('🔍 Intentando obtener proyectos desde Supabase...');
    
    const { data, error } = await supabase
      .from('proyecto')
      .select('*')
      .order('nombre');

    if (error) {
      console.error('❌ Error obteniendo proyectos:', error);
      console.log('Detalles del error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log(`✅ Proyectos obtenidos: ${data?.length || 0} proyectos`);
    console.log('Datos de proyectos:', data);
    
    return data || [];
  },

  // Obtener todos los empleados
  async getEmpleados() {
    const { data, error } = await supabase
      .from('empleado')
      .select('*')
    if (error) {
      console.error('Error obteniendo empleados:', error);
      throw error;
    }
    return data || [];
  },

  // Registrar nuevo empleado
  async addEmpleado(empleado) {
    const { data, error } = await supabase
      .from('empleado')
      .insert([{
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        email: empleado.email,
        password: empleado.password,
        proyecto: empleado.proyecto,
        admin: empleado.admin || false,
        horas: empleado.horas || 0
      }])
      .select()
    if (error) {
      console.error('Error agregando empleado:', error);
      throw error;
    }
    return data[0];
  },

  // Login de empleado
  async loginEmpleado(email, password) {
    console.log('🔐 Buscando usuario:', email);
    
    const { data, error } = await supabase
      .from('empleado')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error) {
      console.error('❌ Error en login:', error);
      
      if (error.code === 'PGRST116') {
        throw new Error('No rows found - Credenciales incorrectas');
      }
      
      throw new Error(error.message || 'Error al iniciar sesión');
    }

    if (!data) {
      throw new Error('Credenciales incorrectas');
    }

    console.log('✅ Usuario encontrado:', data);
    return data;
  },

  // Actualizar horas de empleado
  async updateHorasEmpleado(empleadoId, nuevasHoras) {
    const { data, error } = await supabase
      .from('empleado')
      .update({ horas: nuevasHoras })
      .eq('id', empleadoId)
      .select()
    if (error) {
      console.error('Error actualizando horas:', error);
      throw error;
    }
    return data[0];
  },

  // Actualizar proyecto
  async updateProyecto(proyectoId, updates) {
    const { data, error } = await supabase
      .from('proyecto')
      .update(updates)
      .eq('id', proyectoId)
      .select()
    if (error) {
      console.error('Error actualizando proyecto:', error);
      throw error;
    }
    return data[0];
  },

  // Crear nuevo proyecto
  async addProyecto(proyecto) {
    const { data, error } = await supabase
      .from('proyecto')
      .insert([{
        nombre: proyecto.nombre,
        estado: proyecto.estado || 'RELEVAMIENTO',
        cantempleados: proyecto.cantempleados || 0,
        tiempototal: proyecto.tiempototal || 0
      }])
      .select()
    if (error) {
      console.error('Error agregando proyecto:', error);
      throw error;
    }
    return data[0];
  },

  // REGISTRAR HORAS TRABAJADAS - FUNCIÓN NUEVA
  async registrarHorasTrabajadas(empleadoId, proyectoNombre, horas, fecha, comentario) {
    console.log('⏰ Registrando horas:', { empleadoId, proyectoNombre, horas });
    
    // 1. Obtener el empleado actual
    const { data: empleado, error: errorEmpleado } = await supabase
      .from('empleado')
      .select('*')
      .eq('id', empleadoId)
      .single();

    if (errorEmpleado) throw errorEmpleado;

    // 2. Actualizar horas del empleado
    const nuevasHorasEmpleado = (empleado.horas || 0) + Number(horas);
    
    const { data: empleadoActualizado, error: errorUpdateEmpleado } = await supabase
      .from('empleado')
      .update({ horas: nuevasHorasEmpleado })
      .eq('id', empleadoId)
      .select()
      .single();

    if (errorUpdateEmpleado) throw errorUpdateEmpleado;

    // 3. Actualizar tiempo total del proyecto
    const { data: proyecto, error: errorProyecto } = await supabase
      .from('proyecto')
      .select('*')
      .eq('nombre', proyectoNombre)
      .single();

    if (errorProyecto) throw errorProyecto;

    const nuevoTiempoTotal = (proyecto.tiempototal || 0) + Number(horas);
    
    const { data: proyectoActualizado, error: errorUpdateProyecto } = await supabase
      .from('proyecto')
      .update({ tiempototal: nuevoTiempoTotal })
      .eq('nombre', proyectoNombre)
      .select()
      .single();

    if (errorUpdateProyecto) throw errorUpdateProyecto;

    console.log('✅ Horas registradas exitosamente');
    
    return {
      empleado: empleadoActualizado,
      proyecto: proyectoActualizado,
      horasRegistradas: horas,
      fecha: fecha,
      comentario: comentario
    };
  },

  // OBTENER RESUMEN DE HORAS - FUNCIÓN NUEVA
  async getResumenHoras() {
    // Como no tenemos tabla de reportes, generamos un resumen desde empleados
    const { data: empleados, error } = await supabase
      .from('empleado')
      .select('*');

    if (error) throw error;

    // Crear un resumen básico
    const resumen = empleados.map(emp => ({
      empleado: `${emp.nombre} ${emp.apellido}`,
      proyecto: emp.proyecto,
      horas: emp.horas || 0,
      ultimaActualizacion: new Date().toISOString().split('T')[0]
    }));

    return resumen;
  },
  // Actualizar empleado
async updateEmpleado(empleadoId, updates) {
  console.log('👤 Actualizando empleado:', empleadoId, updates);
  
  const { data, error } = await supabase
    .from('empleado')
    .update(updates)
    .eq('id', empleadoId)
    .select()
    .single();

  if (error) {
    console.error('Error actualizando empleado:', error);
    throw error;
  }

  console.log('✅ Empleado actualizado:', data);
  return data;
},
// Eliminar empleado
async deleteEmpleado(empleadoId) {
  console.log('🗑️ Eliminando empleado:', empleadoId);
  
  const { error } = await supabase
    .from('empleado')
    .delete()
    .eq('id', empleadoId);

  if (error) {
    console.error('Error eliminando empleado:', error);
    throw error;
  }

  console.log('✅ Empleado eliminado');
  return true;
},
// Actualizar proyecto
async updateProyecto(proyectoId, updates) {
  console.log('🚀 Actualizando proyecto:', proyectoId, updates);
  
  const { data, error } = await supabase
    .from('proyecto')
    .update(updates)
    .eq('id', proyectoId)
    .select()
    .single();

  if (error) {
    console.error('Error actualizando proyecto:', error);
    throw error;
  }

  console.log('✅ Proyecto actualizado:', data);
  return data;
}
};