// App.jsx
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from './assets/logo.png';

const App = () => {
  const [capitalBase, setCapitalBase] = useState(() => {
    const stored = localStorage.getItem('capitalBase');
    return stored ? parseFloat(stored) : '';
  });
  const [inputBase, setInputBase] = useState(capitalBase || '');
  const [valorOperacion, setValorOperacion] = useState('');
  const [porcentajeOperacion, setPorcentajeOperacion] = useState('');
  const [operaciones, setOperaciones] = useState(() => {
    const saved = localStorage.getItem('operaciones');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (capitalBase !== '') localStorage.setItem('capitalBase', capitalBase);
  }, [capitalBase]);

  useEffect(() => {
    localStorage.setItem('operaciones', JSON.stringify(operaciones));
  }, [operaciones]);

  const registrarOperacion = () => {
    if (valorOperacion === '' || porcentajeOperacion === '' || capitalBase === '') return;
    const capitalInicial = operaciones.length > 0 ? parseFloat(operaciones[operaciones.length - 1].balance) : parseFloat(capitalBase);
    const porcentaje = parseFloat(porcentajeOperacion) / 100;
    const resultado = parseFloat(valorOperacion) * porcentaje;
    const balance = capitalInicial + resultado;
    const riesgo = ((balance - capitalBase) / capitalBase) * 100;

    const nuevaOperacion = {
      fecha: new Date().toLocaleDateString(),
      capitalInicial: capitalInicial.toFixed(2),
      valor: parseFloat(valorOperacion).toFixed(2),
      porcentaje: (porcentaje * 100).toFixed(2),
      resultado: resultado.toFixed(2),
      balance: balance.toFixed(2),
      riesgo: riesgo.toFixed(2),
    };
    setOperaciones([...operaciones, nuevaOperacion]);
    setValorOperacion('');
    setPorcentajeOperacion('');
  };

  const borrarCapital = () => {
    setCapitalBase('');
    setInputBase('');
    localStorage.removeItem('capitalBase');
    setOperaciones([]);
  };

  const eliminarOperacion = (index) => {
    const nuevas = operaciones.filter((_, i) => i !== index);
    setOperaciones(recalcular(nuevas));
  };

  const recalcular = (ops) => {
    let recalculadas = [];
    let base = parseFloat(capitalBase);
    ops.forEach(op => {
      const porcentaje = parseFloat(op.porcentaje) / 100;
      const resultado = parseFloat(op.valor) * porcentaje;
      const balance = base + resultado;
      const riesgo = ((balance - capitalBase) / capitalBase) * 100;

      recalculadas.push({
        ...op,
        capitalInicial: base.toFixed(2),
        resultado: resultado.toFixed(2),
        balance: balance.toFixed(2),
        riesgo: riesgo.toFixed(2)
      });
      base = balance;
    });
    return recalculadas;
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Fecha', 'Capital', 'Valor', '% Operación', 'Resultado', 'Balance', 'Riesgo (%)']],
      body: operaciones.map(op => [
        op.fecha, `$${op.capitalInicial}`, `$${op.valor}`, `${op.porcentaje}%`, `$${op.resultado}`, `$${op.balance}`, `${op.riesgo}%`
      ])
    });
    doc.save('historial_operaciones.pdf');
  };

  const resumen = {
    ganadas: operaciones.filter(op => parseFloat(op.resultado) > 0).length,
    perdidas: operaciones.filter(op => parseFloat(op.resultado) <= 0).length,
    total: operaciones.length,
    balance: operaciones.length ? operaciones[operaciones.length - 1].balance : 0
  };

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: 'white', padding: '20px', fontFamily: 'Arial' }}>
      <img src={logo} alt="logo" style={{ position: 'absolute', top: 20, right: 20, width: '25%' }} />
      <h1 style={{ textAlign: 'center' }}>Gestión de Capital</h1>

      {/* BLOQUE DE ENTRADAS EXPANDIDO */}
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '50%', background: '#007bff', padding: '10px', borderRadius: '4px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          Capital base: ${capitalBase || '---'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <input
            type="number"
            placeholder="Ingrese capital"
            value={inputBase}
            onChange={(e) => setInputBase(e.target.value)}
            style={{ marginRight: 10, flex: 1 }}
          />
          <button onClick={() => setCapitalBase(parseFloat(inputBase))} style={{ marginRight: 10 }}>✅ Establecer</button>
          <button style={{ background: 'red' }} onClick={borrarCapital}>❌ Borrar capital base</button>
        </div>
        <label>Valor operación:
          <input type="number" value={valorOperacion} onChange={(e) => setValorOperacion(e.target.value)} style={{ width: '100%', marginBottom: 5 }} />
        </label>
        <label>% Operación:
          <input type="number" value={porcentajeOperacion} onChange={(e) => setPorcentajeOperacion(e.target.value)} style={{ width: '100%' }} />
        </label>
        <button onClick={registrarOperacion} style={{ marginTop: 10 }}>Registrar operación</button>
      </div>

      {/* TABLAS DE RESÚMENES */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
        <div style={{ background: '#333', padding: 15, width: '49%' }}>
          <h4>Resumen de metas</h4>
          <p>Meta 10%: ${capitalBase ? (capitalBase * 1.10).toFixed(2) : '---'}</p>
          <p>Meta 20%: ${capitalBase ? (capitalBase * 1.20).toFixed(2) : '---'}</p>
          <p>Pérdida máxima 5%: ${capitalBase ? (capitalBase * 0.95).toFixed(2) : '---'}</p>
        </div>
        <div style={{ background: '#333', padding: 15, width: '49%' }}>
          <h4>Resumen de desempeño</h4>
          <p style={{ backgroundColor: 'green' }}>Operaciones ganadas: {resumen.ganadas}</p>
          <p style={{ backgroundColor: 'darkred' }}>Operaciones perdidas: {resumen.perdidas}</p>
          <p>Total: {resumen.total}</p>
          <p>Balance final: ${resumen.balance}</p>
        </div>
      </div>

      {/* HISTORIAL DE OPERACIONES */}
      <h2 style={{ marginTop: '30px' }}>Historial de operaciones</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead style={{ background: '#444' }}>
          <tr>
            {['Fecha', 'Capital', 'Valor', '% Operación', 'Resultado', 'Balance', 'Riesgo (%)', 'Eliminar'].map(col => (
              <th key={col} style={{ border: '1px solid #888', textAlign: 'center' }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {operaciones.map((op, i) => (
            <tr key={i} style={{ background: parseFloat(op.resultado) >= 0 ? 'darkgreen' : 'brown', textAlign: 'center' }}>
              <td>{op.fecha}</td>
              <td>${op.capitalInicial}</td>
              <td>${op.valor}</td>
              <td>{op.porcentaje}%</td>
              <td>${op.resultado}</td>
              <td>${op.balance}</td>
              <td>{op.riesgo}%</td>
              <td><button onClick={() => eliminarOperacion(i)}>❌</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ textAlign: 'right' }}>
        <button onClick={exportarPDF}>📄 Exportar a PDF</button>
      </div>
    </div>
  );
};

export default App;
