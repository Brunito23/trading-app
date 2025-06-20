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
    const stored = localStorage.getItem('operaciones');
    return stored ? JSON.parse(stored) : [];
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
      <img src={logo} alt="logo" style={{ position: 'absolute', top: 20, right: 20, width: '20%' }} />
      <h1 style={{ textAlign: 'center', fontSize: '2.5em' }}>Gestión de Capital</h1>

      <div style={{ width: '50%', marginBottom: '30px' }}>
        <label style={{ fontWeight: 'bold', fontSize: '1.3em' }}>Capital base:</label>
        <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
          <input
            type="number"
            placeholder="Ingrese capital"
            value={inputBase}
            onChange={(e) => setInputBase(e.target.value)}
            style={{ borderRadius: '10px', padding: '5px', flex: 1 }}
          />
          <button onClick={() => setCapitalBase(parseFloat(inputBase))}>✅ Establecer</button>
          <button style={{ background: 'red', color: 'white' }} onClick={borrarCapital}>❌ Borrar capital base</button>
        </div>

        <label style={{ fontWeight: 'bold', fontSize: '1.3em' }}>Valor operación:</label>
        <input
          type="number"
          value={valorOperacion}
          onChange={(e) => setValorOperacion(e.target.value)}
          style={{ borderRadius: '10px', padding: '5px', width: '100%', marginBottom: '10px' }}
        />

        <label style={{ fontWeight: 'bold', fontSize: '1.3em' }}>% Operación:</label>
        <input
          type="number"
          value={porcentajeOperacion}
          onChange={(e) => setPorcentajeOperacion(e.target.value)}
          style={{ borderRadius: '10px', padding: '5px', width: '100%', marginBottom: '10px' }}
        />

        <button style={{ width: '100%', borderRadius: '10px', padding: '10px' }} onClick={registrarOperacion}>Registrar operación</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '30px' }}>
        <table style={{ background: '#333', padding: '10px', width: '50%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th style={{ textAlign: 'left', padding: '5px' }}>Resumen de metas</th></tr>
          </thead>
          <tbody>
            <tr><td style={{ padding: '5px' }}>Meta 10%: ${capitalBase ? (capitalBase * 1.10).toFixed(2) : '---'}</td></tr>
            <tr><td style={{ padding: '5px' }}>Meta 20%: ${capitalBase ? (capitalBase * 1.20).toFixed(2) : '---'}</td></tr>
            <tr><td style={{ padding: '5px' }}>Pérdida máxima 5%: ${capitalBase ? (capitalBase * 0.95).toFixed(2) : '---'}</td></tr>
          </tbody>
        </table>

        <table style={{ background: '#333', padding: '10px', width: '50%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th style={{ textAlign: 'left', padding: '5px' }}>Resumen de desempeño</th></tr>
          </thead>
          <tbody>
            <tr><td style={{ padding: '5px', backgroundColor: 'green' }}>Operaciones ganadas: {resumen.ganadas}</td></tr>
            <tr><td style={{ padding: '5px', backgroundColor: 'darkred' }}>Operaciones perdidas: {resumen.perdidas}</td></tr>
            <tr><td style={{ padding: '5px' }}>Total: {resumen.total}</td></tr>
            <tr><td style={{ padding: '5px' }}>Balance final: ${resumen.balance}</td></tr>
          </tbody>
        </table>
      </div>

      <h2>Historial de operaciones</h2>
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
