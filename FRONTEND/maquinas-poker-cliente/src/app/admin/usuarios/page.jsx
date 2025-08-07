"use client"
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function UsuariosPage() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [usuarios, setUsuarios] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRol, setFilterRol] = useState("")
  const [filterActivo, setFilterActivo] = useState("")
  const [loadingData, setLoadingData] = useState(true)
  const [isLogging, setIsLogging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "cliente",
    activo: true,
    telefono: "",
    mfa_secret: "",
  })

  const roles = ["admin", "cliente", "tecnico"]

  const Createroles = ["cliente", "tecnico"]

  const filteredUsuarios = usuarios.filter((usuario) => {
    const matchesSearch =
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRol = filterRol === "" || usuario.rol === filterRol
    const matchesActivo = filterActivo === "" || usuario.activo.toString() === filterActivo

    return matchesSearch && matchesRol && matchesActivo
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    if (editingUser) {
      // Actualizar usuario existente
      const modifyusuario = {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        rol: formData.rol,
        telefono: formData.telefono,
        activo: formData.activo,
        mfa_secret: formData.mfa_secret || null,
      }

      try {
        const response = await fetch('http://localhost:4000/api/usuarios', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            id: editingUser.id,
            userData: modifyusuario
          })
        });

        if (response.ok) {
          setIsLogging(true);
          setShowModal(false);
          setUsuarios(usuarios.map((user) =>
            user.id === editingUser.id ? { ...user, ...modifyusuario } : user
          ));
        } else {
          console.error('Error al crear la máquina:', response.statusText);
        }
      } catch (error) {
        console.error('Error al crear la máquina:', error);
      } finally {
        resetForm()
        setIsLoading(false);
        setIsLogging(false);
      }

    } else {
      // Crear nuevo usuario

      try {
      const response = await fetch('http://localhost:4000/api/usuarios/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            nombre: formData.nombre,
            email: formData.email,
            password: formData.password,
            rol: formData.rol,
            activo: formData.activo,
            telefono: formData.telefono,
            mfa_secret: formData.mfa_secret,
          })
      });

      if (response.ok) {
        setIsLogging(true);
        const data = await response.json();
        setUsuarios([...usuarios, data.newUser]);
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
  }

  const handleEdit = (usuario) => {
    setEditingUser(usuario)
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: "",
      rol: usuario.rol,
      activo: usuario.activo,
      telefono: usuario.telefono,
      mfa_secret: usuario.mfa_secret || "",
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        const response = await fetch(`http://localhost:4000/api/usuarios`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ id }),
        });

        if (response.ok) {
          setUsuarios(usuarios.filter((user) => user.id !== id));
        } else {
          console.error('Error al eliminar el usuario:', response.statusText);
        }
      } catch (error) {
        console.error('Error al eliminar el usuario:', error);
      }
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      email: "",
      password: "",
      rol: "operador",
      activo: true,
      telefono: "",
      mfa_secret: "",
    })
    setEditingUser(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    resetForm()
  }

  useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch('http://localhost:4000/api/usuarios', {
              method: 'GET',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
          });
  
          const data = await response.json();
          setUsuarios(data);
        } catch (error) {
          console.error('Error al obtener datos de usuarios:', error);
        } finally {
          setLoadingData(false);
        }
      };
  
      fetchData();
    }, []);

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
                    <h4 className="mb-0">Gestión de Usuarios</h4>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                      <i className="bi bi-plus-circle me-2"></i>
                      Nuevo Usuario
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
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="col-md-3">
                      <select className="form-select" value={filterRol} onChange={(e) => setFilterRol(e.target.value)}>
                        <option value="">Todos los roles</option>
                        {roles.map((rol) => (
                          <option key={rol} value={rol}>
                            {rol}
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
                        <option value="1">Activos</option>
                        <option value="0">Inactivos</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() => {
                          setSearchTerm("")
                          setFilterRol("")
                          setFilterActivo("")
                        }}
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>

                  {/* Tabla de usuarios */}
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>ID</th>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Rol</th>
                          <th>Estado</th>
                          <th>Teléfono</th>
                          <th>Último Login</th>
                          <th>MFA</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsuarios.map((usuario) => (
                          <tr key={usuario.id}>
                            <td>{usuario.id}</td>
                            <td>{usuario.nombre}</td>
                            <td>{usuario.email}</td>
                            <td>
                              <span
                                className={`badge ${
                                  usuario.rol === "admin"
                                    ? "bg-danger"
                                    : usuario.rol === "cliente"
                                      ? "bg-warning"
                                      : usuario.rol === "tecnico"
                                        ? "bg-info"
                                        : "bg-secondary"
                                }`}
                              >
                                {usuario.rol}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${usuario.activo ? "bg-success" : "bg-danger"}`}>
                                {usuario.activo ? "Activo" : "Inactivo"}
                              </span>
                            </td>
                            <td>{usuario.telefono}</td>
                            <td>
                              {usuario.ultimo_login ? new Date(usuario.ultimo_login).toLocaleDateString() : "Nunca"}
                            </td>
                            <td>
                              {usuario.mfa_secret ? (
                                <i className="bi bi-shield-check text-success"></i>
                              ) : (
                                <i className="bi bi-shield-x text-muted"></i>
                              )}
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(usuario)}>
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(usuario.id)}
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

                  {filteredUsuarios.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-muted">No se encontraron usuarios</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal para agregar/editar usuario */}
        {showModal && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</h5>
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
                        <label className="form-label">
                          {editingUser ? "Nueva Contraseña (opcional)" : "Contraseña *"}
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required={!editingUser}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Teléfono</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Rol *</label>
                        <select
                          className="form-select"
                          value={formData.rol}
                          onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                          required
                        >
                          {Createroles.map((rol) => (
                            <option key={rol} value={rol}>
                              {rol}
                            </option>
                          ))}
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

                    <div className="mb-3">
                      <label className="form-label">MFA Secret (opcional)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.mfa_secret}
                        onChange={(e) => setFormData({ ...formData, mfa_secret: e.target.value })}
                        placeholder="Secreto para autenticación de dos factores"
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
                        editingUser ? "Actualizar Usuario" : "Crear Usuario"
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