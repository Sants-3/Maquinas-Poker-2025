"use client"

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
export default function MaquinasPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingMaquina, setEditingMaquina] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterUbicacion, setFilterUbicacion] = useState("");
  const [maquinas, setMaquinas] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [loadingData, setLoadingData] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [recharge, setRecharge] = useState(false);


    const [formData, setFormData] = useState({
      numero_serie: "",
      nombre: "",
      modelo: "",
      fecha_adquisicion: "",
      fecha_instalacion: "",
      proveedor_id: 0,
      estado: "Operativo",
      ultima_ubicacion_id: 0,
      ultimo_mantenimiento: "",
      proximo_mantenimiento: "",
      notas: "",
      usuario_id: 0,
    })

    const estados = [
      { value: "Operativo", label: "Operativa", color: "success" },
      { value: "Advertencia", label: "En Alerta", color: "warning" },
      { value: "Error", label: "Fuera de Servicio", color: "danger" },
      { value: "En Mantenimiento", label: "En Mantenimiento", color: "info" },
      { value: "Almacen", label: "Almacenada", color: "secondary" },
    ]

    const filteredMaquinas = maquinas.filter((maquina) => {
      const matchesSearch =
        maquina.numero_serie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        maquina.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        maquina.modelo.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesEstado = filterEstado === "" || maquina.estado === filterEstado
      const matchesUbicacion = filterUbicacion === "" || maquina.ubicacion.id.toString() === filterUbicacion

      return matchesSearch && matchesEstado && matchesUbicacion
    })

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Form Data:", formData);

    if (editingMaquina) {

      try {
        const response = await fetch('http://localhost:4000/api/inventario/maquinas', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            id: editingMaquina.id,
            numero_serie: formData.numero_serie,
            nombre: formData.nombre,
            modelo: formData.modelo,
            fecha_adquisicion: formData.fecha_adquisicion,
            fecha_instalacion: formData.fecha_instalacion,
            estado: formData.estado,
            ultima_ubicacion_id: formData.ultima_ubicacion_id,
            usuario_id: formData.usuario_id,
            proveedor_id: formData.proveedor_id,
            ultimo_mantenimiento: formData.ultimo_mantenimiento,
            proximo_mantenimiento: formData.proximo_mantenimiento,
            notas: formData.notas
          }),
        });

        if (response.ok) {
          setIsLogging(true);
          setShowModal(false);
          setRecharge(recharge => !recharge);
        } else {
          console.error('Error al actualizar la máquina:', response.statusText);
        }
      } catch (error) {
        console.error('Error al actualizar la máquina:', error);
      } finally {
      resetForm()
      setIsLoading(false);
      setIsLogging(false);
      setShowModal(false)
     }

    } else {
      // Crear nueva máquina
      console.log("Creando nueva máquina con datos:", formData);
      try {
        const response = await fetch('http://localhost:4000/api/inventario/maquinas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            numero_serie: formData.numero_serie,
            nombre: formData.nombre,
            modelo: formData.modelo,
            fecha_adquisicion: formData.fecha_adquisicion,
            fecha_instalacion: formData.fecha_instalacion,
            estado: formData.estado,
            ultima_ubicacion_id: formData.ultima_ubicacion_id,
            usuario_id: formData.usuario_id,
            proveedor_id: formData.proveedor_id,
            ultimo_mantenimiento: formData.ultimo_mantenimiento,
            proximo_mantenimiento: formData.proximo_mantenimiento,
            notas: formData.notas
          }),
        });

        if (response.ok) {
          setIsLogging(true);
          setRecharge(recharge => !recharge);
        } else {
          console.error('Error al crear la máquina:', response.statusText);
        }
      } catch (error) {
        console.error('Error al crear la máquina:', error);
      } finally {
      resetForm()
      setIsLoading(false);
      setIsLogging(false);
      setShowModal(false)
     }
    }
  };

  const handleEdit = (maquina) => {
    setEditingMaquina(maquina)
    setFormData({
      numero_serie: maquina.numero_serie,
      nombre: maquina.nombre,
      modelo: maquina.modelo,
      fecha_adquisicion: maquina.fecha_adquisicion,
      fecha_instalacion: maquina.fecha_instalacion,
      proveedor_id: maquina.proveedor.id,
      estado: maquina.estado,
      ultima_ubicacion_id: maquina.ubicacion.id,
      ultimo_mantenimiento: maquina.ultimo_mantenimiento || "",
      proximo_mantenimiento: maquina.proximo_mantenimiento,
      notas: maquina.notas,
      usuario_id: maquina?.usuario?.id,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta máquina?")) {
      try {
        const response = await fetch(`http://localhost:4000/api/inventario/maquinas?id=${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          setMaquinas(maquinas.filter((maquina) => maquina.id !== id));
        } else {
          console.error('Error al eliminar la máquina:', response.statusText);
        }
      } catch (error) {
        console.error('Error al eliminar la máquina:', error);
      }
    }
  };


  const resetForm = () => {
    setFormData({
      numero_serie: "",
      nombre: "",
      modelo: "",
      fecha_adquisicion: "",
      fecha_instalacion: "",
      proveedor_id: 0,
      estado: "Operativo",
      ultima_ubicacion_id: 0,
      ultimo_mantenimiento: "",
      proximo_mantenimiento: "",
      notas: "",
      usuario_id: 0,
    })
    setEditingMaquina(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    resetForm()
  }

   const getEstadoInfo = (estado) => {
    return estados.find((e) => e.value === estado) || { value: estado, label: estado, color: "secondary" }
  }

  function formatDateToYMD(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // Retorna "2025-06-04"
}


  useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/inventario/maquinas', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      setMaquinas(data);
    } catch (error) {
      console.error('Error al obtener datos de máquinas:', error);
    } finally {
      setLoadingData(false);
    }
  };

    const obtenerUbicaciones = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/ubicaciones`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });

        const data = await response.json();
        setUbicaciones(data);
      } catch (error) {
        console.error('Error al obtener datos de ubicaciones:', error);
      }
    };

    const obtenerProveedores = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/inventario/proveedor`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });

        const data = await response.json();
        setProveedores(data);
      } catch (error) {
        console.error('Error al obtener datos de proveedores:', error);
      }
    };

    const obtenerUsuarios = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/usuarios`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });

        const data = await response.json();
        const usuariosFiltrados = data.filter(usuario => usuario.rol === "cliente");
        setUsuarios(usuariosFiltrados);
      } catch (error) {
        console.error('Error al obtener datos de usuarios:', error);
      }
    };
    
    obtenerUbicaciones();
    obtenerProveedores();
    obtenerUsuarios();
    fetchData();
  }, [recharge]);

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <>
    
      <div className="container-fluid p-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">Gestión de Máquinas</h4>
                  <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Nueva Máquina
                  </button>
                </div>
              </div>

              <div className="card-body">
                {/* Filtros y búsqueda */}
                <div className="row mb-4">
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar por serie, nombre o modelo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={filterEstado}
                      onChange={(e) => setFilterEstado(e.target.value)}
                    >
                      <option value="">Todos los estados</option>
                      {estados.map((estado) => (
                        <option key={estado.value} value={estado.value}>
                          {estado.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={filterUbicacion}
                      onChange={(e) => setFilterUbicacion(e.target.value)}
                    >
                      <option value="">Todas las ubicaciones</option>
                      {ubicaciones.map((ubicacion) => (
                        <option key={ubicacion.id} value={ubicacion.id.toString()}>
                          {ubicacion.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <button
                      className="btn btn-outline-secondary w-100"
                      onClick={() => {
                        setSearchTerm("")
                        setFilterEstado("")
                        setFilterUbicacion("")
                      }}
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                {/* Tabla de máquinas */}
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Serie</th>
                        <th>Nombre</th>
                        <th>Modelo</th>
                        <th>Estado</th>
                        <th>Ubicación</th>
                        <th>Proveedor</th>
                        <th>Último Mant.</th>
                        <th>Próximo Mant.</th>
                        <th>Asignado a</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMaquinas.map((maquina) => {
                        const estadoInfo = getEstadoInfo(maquina.estado)
                        return (
                          <tr key={maquina.id}>
                            <td>
                              <code className="small">{maquina.numero_serie}</code>
                            </td>
                            <td>
                              <div className="fw-medium">{maquina.nombre}</div>
                            </td>
                            <td>{maquina.modelo}</td>
                            <td className="text-center">
                              <span className={`badge bg-${estadoInfo.color}`}>{estadoInfo.label}</span>
                            </td>
                            <td>{maquina.ubicacion.nombre}</td>
                            <td>
                              <small>{maquina?.proveedor?.nombre ?? "No hay proveedor"}</small>
                            </td>
                            <td>
                              {maquina.ultimo_mantenimiento
                                ? formatDateToYMD(maquina.ultimo_mantenimiento)
                                : "N/A"}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  formatDateToYMD(maquina.proximo_mantenimiento) < formatDateToYMD(new Date())
                                    ? "bg-danger"
                                    : formatDateToYMD(maquina.proximo_mantenimiento) <
                                        formatDateToYMD(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                      ? "bg-warning"
                                      : "bg-success"
                                }`}
                              >
                                {formatDateToYMD(maquina.proximo_mantenimiento)}
                              </span>
                            </td>
                            <td>
                              <small>{maquina?.usuario?.nombre}</small>
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <button
                                  className="btn btn-sm btn-outline-info"
                                  title="Ver detalles"
                                  onClick={() => alert(`Notas: ${maquina.notas}`)}
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleEdit(maquina)}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(maquina.id)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredMaquinas.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted">No se encontraron máquinas</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para agregar/editar máquina */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingMaquina ? "Editar Máquina" : "Nueva Máquina"}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Número de Serie *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.numero_serie}
                        onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })}
                        placeholder="PKR-2024-001"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nombre *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Modelo *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.modelo}
                        onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Estado *</label>
                      <select
                        className="form-select"
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                        required
                      >
                        {estados.map((estado) => (
                          <option key={estado.value} value={estado.value}>
                            {estado.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Fecha de Adquisición *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.fecha_adquisicion ? formatDateToYMD(formData.fecha_adquisicion): formData.fecha_adquisicion}
                        onChange={(e) => setFormData({ ...formData, fecha_adquisicion: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Fecha de Instalación *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.fecha_instalacion ? formatDateToYMD(formData.fecha_instalacion) : formData.fecha_instalacion}
                        onChange={(e) => setFormData({ ...formData, fecha_instalacion: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Proveedor *</label>
                      <select
                        className="form-select"
                        value={formData.proveedor_id}
                        onChange={(e) => setFormData({ ...formData, proveedor_id: Number.parseInt(e.target.value) })}
                        required
                      >
                        <option value={0}>Seleccionar proveedor</option>
                        {proveedores.map((proveedor) => (
                          <option key={proveedor.id} value={proveedor.id}>
                            {proveedor.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Ubicación Actual *</label>
                      <select
                        className="form-select"
                        value={formData.ultima_ubicacion_id}
                        onChange={(e) =>
                          setFormData({ ...formData, ultima_ubicacion_id: Number.parseInt(e.target.value) })
                        }
                        required
                      >
                        <option value={0}>Seleccionar ubicación</option>
                        {ubicaciones.map((ubicacion) => (
                          <option key={ubicacion.id} value={ubicacion.id}>
                            {ubicacion.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Último Mantenimiento</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.ultimo_mantenimiento ? formatDateToYMD(formData.ultimo_mantenimiento) : formData.ultimo_mantenimiento}
                        onChange={(e) => setFormData({ ...formData, ultimo_mantenimiento: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Próximo Mantenimiento *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.proximo_mantenimiento ? formatDateToYMD(formData.proximo_mantenimiento) : formData.proximo_mantenimiento}
                        onChange={(e) => setFormData({ ...formData, proximo_mantenimiento: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Responsable *</label>
                      <select
                        className="form-select"
                        value={formData.usuario_id}
                        onChange={(e) => setFormData({ ...formData, usuario_id: Number.parseInt(e.target.value) })}
                        required
                      >
                        <option value={0}>Seleccionar responsable</option>
                        {usuarios.map((usuario) => (
                          <option key={usuario.id} value={usuario.id}>
                            {usuario.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Notas</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.notas}
                      onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                      placeholder="Observaciones, estado general, historial de problemas, etc."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {isLoading ? (
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : isLogging ? (
                      <i className="bi bi-check-all"></i>
                    ) : (
                      editingMaquina ? "Actualizar Máquina" : "Crear Máquina"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        )}
    </>
  )
}