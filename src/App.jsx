import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from './assets/logo.png';

function App() {
  const [capitalBase, setCapitalBase] = useState(
    localStorage.getItem('capitalBase') || ''
  );
  const [valorOperacion, setValorOperacion] = useState('');
  const [porcentaje, setPorcentaje] = useState('');
  const [operaciones, setOperaciones] = useState(
    JSON.parse(localStorage.getItem('operaciones')) || []
  );

  const capitalNum = parseFloat(capitalBase);
  const balanceFinal = operaciones.length > 0
    ? operaciones[operaciones.length - 1].balance
    : capitalNum;

  const metas = {
    meta10: capitalNum * 1.10,
    meta20: capitalNum * 1.20,
    perdidaMax: capitalNum * 0.95,
  };

  const riesgo = ((balanceFinal - capitalNum) / capitalNum) * 100;

  useEffect(() => {
    localStorage.setItem('capitalBase', capitalBase);
    localStorage.setItem('operaciones', JSON.stringify(operaciones));
  }, [capitalBase, operaciones]);

  const registrarOperacion = () => {
    if (!capitalBase || !valorOperacion || !porcentaje) return;

    const capitalInicial = operaciones.length
      ? operaciones[operaciones.length - 1].balance
      : capitalNum;

    const resultado = (parseFloat(valorOperacion) * parseFloat(porcentaje)) / 100;
    const balance = capitalInicial + resultado;
    const riesgoActual = ((balance - capitalNum) / capitalNum) * 100;

    const nuevaOperacion = {
      fecha: new Date().toLocaleDateString(),
      capitalInicial: capitalInicial.toFixed(2),
      valor: parseFloat(valorOperacion).toFixed(2),
      porcentaje,
      resultado: resultado.toFixed(2),
      balance: balance.toFixed(2),
      riesgo: riesgoActual.toFixed(2),
    };

    setOperaciones([...operaciones, nuevaOperacion]);
    setValorOperacion('');
    setPorcentaje('');
  };

  const borrarOperacion = (index) => {
    const nuevas = [...operaciones];
    nuevas.splice(index, 1);
    setOperaciones(nuevas);
  };

  const borrarCapitalBase = () => {
    setCapitalBase('');
    localStorage.removeItem('capitalBase');
    setOperaciones([]);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text('Historial de Operaciones', 14, 15);
    autoTable(doc, {
      head: [['Día', 'Capital', 'Valor', '% Operación', 'Resultado', 'Balance', 'Riesgo (%)']],
      body: operaciones.map(op => [
        op.fecha,
        `$${op.capitalInicial}`,
        `$${op.valor}`,
        `${op.porcentaje}%`,
        `$${op.resultado}`,
        `$${op.balance}`,
        `${op.riesgo}%`,
      ]),
    });
    doc.save('historial-operaciones.pdf');
  };

  const ganadas = operaciones.filter(op => parseFloat(op.resultado) > 0).length;
  const perdidas = operaciones.length - ganadas;

  return (
    <div style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh', padding: '20px', fontSize: '18px', position: 'relative' }}>
      <img
        src={logo}
        alt="Logo"
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '60px',
          height: 'auto',
          zIndex: 10
        }}
      />
      <h1 style={{ textAlign: 'center' }}>Gestión de Capital</h1>

      {capitalBase && (
        <div style={{ background: '#007bff', padding: '10px', margin: '10px 0', fontWeight: 'bold', fontSize: '20px' }}>
          Capital base: ${capitalBase}{' '}
          <button onClick={borrarCapitalBase} style={{ marginLeft: '10px', backgroundColor: 'transparent', color: 'white' }}>❌ Borrar capital base</button>
        </div>
      )}

      {!capitalBase && (
        <div>
          <label>Capital base:{' '}
            <input type="number" value={capitalBase} onChange={e => setCapitalBase(e.target.value)} />
          </label>
        </div>
      )}

      {capitalBase && (
        <div style={{ marginBottom: '20px' }}>
          <div>
            <label>Valor operación:{' '}
              <input type="number" value={valorOperacion} onChange={e => setValorOperacion(e.target.value)} />
            </label>
          </div>
          <div>
            <label>% Operación:{' '}
              <input type="number" value={porcentaje} onChange={e => setPorcentaje(e.target.value)} min="-100" max="100" />
            </label>
          </div>
          <button onClick={registrarOperacion} style={{ marginTop: '10px' }}>Registrar operación</button>
        </div>
      )}

      {capitalBase && (
        <>
          <table border="1" cellPadding="10" style={{ width: '100%', marginBottom: '20px' }}>
            <thead><tr><th colSpan="2">Resumen de metas</th></tr></thead>
            <tbody>
              <tr><td>Meta 10%</td><td>${metas.meta10.toFixed(2)}</td></tr>
              <tr><td>Meta 20%</td><td>${metas.meta20.toFixed(2)}</td></tr>
              <tr><td>Pérdida máxima 5%</td><td>${metas.perdidaMax.toFixed(2)}</td></tr>
            </tbody>
          </table>

          <table border="1" cellPadding="10" style={{ width: '100%', marginBottom: '20px' }}>
            <thead><tr><th colSpan="2">Resumen de desempeño</th></tr></thead>
            <tbody>
              <tr><td>Operaciones ganadas</td><td>{ganadas}</td></tr>
              <tr><td>Operaciones perdidas</td><td>{perdidas}</td></tr>
              <tr><td>Total de operaciones</td><td>{operaciones.length}</td></tr>
              <tr><td>Balance total</td><td>${(balanceFinal - capitalNum).toFixed(2)}</td></tr>
            </tbody>
          </table>

          <h3>Historial de operaciones</h3>
          <table border="1" cellPadding="10" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Día</th>
                <th>Capital</th>
                <th>Valor</th>
                <th>% Operación</th>
                <th>Resultado</th>
                <th>Balance</th>
                <th>Riesgo (%)</th>
                <th>❌</th>
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

          <div style={{ textAlign: 'right', marginTop: '10px' }}>
            <button onClick={exportarPDF}>📤 Exportar a PDF</button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
