# 📝 EJEMPLOS DE CÓDIGO CORREGIDO

## 🔧 **1. FUNCIÓN PARA CARGAR TÉCNICOS (Líneas 188-204)**

```javascript
// Función para cargar técnicos
const cargarTecnicos = async () => {
  try {
    const response = await fetch(`http://localhost:4000/api/tecnicos?activo=true`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      setTecnicos(data);
    }
  } catch (error) {
    console.error('Error al cargar técnicos:', error);
  }
};
```

---

## 🔧 **2. FUNCIÓN PARA ASIGNAR TÉCNICO (Líneas 230-262)**

```javascript
// Función para asignar técnico
const asignarTecnico = async () => {
  if (!reporteSeleccionado || !tecnicoSeleccionado) {
    toast.error('Debe seleccionar un técnico');
    return;
  }

  try {
    const response = await fetch(`http://localhost:4000/api/ordenes-trabajo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reporteId: reporteSeleccionado.id,
        tecnicoId: Number(tecnicoSeleccionado), // ← IMPORTANTE: Convertir a Number
        tiempoEstimado
      })
    });

    if (!response.ok) {
      throw new Error('Error al crear la orden de trabajo');
    }

    // Recargar reportes
    await cargarDatos();
    setShowAsignarModal(false);
    toast.success('Técnico asignado y orden de trabajo creada correctamente');
  } catch (error) {
    console.error('Error al asignar técnico:', error);
    toast.error('Error al asignar el técnico: ' + error.message);
  }
};
```

---

## 🔧 **3. FUNCIÓN PARA ELIMINAR REPORTE (Líneas 160-185)**

```javascript
// Función para eliminar reporte
const eliminarReporte = async (reporteId) => {
  if (!confirm('¿Está seguro de que desea eliminar este reporte? Esta acción no se puede deshacer.')) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:4000/api/reportes-cliente`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({ id: reporteId })
    });

    if (!response.ok) {
      throw new Error('Error al eliminar reporte');
    }

    await cargarDatos();
    toast.success('Reporte eliminado correctamente');
  } catch (error) {
    console.error('Error al eliminar reporte:', error);
    toast.error('Error al eliminar el reporte: ' + error.message);
  }
};
```

---

## 🔧 **4. SELECT DE TÉCNICOS CORREGIDO (Líneas 582-594)**

```javascript
<select 
  className="form-select"
  value={tecnicoSeleccionado || ''}
  onChange={(e) => setTecnicoSeleccionado(Number(e.target.value))} // ← IMPORTANTE: Number()
>
  <option value="">Seleccione un técnico...</option>
  {tecnicos.map(tecnico => (
    <option key={tecnico.id} value={tecnico.id}>
      {tecnico.nombre} - {tecnico.email} {/* ← CAMBIO: email en lugar de especialidad */}
    </option>
  ))}
</select>
```

---

## 🔧 **5. INFORMACIÓN DEL TÉCNICO SELECCIONADO (Líneas 608-620)**

```javascript
{tecnicoSeleccionado && (
  <div className="mt-3 p-3 bg-light rounded">
    <h6>Técnico Seleccionado:</h6>
    {tecnicos.find(t => t.id == tecnicoSeleccionado) && (
      <div>
        <p><strong>Nombre:</strong> {tecnicos.find(t => t.id == tecnicoSeleccionado).nombre}</p>
        <p><strong>Email:</strong> {tecnicos.find(t => t.id == tecnicoSeleccionado).email}</p>
        <p><strong>Teléfono:</strong> {tecnicos.find(t => t.id == tecnicoSeleccionado).telefono || 'N/A'}</p>
        {/* ← CAMBIO: Removido especialidad, agregado teléfono */}
      </div>
    )}
  </div>
)}
```

---

## 🔧 **6. FUNCIÓN PARA CAMBIAR ESTADO DE MÁQUINA (Línea 136)**

```javascript
const response = await fetch(`http://localhost:4000/api/maquinas`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.accessToken}`
  },
  body: JSON.stringify(updateData)
});
```

---

## 🎯 **PUNTOS CLAVE A RECORDAR:**

1. **URLs**: Todas deben apuntar a `http://localhost:4000`
2. **Técnicos**: No tienen campo `especialidad`, usar `email` y `telefono`
3. **Conversión**: `tecnicoSeleccionado` debe ser `Number()`
4. **Backend**: Ya está configurado y funcionando correctamente
5. **CORS**: Ya está habilitado en el backend

---

## 🚀 **FLUJO COMPLETO ESPERADO:**

1. **Admin ve reportes** → Lista todos los reportes de cliente
2. **Filtra por estado** → pendiente, procesado, resuelto
3. **Ve detalles** → Modal con información completa
4. **Asigna técnico** → Crea orden de trabajo automáticamente
5. **Cambia estados** → pendiente → procesado → resuelto
6. **Elimina reportes** → Confirmación y eliminación

¡Con estos cambios el frontend debería funcionar perfectamente con el backend!