import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from './assets/logo.png';

function App() {
  const [capitalBase, setCapitalBase] = useState(() => {
    const saved = localStorage.getItem('capitalBase');
    return saved ? parseFloat(saved) : '';
  });
  const [valorOperacion, setValorOperacion] = useState('');
  const [porcentaje, setPorcentaje] = useState('');
  const [operaciones, setOperaciones] = useState([]);

  useEffect(() => {
    if (capitalBase !== '') {
      localStorage.setItem('capitalBase', capitalBase);
    }
  }, [capitalBase]);

  const borrarCapitalBase = () => {
    localStorage.removeItem('capitalBase');
    setCapitalBase('');
    setOperaciones([]);
  };

  const registrarOperacion = () => {
    if (!capitalBase || !valorOperacion || !porcentaje) return;
    const operado = parseFloat(valorOperacion);
    const pct = parseFloat(porcentaje);
    const ultimaOperacion = operaciones[operaciones.length - 1];
    const capitalInicial = operaciones.length ? ultimaOperacion.balance : capitalBase;
    const resultado = parseFloat(((pct / 100) * operado).toFixed(2));
    const balance = parseFloat((capitalInicial + resultado).toFixed(2));
    const riesgo = parseFloat((((balance - capitalBase) / capitalBase) * 100).toFixed(2));

    const nuevaOperacion = {
      fecha: new Date().toLocaleDateString(),
      capitalInicial: capitalInicial.toFixed(2),
      valor: operado.toFixed(2),
      porcentaje: pct.toFixed(2),
      resultado: resultado.toFixed(2),
      balance: balance.toFixed(2),
      riesgo: riesgo.toFixed(2)
    };

    setOperaciones([...operaciones, nuevaOperacion]);
    setValorOperacion('');
    setPorcentaje('');
  };

  const eliminarOperacion = (index) => {
    const nuevas = operaciones.filter((_, i) => i !== index);
    setOperaciones(nuevas);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text('Historial de Operaciones', 14, 10);
    doc.autoTable({
      startY: 15,
      head: [['Fecha', 'Capital Inicial', 'Valor', '% Operación', 'Resultado', 'Balance', 'Riesgo (%)']],
      body: operaciones.map(op => [op.fecha, `$${op.capitalInicial}`, `$${op.valor}`, `${op.porcentaje}%`, `$${op.resultado}`, `$${op.balance}`, `${op.riesgo}%`])
    });
    doc.save('historial.pdf');
  };

  const ganadas = operaciones.filter(op => parseFloat(op.resultado) > 0).length;
  const perdidas = operaciones.filter(op => parseFloat(op.resultado) < 0).length;
  const balanceTotal = operaciones.length ? operaciones[operaciones.length - 1].balance : 0;

  return (
    <div style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'Arial' }}>
      <img
        src={logo}
        alt="Logo"
        style={{ position: 'absolute', top: '10px', right: '10px', width: '60px', height: 'auto', zIndex: 10 }}
      />
      <h1 style={{ textAlign: 'center' }}>Gestión de Capital</h1>

      {capitalBase !== '' ? (
        <div style={{ background: '#007bff', padding: '10px', color: 'white', fontWeight: 'bold' }}>
          Capital base: ${parseFloat(capitalBase).toFixed(2)}
          <button onClick={borrarCapitalBase} style={{ marginLeft: '20px', background: 'transparent', color: 'white' }}>❌ Borrar capital base</button>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <label>Capital base:&nbsp;
            <input
              type="number"
              value={capitalBase}
              onChange={e => setCapitalBase(parseFloat(e.target.value))}
            />
          </label>
        </div>
      )}

      {capitalBase !== '' && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <div>
            Valor operación:&nbsp;
            <input type="number" value={valorOperacion} onChange={e => setValorOperacion(e.target.value)} placeholder="Ej. 25" />
          </div>
          <div>
            % Operación:&nbsp;
            <input type="number" value={porcentaje} onChange={e => setPorcentaje(e.target.value)} placeholder="Ej. 84 o -100" />
          </div>
          <button onClick={registrarOperacion} style={{ marginTop: '10px' }}>Registrar operación</button>
        </div>
      )}

      {capitalBase !== '' && (
        <>
          <table style={{ width: '100%', marginTop: '30px', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead><tr><th colSpan="2" style={{ textAlign: 'left', background: '#111' }}>Resumen de metas</th></tr></thead>
            <tbody>
              <tr><td>Meta 10%:</td><td>${(capitalBase * 1.10).toFixed(2)}</td></tr>
              <tr><td>Meta 20%:</td><td>${(capitalBase * 1.20).toFixed(2)}</td></tr>
              <tr><td>Pérdida máxima 5%:</td><td>${(capitalBase * 0.95).toFixed(2)}</td></tr>
            </tbody>
          </table>

          <table style={{ width: '100%', marginTop: '30px', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead><tr><th colSpan="2" style={{ textAlign: 'left', background: '#111' }}>Resumen de desempeño</th></tr></thead>
            <tbody>
              <tr><td>Operaciones ganadas</td><td style={{ backgroundColor: '#2e593f' }}>{ganadas}</td></tr>
              <tr><td>Operaciones perdidas</td><td style={{ backgroundColor: '#5a2e2e' }}>{perdidas}</td></tr>
              <tr><td>Total de operaciones</td><td>{operaciones.length}</td></tr>
              <tr><td>Balance total</td><td>${balanceTotal}</td></tr>
            </tbody>
          </table>

          <h3>Historial de operaciones</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr><th>Día</th><th>Capital</th><th>Valor</th><th>% Operación</th><th>Resultado</th><th>Balance</th><th>Riesgo (%)</th><th>Eliminar</th></tr>
            </thead>
            <tbody>
              {operaciones.map((op, index) => (
                <tr key={index}>
                  <td>{op.fecha}</td>
                  <td>${op.capitalInicial}</td>
                  <td>${op.valor}</td>
                  <td>{op.porcentaje}%</td>
                  <td>${op.resultado}</td>
                  <td>${op.balance}</td>
                  <td>{op.riesgo}%</td>
                  <td><button onClick={() => eliminarOperacion(index)}>❌</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '20px', float: 'right' }}>
            <button onClick={exportarPDF}>📤 Exportar a PDF</button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
