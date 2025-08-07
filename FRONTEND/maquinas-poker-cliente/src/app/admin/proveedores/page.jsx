"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export default function ProveedoresPage() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [proveedores, setProveedores] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingProveedor, setEditingProveedor] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTipoServicio, setFilterTipoServicio] = useState("")
  const [filterActivo, setFilterActivo] = useState("")
  const [loadingData, setLoadingData] = useState(true)
  const [isLogging, setIsLogging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recharge, setRecharge] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    contacto: "",
    telefono: "",
    email: "",
    rtn: "",
    tipo_servicio: "",
    calificacion: 5,
    activo: true,
  })

  const tiposServicio = [
    "Mantenimiento Técnico",
    "Repuestos y Componentes",
    "Limpieza y Mantenimiento",
    "Sistemas de Seguridad",
    "Software y Licencias",
    "Consultoría",
    "Transporte y Logística",
    "Servicios Generales",
  ]

  const filteredProveedores = proveedores.filter((proveedor) => {
    const matchesSearch =
      proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proveedor.contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proveedor.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTipoServicio = filterTipoServicio === "" || proveedor.tipo_servicio === filterTipoServicio
    const matchesActivo = filterActivo === "" || proveedor.activo.toString() === filterActivo

    return matchesSearch && matchesTipoServicio && matchesActivo
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    if (editingProveedor) {
      // Actualizar proveedor existente
      const modifyProveedor = {
        id: editingProveedor.id,
        nombre: formData.nombre,
        contacto: formData.contacto,
        telefono: formData.telefono,
        email: formData.email,
        rtn: formData.rtn,
        tipo_servicio: formData.tipo_servicio,
        calificacion: formData.calificacion,
        activo: formData.activo,
      }

      try {
        const response = await fetch('http://localhost:4000/api/inventario/proveedor', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(modifyProveedor)
        });

        if (response.ok) {
          setIsLogging(true);
          setProveedores(proveedores.map((proveedor) =>
            proveedor.id === editingProveedor.id ? { ...proveedor, ...modifyProveedor } : proveedor
          ));
        } else {
          console.error('Error al crear la máquina:', response.statusText);
        }
      } catch (error) {
        console.error('Error al crear la máquina:', error);
      } finally {
        setIsLoading(false);
        setIsLogging(false);
      }


    } else {
      // Crear nuevo proveedor
      const newProveedor = {
        nombre: formData.nombre,
        contacto: formData.contacto,
        telefono: formData.telefono,
        email: formData.email,
        rtn: formData.rtn,
        tipo_servicio: formData.tipo_servicio,
        calificacion: formData.calificacion,
        activo: formData.activo,
      }
      
      try {
        const response = await fetch('http://localhost:4000/api/inventario/proveedor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(newProveedor)
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
        setIsLoading(false);
        setIsLogging(false);
      }

    }

    resetForm()
    setShowModal(false)
  }

  const handleEdit = (proveedor) => {
    setEditingProveedor(proveedor)
    setFormData({
      nombre: proveedor.nombre,
      contacto: proveedor.contacto,
      telefono: proveedor.telefono,
      email: proveedor.email,
      rtn: proveedor.rtn,
      tipo_servicio: proveedor.tipo_servicio,
      calificacion: proveedor.calificacion,
      activo: proveedor.activo,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de que quieres eliminar este proveedor?")) {
      try {
        const response = await fetch(`http://localhost:4000/api/inventario/proveedor?id=${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          setProveedores(proveedores.filter((proveedor) => proveedor.id !== id));
        } else {
          console.error('Error al eliminar el proveedor:', response.statusText);
        }
      } catch (error) {
        console.error('Error al eliminar el proveedor:', error);
      }
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      contacto: "",
      telefono: "",
      email: "",
      rtn: "",
      tipo_servicio: "",
      calificacion: 5,
      activo: true,
    })
    setEditingProveedor(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    resetForm()
  }

  const getCalificacionStars = (calificacion) => {
    const stars = []
    const fullStars = Math.floor(calificacion)
    const hasHalfStar = calificacion % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="bi bi-star-fill text-warning"></i>)
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="bi bi-star-half text-warning"></i>)
    }

    const emptyStars = 5 - Math.ceil(calificacion)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="bi bi-star text-muted"></i>)
    }

    return stars
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/inventario/proveedor', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        });

        const data = await response.json();
        setProveedores(data);
      } catch (error) {
        console.error('Error al obtener datos de proveedores:', error);
      } finally {
        setLoadingData(false);
      }
    };

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
                    <h4 className="mb-0">Gestión de Proveedores</h4>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                      <i className="bi bi-plus-circle me-2"></i>
                      Nuevo Proveedor
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
                        placeholder="Buscar por nombre, contacto o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="col-md-3">
                      <select
                        className="form-select"
                        value={filterTipoServicio}
                        onChange={(e) => setFilterTipoServicio(e.target.value)}
                      >
                        <option value="">Todos los servicios</option>
                        {tiposServicio.map((tipo) => (
                          <option key={tipo} value={tipo}>
                            {tipo}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <select
                        className="form-select"
                        value={filterActivo}
                        onChange={(e) => setFilterActivo(e.target.value)}
                      >
                        <option value="">Todos los estados</option>
                        <option value="true">Activos</option>
                        <option value="false">Inactivos</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() => {
                          setSearchTerm("")
                          setFilterTipoServicio("")
                          setFilterActivo("")
                        }}
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>

                  {/* Tabla de proveedores */}
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>ID</th>
                          <th>Nombre</th>
                          <th>Contacto</th>
                          <th>Teléfono</th>
                          <th>Email</th>
                          <th>RTN</th>
                          <th>Tipo de Servicio</th>
                          <th>Calificación</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProveedores.map((proveedor) => (
                          <tr key={proveedor.id}>
                            <td>{proveedor.id}</td>
                            <td>
                              <div className="fw-medium">{proveedor.nombre}</div>
                            </td>
                            <td>{proveedor.contacto}</td>
                            <td>{proveedor.telefono}</td>
                            <td>{proveedor.email}</td>
                            <td>
                              <code className="small">{proveedor.rtn}</code>
                            </td>
                            <td>
                              <span className="badge bg-info">{proveedor.tipo_servicio}</span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="me-2">{getCalificacionStars(proveedor.calificacion)}</div>
                                <small className="text-muted">({proveedor.calificacion})</small>
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${proveedor.activo ? "bg-success" : "bg-danger"}`}>
                                {proveedor.activo ? "Activo" : "Inactivo"}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleEdit(proveedor)}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(proveedor.id)}
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

                  {filteredProveedores.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-muted">No se encontraron proveedores</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal para agregar/editar proveedor */}
        {showModal && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingProveedor ? "Editar Proveedor" : "Nuevo Proveedor"}</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Nombre de la Empresa *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Persona de Contacto *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.contacto}
                          onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Teléfono *</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                          placeholder="+504-2234-5678"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">RTN *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.rtn}
                          onChange={(e) => setFormData({ ...formData, rtn: e.target.value })}
                          placeholder="08011998123456"
                          required
                        />
                        <div className="form-text">Registro Tributario Nacional</div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Tipo de Servicio *</label>
                        <select
                          className="form-select"
                          value={formData.tipo_servicio}
                          onChange={(e) => setFormData({ ...formData, tipo_servicio: e.target.value })}
                          required
                        >
                          <option value="">Seleccionar tipo de servicio</option>
                          {tiposServicio.map((tipo) => (
                            <option key={tipo} value={tipo}>
                              {tipo}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Calificación</label>
                        <select
                          className="form-select"
                          value={formData.calificacion}
                          onChange={(e) =>
                            setFormData({ ...formData, calificacion: Number.parseFloat(e.target.value) })
                          }
                        >
                          <option value={5}>5 - Excelente</option>
                          <option value={4.5}>4.5 - Muy Bueno</option>
                          <option value={4}>4 - Bueno</option>
                          <option value={3.5}>3.5 - Regular</option>
                          <option value={3}>3 - Aceptable</option>
                          <option value={2.5}>2.5 - Deficiente</option>
                          <option value={2}>2 - Malo</option>
                          <option value={1.5}>1.5 - Muy Malo</option>
                          <option value={1}>1 - Pésimo</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Estado</label>
                        <select
                          className="form-select"
                          value={formData.activo.toString()}
                          onChange={(e) => setFormData({ ...formData, activo: e.target.value === "true" })}
                        >
                          <option value="true">Activo</option>
                          <option value="false">Inactivo</option>
                        </select>
                      </div>
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
                        editingProveedor ? "Actualizar Proveedor" : "Crear Proveedor"
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