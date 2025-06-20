// App.jsx
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from './assets/logo.png';

const App = () => {
  const [capitalBase, setCapitalBase] = useState(() => localStorage.getItem('capitalBase') || '');
  const [valorOperacion, setValorOperacion] = useState('');
  const [porcentaje, setPorcentaje] = useState('');
  const [operaciones, setOperaciones] = useState(() => JSON.parse(localStorage.getItem('operaciones')) || []);

  const resumen = operaciones.reduce(
    (acc, op) => {
      if (op.resultado >= 0) acc.ganadas++;
      else acc.perdidas++;
      acc.total++;
      acc.balance += op.resultado;
      return acc;
    },
    { ganadas: 0, perdidas: 0, total: 0, balance: 0 }
  );

  const calcularRiesgo = (balanceFinal) => {
    const base = parseFloat(capitalBase);
    return base ? (((balanceFinal - base) / base) * 100).toFixed(2) : '0.00';
  };

  const handleRegister = () => {
    const valor = parseFloat(valorOperacion);
    const pct = parseFloat(porcentaje);
    const capitalInicial = operaciones.length > 0 ? operaciones[operaciones.length - 1].balance : parseFloat(capitalBase);
    const resultado = pct < 0 ? -valor : valor * (pct / 100);
    const balance = capitalInicial + resultado;

    const nuevaOperacion = {
      fecha: new Date().toLocaleDateString(),
      capitalInicial: capitalInicial.toFixed(2),
      valor: valor.toFixed(2),
      porcentaje: pct.toFixed(2),
      resultado: resultado.toFixed(2),
      balance: balance.toFixed(2),
      riesgo: calcularRiesgo(balance)
    };

    const nuevasOperaciones = [...operaciones, nuevaOperacion];
    setOperaciones(nuevasOperaciones);
    localStorage.setItem('operaciones', JSON.stringify(nuevasOperaciones));
  };

  const borrarOperacion = (index) => {
    const nuevas = operaciones.filter((_, i) => i !== index);
    setOperaciones(nuevas);
    localStorage.setItem('operaciones', JSON.stringify(nuevas));
  };

  const borrarCapital = () => {
    setCapitalBase('');
    localStorage.removeItem('capitalBase');
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Fecha', 'Capital', 'Valor', '% Operación', 'Resultado', 'Balance', 'Riesgo (%)']],
      body: operaciones.map(op => [op.fecha, `$${op.capitalInicial}`, `$${op.valor}`, `${op.porcentaje}%`, `$${op.resultado}`, `$${op.balance}`, `${op.riesgo}%`])
    });
    doc.save('operaciones.pdf');
  };

  useEffect(() => {
    if (capitalBase) {
      localStorage.setItem('capitalBase', capitalBase);
    }
  }, [capitalBase]);

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ textAlign: 'center' }}>Gestión de Capital</h1>
        <img src={logo} alt="Logo" style={{ height: '50px' }} />
      </div>

      {capitalBase ? (
        <div style={{ background: '#007bff', padding: '0.5rem', fontWeight: 'bold' }}>
          Capital base: ${capitalBase}
          <button onClick={borrarCapital} style={{ marginLeft: '1rem', color: 'red' }}>
            ❌ Borrar capital base
          </button>
        </div>
      ) : (
        <input type="number" placeholder="Capital base" value={capitalBase} onChange={e => setCapitalBase(e.target.value)} />
      )}

      <div style={{ margin: '1rem 0' }}>
        <label>Valor operación: </label>
        <input type="number" value={valorOperacion} onChange={e => setValorOperacion(e.target.value)} />
        <br />
        <label>% Operación: </label>
        <input type="number" value={porcentaje} onChange={e => setPorcentaje(e.target.value)} />
        <br />
        <button onClick={handleRegister}>Registrar operación</button>
      </div>

      <table border="1" style={{ width: '100%', textAlign: 'left', marginBottom: '1rem' }}>
        <thead>
          <tr><th colSpan="2">Resumen de metas</th></tr>
        </thead>
        <tbody>
          <tr><td>Meta 10%</td><td>${(capitalBase * 1.10).toFixed(2)}</td></tr>
          <tr><td>Meta 20%</td><td>${(capitalBase * 1.20).toFixed(2)}</td></tr>
          <tr><td>Pérdida máxima 5%</td><td>${(capitalBase * 0.95).toFixed(2)}</td></tr>
        </tbody>
      </table>

      <table border="1" style={{ width: '100%', textAlign: 'left', marginBottom: '1rem' }}>
        <thead>
          <tr><th colSpan="2">Resumen de desempeño</th></tr>
        </thead>
        <tbody>
          <tr><td>Operaciones ganadas</td><td>{resumen.ganadas}</td></tr>
          <tr><td>Operaciones perdidas</td><td>{resumen.perdidas}</td></tr>
          <tr><td>Total de operaciones</td><td>{resumen.total}</td></tr>
          <tr><td>Balance total</td><td>${resumen.balance.toFixed(2)}</td></tr>
        </tbody>
      </table>

      <h3>Historial de operaciones</h3>
      <table border="1" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Fecha</th><th>Capital</th><th>Valor</th><th>% Operación</th><th>Resultado</th><th>Balance</th><th>Riesgo (%)</th><th>Borrar</th>
          </tr>
        </thead>
        <tbody>
          {operaciones.map((op, i) => (
            <tr key={i}>
              <td>{op.fecha}</td>
              <td>${op.capitalInicial}</td>
              <td>${op.valor}</td>
              <td>{op.porcentaje}%</td>
              <td>${op.resultado}</td>
              <td>${op.balance}</td>
              <td>{op.riesgo}%</td>
              <td><button onClick={() => borrarOperacion(i)}>❌</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ textAlign: 'right', marginTop: '1rem' }}>
        <button onClick={exportarPDF}>📤 Exportar a PDF</button>
      </div>
    </div>
  );
};

export default App;
