"use client"

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function FinanzasPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingFinanza, setEditingFinanza] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterMoneda, setFilterMoneda] = useState("");
  const [finanzas, setFinanzas] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [ordenesTrabajo, setOrdenesTrabajo] = useState([]);
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [loadingData, setLoadingData] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [recharge, setRecharge] = useState(false);

  const [formData, setFormData] = useState({
    tipo_movimiento: "Ingreso",
    monto: 0,
    moneda: "Lps",
    fecha_movimiento: "",
    maquina_id: 0,
    usuario_id: 0,
    transaccion_id: 0,
    orden_trabajo_id: 0,
    referencia_externa: "",
    notas: "",
  });

  const tiposMovimiento = [
    { value: "Ingreso", label: "Ingreso" },
    { value: "Egreso", label: "Egreso" },
    { value: "Transferencia", label: "Transferencia" },
    { value: "Ajuste", label: "Ajuste" },
  ];

  const monedas = [
    { value: "USD", label: "Dólares (USD)" },
    { value: "EUR", label: "Euros (EUR)" },
    { value: "MXN", label: "Pesos Mexicanos (MXN)" },
    { value: "Lps", label: "Lempiras (Lps)" },
  ];

  // Mapa para relación máquina -> usuario
  const [maquinaUsuarioMap, setMaquinaUsuarioMap] = useState({});

  useEffect(() => {
    if (maquinas.length > 0) {
      const map = {};
      maquinas.forEach(maquina => {
        if (maquina.usuario_id) {
          map[maquina.id] = maquina.usuario_id;
        }
      });
      setMaquinaUsuarioMap(map);
    }
  }, [maquinas]);

  const filteredFinanzas = finanzas.filter((finanza) => {
    const matchesSearch =
      finanza.referencia_externa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finanza.notas?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finanza.monto.toString().includes(searchTerm);
    const matchesTipo = filterTipo === "" || finanza.tipo_movimiento === filterTipo;
    const matchesMoneda = filterMoneda === "" || finanza.moneda === filterMoneda;

    return matchesSearch && matchesTipo && matchesMoneda;
  });

  const handleMaquinaChange = (e) => {
    const maquinaId = Number(e.target.value);
    setFormData({
      ...formData,
      maquina_id: maquinaId,
      usuario_id: maquinaUsuarioMap[maquinaId] || 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (isNaN(Number(formData.monto))) {
      alert("El monto debe ser un número válido");
      setIsLoading(false);
      return;
    }

    try {
      const url = 'http://localhost:4000/api/finanzas';
      const method = editingFinanza ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...(editingFinanza ? { id: editingFinanza.id } : {}),
          tipo_movimiento: formData.tipo_movimiento,
          monto: Number(formData.monto),
          moneda: formData.moneda,
          fecha_movimiento: formData.fecha_movimiento,
          maquina_id: formData.maquina_id || null,
          usuario_id: formData.usuario_id || null,
          transaccion_id: formData.transaccion_id || null,
          orden_trabajo_id: formData.orden_trabajo_id || null,
          referencia_externa: formData.referencia_externa,
          notas: formData.notas
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setIsLogging(true);
      setRecharge(prev => !prev);
    } catch (error) {
      console.error('Error al guardar el movimiento:', error);
      alert(`Error al guardar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
      setIsLogging(false);
      setShowModal(false);
      resetForm();
    }
  };

  const handleEdit = (finanza) => {
    setEditingFinanza(finanza);
    setFormData({
      tipo_movimiento: finanza.tipo_movimiento,
      monto: finanza.monto,
      moneda: finanza.moneda,
      fecha_movimiento: finanza.fecha_movimiento,
      maquina_id: finanza.maquina?.id || 0,
      usuario_id: finanza.usuario?.id || 0,
      transaccion_id: finanza.transaccion?.id || 0,
      orden_trabajo_id: finanza.orden_trabajo?.id || 0,
      referencia_externa: finanza.referencia_externa || "",
      notas: finanza.notas || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de que quieres eliminar este movimiento financiero?")) {
      try {
        const response = await fetch(`http://localhost:4000/api/finanzas?id=${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          setFinanzas(finanzas.filter((finanza) => finanza.id !== id));
        } else {
          throw new Error(await response.text());
        }
      } catch (error) {
        console.error('Error al eliminar el movimiento:', error);
        alert(`Error al eliminar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tipo_movimiento: "Ingreso",
      monto: 0,
      moneda: "Lps",
      fecha_movimiento: "",
      maquina_id: 0,
      usuario_id: 0,
      transaccion_id: 0,
      orden_trabajo_id: 0,
      referencia_externa: "",
      notas: "",
    });
    setEditingFinanza(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const getTipoMovimientoColor = (tipo) => {
    switch (tipo) {
      case "Ingreso":
        return "success";
      case "Egreso":
        return "danger";
      case "Transferencia":
        return "info";
      case "Ajuste":
        return "warning";
      default:
        return "secondary";
    }
  };

  function formatDateToYMD(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  function formatDateToLocale(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  }

  function formatCurrency(amount, currency) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  const fetchData = async () => {
    try {
      const [finanzasRes, maquinasRes, usuariosRes, transaccionesRes, ordenesRes] = await Promise.all([
        fetch('http://localhost:4000/api/finanzas', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('http://localhost:4000/api/inventario/maquinas', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('http://localhost:4000/api/usuarios', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('http://localhost:4000/api/transacciones', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('http://localhost:4000/api/ordenes-trabajo', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
      ]);

      const [finanzasData, maquinasData, usuariosData, transaccionesData, ordenesData] = await Promise.all([
        finanzasRes.json(),
        maquinasRes.json(),
        usuariosRes.json(),
        transaccionesRes.json(),
        ordenesRes.json()
      ]);

      // Enriquecer máquinas con datos de usuario (frontend-only)
      const maquinasConUsuario = maquinasData.map(maquina => {
        const usuario = usuariosData.find(u => u.id === maquina.usuario_id);
        return {
          ...maquina,
          usuario: usuario ? { id: usuario.id, nombre: usuario.nombre } : null
        };
      });

      setFinanzas(finanzasData);
      setMaquinas(maquinasConUsuario);
      setUsuarios(usuariosData);
      setTransacciones(transaccionesData);
      setOrdenesTrabajo(ordenesData);
    } catch (error) {
      console.error('Error al obtener datos:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [recharge, token]);

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
                  <h4 className="mb-0">Gestión Financiera</h4>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setShowModal(true)}
                    disabled={!token}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Nuevo Movimiento
                  </button>
                </div>
              </div>

              <div className="card-body">
                <div className="row mb-4">
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar por referencia, notas o monto..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={filterTipo}
                      onChange={(e) => setFilterTipo(e.target.value)}
                    >
                      <option value="">Todos los tipos</option>
                      {tiposMovimiento.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={filterMoneda}
                      onChange={(e) => setFilterMoneda(e.target.value)}
                    >
                      <option value="">Todas las monedas</option>
                      {monedas.map((moneda) => (
                        <option key={moneda.value} value={moneda.value}>
                          {moneda.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <button
                      className="btn btn-outline-secondary w-100"
                      onClick={() => {
                        setSearchTerm("");
                        setFilterTipo("");
                        setFilterMoneda("");
                      }}
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th>Monto</th>
                        <th>Moneda</th>
                        <th>Máquina</th>
                        <th>Responsable</th>
                        <th>Transacción</th>
                        <th>Orden Trabajo</th>
                        <th>Referencia</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFinanzas.map((finanza) => (
                        <tr key={finanza.id}>
                          <td>{formatDateToLocale(finanza.fecha_movimiento)}</td>
                          <td>
                            <span className={`badge bg-${getTipoMovimientoColor(finanza.tipo_movimiento)}`}>
                              {finanza.tipo_movimiento}
                            </span>
                          </td>
                          <td className={finanza.tipo_movimiento === "Ingreso" ? "text-success" : "text-danger"}>
                            {formatCurrency(finanza.monto, finanza.moneda)}
                          </td>
                          <td>{finanza.moneda}</td>
                          <td>
                            <small>{finanza.maquina?.nombre || "N/A"}</small>
                          </td>
                          <td>
                            <small>{finanza.usuario?.nombre || "N/A"}</small>
                          </td>
                          <td>
                            <small>{finanza.transaccion?.id ? `#${finanza.transaccion.id}` : "N/A"}</small>
                          </td>
                          <td>
                            <small>{finanza.orden_trabajo?.id ? `#${finanza.orden_trabajo.id}` : "N/A"}</small>
                          </td>
                          <td>
                            <small>{finanza.referencia_externa || "N/A"}</small>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-outline-info"
                                title="Ver detalles"
                                onClick={() => alert(`Notas: ${finanza.notas || "Sin notas"}`)}
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEdit(finanza)}
                                disabled={!token}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(finanza.id)}
                                disabled={!token}
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

                {filteredFinanzas.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted">No se encontraron movimientos financieros</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingFinanza ? "Editar Movimiento" : "Nuevo Movimiento"}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Tipo de Movimiento *</label>
                      <select
                        className="form-select"
                        value={formData.tipo_movimiento}
                        onChange={(e) => setFormData({ ...formData, tipo_movimiento: e.target.value })}
                        required
                      >
                        {tiposMovimiento.map((tipo) => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Monto *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.monto}
                        onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Moneda *</label>
                      <select
                        className="form-select"
                        value={formData.moneda}
                        onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
                        required
                      >
                        {monedas.map((moneda) => (
                          <option key={moneda.value} value={moneda.value}>
                            {moneda.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Fecha del Movimiento *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.fecha_movimiento ? formatDateToYMD(formData.fecha_movimiento) : formData.fecha_movimiento}
                        onChange={(e) => setFormData({ ...formData, fecha_movimiento: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Referencia Externa</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.referencia_externa}
                        onChange={(e) => setFormData({ ...formData, referencia_externa: e.target.value })}
                        placeholder="Número de factura, recibo, etc."
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Máquina Relacionada *</label>
                      <select
                        className="form-select"
                        value={formData.maquina_id}
                        onChange={handleMaquinaChange}
                        required
                      >
                        <option value={0}>Seleccione una máquina</option>
                        {maquinas.map((maquina) => (
                          <option key={maquina.id} value={maquina.id}>
                            {maquina.nombre} - {maquina.numero_serie}
                            {maquina.usuario ? ` (${maquina.usuario.nombre})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Responsable</label>
                      <input
                        type="text"
                        className="form-control"
                        value={
                          formData.maquina_id 
                            ? maquinas.find(m => m.id === formData.maquina_id)?.usuario?.nombre || 'No asignado'
                            : 'Seleccione una máquina primero'
                        }
                        readOnly
                      />
                      <input 
                        type="hidden" 
                        name="usuario_id" 
                        value={formData.usuario_id} 
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Transacción Relacionada</label>
                      <select
                        className="form-select"
                        value={formData.transaccion_id}
                        onChange={(e) => setFormData({ ...formData, transaccion_id: Number(e.target.value) })}
                      >
                        <option value={0}>No relacionada a transacción</option>
                        {transacciones.map((transaccion) => (
                          <option key={transaccion.id} value={transaccion.id}>
                            Transacción #{transaccion.id}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Orden de Trabajo</label>
                      <select
                        className="form-select"
                        value={formData.orden_trabajo_id}
                        onChange={(e) => setFormData({ ...formData, orden_trabajo_id: Number(e.target.value) })}
                      >
                        <option value={0}>No relacionada a orden</option>
                        {ordenesTrabajo.map((orden) => (
                          <option key={orden.id} value={orden.id}>
                            Orden #{orden.id}
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
                      placeholder="Detalles adicionales sobre el movimiento financiero"
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? (
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      editingFinanza ? "Actualizar Movimiento" : "Crear Movimiento"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}