import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';

export default function App() {
  const [form, setForm] = useState({
    nombre: '', marca: '', origen: '', tiempo: '',
    aroma: '', sabor: '', fortaleza: '', tiro: '',
    notas: '', puntuacionAroma: '', puntuacionSabor: '', puntuacionTiro: ''
  });
  const [imagen, setImagen] = useState('');
  const [historial, setHistorial] = useState([]);
  const [mostrarFicha, setMostrarFicha] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [soloFavoritos, setSoloFavoritos] = useState(false);
  const fichaRef = useRef();

  useEffect(() => {
    const guardado = localStorage.getItem('historialCatas');
    if (guardado) {
      setHistorial(JSON.parse(guardado));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('historialCatas', JSON.stringify(historial));
  }, [historial]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const keyword = encodeURIComponent(form.nombre || 'cigar');
    const imagenFinal = imagen || `https://source.unsplash.com/600x400/?${keyword}`;
    setImagen(imagenFinal);

    const a = parseFloat(form.puntuacionAroma || 0);
    const s = parseFloat(form.puntuacionSabor || 0);
    const t = parseFloat(form.puntuacionTiro || 0);
    const promedio = ((a + s + t) / 3).toFixed(1);

    const nueva = {
      ...form,
      imagen: imagenFinal,
      fecha: new Date().toISOString(),
      calificacion: promedio,
      favorita: false
    };

    setTimeout(() => {
      setHistorial([...historial, nueva]);
      setMostrarFicha(true);
    }, 100);
  };

  const descargarFicha = async () => {
    const canvas = await html2canvas(fichaRef.current);
    const link = document.createElement('a');
    link.download = `${form.nombre}_cata.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const exportarCSV = () => {
    const header = ['Nombre','Marca','Origen','Tiempo','Aroma','Sabor','Fortaleza','Tiro','Punt. Aroma','Punt. Sabor','Punt. Tiro','Calificación','Notas','Imagen','Fecha'];
    const rows = historial.map(i => [
      i.nombre, i.marca, i.origen, i.tiempo, i.aroma, i.sabor, i.fortaleza, i.tiro,
      i.puntuacionAroma, i.puntuacionSabor, i.puntuacionTiro,
      i.calificacion, i.notas, i.imagen, i.fecha
    ]);
    const csv = [header, ...rows].map(row =>
      row.map(f => `"${(f || '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'historial_catas.csv';
    a.click();
  };

  const containerStyle = {
    maxWidth: 700,
    margin: '2rem auto',
    padding: '1.5rem',
    borderRadius: '12px',
    fontFamily: 'Segoe UI, Roboto, sans-serif',
    background: '#1e1e1e',
    color: '#f5f5f5',
    boxShadow: '0 0 20px rgba(0,0,0,0.4)'
  };

  const inputStyle = {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #555',
    background: '#2c2c2c',
    color: '#fff'
  };

  const buttonStyle = {
    padding: '12px',
    borderRadius: '6px',
    background: '#4caf50',
    color: '#fff',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px'
  };

  return (
    <div style={containerStyle}>
      {!mostrarFicha ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ textAlign: 'center' }}>🌿 Cata de Puros</h2>
          {['nombre','marca','origen','tiempo','aroma','sabor','fortaleza','tiro'].map(name => (
            <input key={name} name={name} placeholder={name} onChange={handleChange} required style={inputStyle} />
          ))}
          <textarea name="notas" placeholder="Notas personales" onChange={handleChange} style={inputStyle} />
          <label>📷 Sube una imagen (opcional):</label>
          <input type="file" accept="image/*" onChange={e => {
            const file = e.target.files[0];
            if (file) setImagen(URL.createObjectURL(file));
          }} style={inputStyle} />
          <label>Puntuación Aroma (1-10)</label>
          <input type="number" name="puntuacionAroma" min="0" max="10" onChange={handleChange} required style={inputStyle} />
          <label>Puntuación Sabor (1-10)</label>
          <input type="number" name="puntuacionSabor" min="0" max="10" onChange={handleChange} required style={inputStyle} />
          <label>Puntuación Tiro (1-10)</label>
          <input type="number" name="puntuacionTiro" min="0" max="10" onChange={handleChange} required style={inputStyle} />
          <button type="submit" style={buttonStyle}>💾 Guardar cata</button>
        </form>
      ) : (
        <div>
          <div ref={fichaRef} style={{ padding: 20, background: '#292929', borderRadius: 12, marginBottom: 16 }}>
            <h2 style={{ textAlign: 'center', marginBottom: 10 }}>{form.nombre}</h2>
            <img src={imagen} crossOrigin="anonymous" alt="Puro" onError={e => e.target.src = 'https://via.placeholder.com/600x400?text=Sin+imagen'}
              style={{ width: '100%', borderRadius: 8, marginBottom: 12, boxShadow: '0 0 10px rgba(0,0,0,0.6)' }} />
            <p><strong>Marca:</strong> {form.marca}</p>
            <p><strong>Origen:</strong> {form.origen}</p>
            <p><strong>Tiempo:</strong> {form.tiempo} minutos</p>
            <p><strong>Aroma:</strong> {form.aroma}</p>
            <p><strong>Sabor:</strong> {form.sabor}</p>
            <p><strong>Fortaleza:</strong> {form.fortaleza}</p>
            <p><strong>Tiro:</strong> {form.tiro}</p>
            <p><strong>Notas:</strong> {form.notas}</p>
            <p><strong>Punt. Aroma:</strong> {form.puntuacionAroma}/10</p>
            <p><strong>Punt. Sabor:</strong> {form.puntuacionSabor}/10</p>
            <p><strong>Punt. Tiro:</strong> {form.puntuacionTiro}/10</p>
            <p style={{ fontSize: '1.5rem', marginTop: '1rem' }}>
              ⭐ <strong>Calificación:</strong> {((+form.puntuacionAroma + +form.puntuacionSabor + +form.puntuacionTiro) / 3).toFixed(1)}/10
            </p>
          </div>
          <button onClick={descargarFicha} style={{ ...buttonStyle, background: '#2196f3' }}>📸 Descargar Ficha</button>
          <button onClick={() => setMostrarFicha(false)} style={{ ...buttonStyle, background: '#9c27b0' }}>➕ Nueva Cata</button>
        </div>
      )}

      {historial.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h3 style={{ textAlign: 'center' }}>📚 Historial</h3>

          <button
            onClick={() => setSoloFavoritos(!soloFavoritos)}
            style={{
              ...buttonStyle,
              background: soloFavoritos ? '#757575' : '#ffd700',
              marginBottom: 12
            }}
          >
            {soloFavoritos ? '👁 Ver todos' : '🌟 Ver solo favoritos'}
          </button>

          <input
            type="text"
            placeholder="🔍 Buscar por nombre o marca"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value.toLowerCase())}
            style={{
              width: '100%',
              marginBottom: 16,
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #555',
              background: '#2c2c2c',
              color: '#fff'
            }}
          />

          {[...historial]
            .filter(item => {
              const coincide = item.nombre.toLowerCase().includes(busqueda) || item.marca.toLowerCase().includes(busqueda);
              const favorito = soloFavoritos ? item.favorita : true;
              return coincide && favorito;
            })
            .sort((a, b) => b.favorita - a.favorita)
            .map((item, i) => (
              <div key={i} style={{
                background: '#2a2a2a',
                padding: 10,
                borderRadius: 8,
                marginTop: 12,
                position: 'relative',
                border: item.favorita ? '2px solid gold' : '1px solid #444'
              }}>
                <button
                  onClick={() => {
                    const actualizado = [...historial];
                    const index = historial.indexOf(item);
                    actualizado[index].favorita = !actualizado[index].favorita;
                    setHistorial(actualizado);
                  }}
                  style={{
                    position: 'absolute',
                    top: 6,
                    left: 6,
                    background: item.favorita ? '#ffd700' : '#555',
                    border: 'none',
                    borderRadius: 4,
                    color: '#000',
                    padding: '4px 8px',
                    cursor: 'pointer'
                  }}
                >⭐</button>

                <button
                  onClick={() => {
                    const confirmado = confirm(`¿Eliminar la cata de "${item.nombre}"?`);
                    if (confirmado) {
                      const nuevoHistorial = historial.filter(h => h !== item);
                      setHistorial(nuevoHistorial);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    background: '#e53935',
                    border: 'none',
                    borderRadius: 4,
                    color: '#fff',
                    padding: '4px 8px',
                    cursor: 'pointer'
                  }}
                >🗑</button>

                <p><strong>{item.nombre}</strong> — {item.calificacion}/10</p>
                <img src={item.imagen} alt="" style={{ width: '100%', borderRadius: 6 }} />
                <small>{new Date(item.fecha).toLocaleString()}</small>
              </div>
            ))}

          <button onClick={exportarCSV} style={{ ...buttonStyle, background: '#ff9800' }}>⬇ Exportar CSV</button>
        </div>
      )}
    </div>
  );
}
...
