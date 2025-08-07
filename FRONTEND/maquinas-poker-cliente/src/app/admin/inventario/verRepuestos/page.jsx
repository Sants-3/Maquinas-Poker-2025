"use client"

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function RepuestosPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingRepuesto, setEditingRepuesto] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUbicacion, setFilterUbicacion] = useState("");
  const [repuestos, setRepuestos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [loadingData, setLoadingData] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [recharge, setRecharge] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    descripcion: "",
    proveedor_id: 0,
    precio_unitario: 0,
    ubicacion_almacen: 0,
    compatible_con: "",
    fecha_ultimo_reabastecimiento: "",
  })

  const filteredRepuestos = repuestos.filter((repuesto) => {
    const matchesSearch =
      repuesto.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repuesto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repuesto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repuesto.compatible_con?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesUbicacion = filterUbicacion === "" || repuesto.ubicacion.id.toString() === filterUbicacion

    return matchesSearch && matchesUbicacion
  })

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Form Data:", formData);

    if (editingRepuesto) {
      try {
        const response = await fetch(`http://localhost:4000/api/inventario/repuesto`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            id: editingRepuesto.id,
            nombre: formData.nombre,
            codigo: formData.codigo,
            descripcion: formData.descripcion,
            proveedor_id: formData.proveedor_id,
            precio_unitario: formData.precio_unitario,
            ubicacion_almacen: formData.ubicacion_almacen,
            compatible_con: formData.compatible_con,
            fecha_ultimo_reabastecimiento: formData.fecha_ultimo_reabastecimiento
          }),
        });

        if (response.ok) {
          setIsLogging(true);
          setShowModal(false);
          setRecharge(recharge => !recharge);
        } else {
          console.error('Error al actualizar el repuesto:', response.statusText);
        }
      } catch (error) {
        console.error('Error al actualizar el repuesto:', error);
      } finally {
        resetForm()
        setIsLoading(false);
        setIsLogging(false);
        setShowModal(false)
      }
    } else {
      try {
        const response = await fetch(`http://localhost:4000/api/inventario/repuesto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            nombre: formData.nombre,
            codigo: formData.codigo,
            descripcion: formData.descripcion,
            proveedor_id: formData.proveedor_id,
            precio_unitario: formData.precio_unitario,
            ubicacion_almacen: formData.ubicacion_almacen,
            compatible_con: formData.compatible_con,
            fecha_ultimo_reabastecimiento: formData.fecha_ultimo_reabastecimiento
          }),
        });

        if (response.ok) {
          setIsLogging(true);
          setRecharge(recharge => !recharge);
        } else {
          console.error('Error al crear el repuesto:', response.statusText);
        }
      } catch (error) {
        console.error('Error al crear el repuesto:', error);
      } finally {
        resetForm()
        setIsLoading(false);
        setIsLogging(false);
        setShowModal(false)
      }
    }
  };

  const handleEdit = (repuesto) => {
    setEditingRepuesto(repuesto)
    setFormData({
      nombre: repuesto.nombre,
      codigo: repuesto.codigo,
      descripcion: repuesto.descripcion,
      proveedor_id: repuesto.proveedor?.id || 0,
      precio_unitario: repuesto.precio_unitario || 0,
      ubicacion_almacen: repuesto.ubicacion?.id || 0,
      compatible_con: repuesto.compatible_con || "",
      fecha_ultimo_reabastecimiento: repuesto.fecha_ultimo_reabastecimiento || ""
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de que quieres eliminar este repuesto?")) {
      try {
        const response = await fetch(`http://localhost:4000/api/inventario/repuesto?id=${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          setRepuestos(repuestos.filter((repuesto) => repuesto.id !== id));
        } else {
          console.error('Error al eliminar el repuesto:', response.statusText);
        }
      } catch (error) {
        console.error('Error al eliminar el repuesto:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      codigo: "",
      descripcion: "",
      proveedor_id: 0,
      precio_unitario: 0,
      ubicacion_almacen: 0,
      compatible_con: "",
      fecha_ultimo_reabastecimiento: "",
    })
    setEditingRepuesto(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    resetForm()
  }

  function formatDateToYMD(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/inventario/repuesto', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });

        const data = await response.json();
        setRepuestos(data);
      } catch (error) {
        console.error('Error al obtener datos de repuestos:', error);
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
    
    obtenerUbicaciones();
    obtenerProveedores();
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
                  <h4 className="mb-0">Gestión de Repuestos</h4>
                  <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Nuevo Repuesto
                  </button>
                </div>
              </div>

              <div className="card-body">
                {/* Filtros y búsqueda */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar por código, nombre, descripción o compatibilidad..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
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
                        setFilterUbicacion("")
                      }}
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                {/* Tabla de repuestos */}
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Proveedor</th>
                        <th>Precio</th>
                        <th>Ubicación</th>
                        <th>Compatible con</th>
                        <th>Últ. Reabastecimiento</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRepuestos.map((repuesto) => (
                        <tr key={repuesto.id}>
                          <td>
                            <code className="small">{repuesto.codigo || "N/A"}</code>
                          </td>
                          <td>
                            <div className="fw-medium">{repuesto.nombre}</div>
                          </td>
                          <td>
                            <small>{repuesto.descripcion}</small>
                          </td>
                          <td>
                            <small>{repuesto?.proveedor?.nombre || "N/A"}</small>
                          </td>
                          <td>
                            {repuesto.precio_unitario ? 
                              `$${parseFloat(repuesto.precio_unitario).toFixed(2)}` : "N/A"}
                          </td>
                          <td>{repuesto.ubicacion?.nombre || "N/A"}</td>
                          <td>
                            <small>{repuesto.compatible_con || "N/A"}</small>
                          </td>
                          <td>
                            {repuesto.fecha_ultimo_reabastecimiento
                              ? formatDateToYMD(repuesto.fecha_ultimo_reabastecimiento)
                              : "N/A"}
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEdit(repuesto)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(repuesto.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredRepuestos.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted">No se encontraron repuestos</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para agregar/editar repuesto */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingRepuesto ? "Editar Repuesto" : "Nuevo Repuesto"}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
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
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Código</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.codigo}
                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                        placeholder="Código interno o de proveedor"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Descripción *</label>
                    <textarea
                      className="form-control"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Proveedor *</label>
                      <select
                        className="form-select"
                        value={formData.proveedor_id}
                        onChange={(e) => setFormData({ ...formData, proveedor_id: Number(e.target.value) })}
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
                      <label className="form-label">Precio Unitario</label>
                      <input
                         type="number"
                         step="0.01"
                         className="form-control"
                         value={formData.precio_unitario || ''}
                         onChange={(e) => setFormData({ ...formData, precio_unitario: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Ubicación en Almacén *</label>
                      <select
                        className="form-select"
                        value={formData.ubicacion_almacen}
                        onChange={(e) => setFormData({ ...formData, ubicacion_almacen: Number(e.target.value) })}
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
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Fecha Último Reabastecimiento</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.fecha_ultimo_reabastecimiento ? formatDateToYMD(formData.fecha_ultimo_reabastecimiento) : formData.fecha_ultimo_reabastecimiento}
                        onChange={(e) => setFormData({ ...formData, fecha_ultimo_reabastecimiento: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Compatible con</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.compatible_con}
                      onChange={(e) => setFormData({ ...formData, compatible_con: e.target.value })}
                      placeholder="Modelos de máquinas o equipos con los que es compatible"
                    />
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
                      editingRepuesto ? "Actualizar Repuesto" : "Crear Repuesto"
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