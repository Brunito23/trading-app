
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from './assets/logo.png';

function App() {
  const [capitalBase, setCapitalBase] = useState(() => {
    const stored = localStorage.getItem('capitalBase');
    return stored ? parseFloat(stored) : '';
  });
  const [valorOperacion, setValorOperacion] = useState('');
  const [porcentajeOperacion, setPorcentajeOperacion] = useState('');
  const [operaciones, setOperaciones] = useState(() => {
    const stored = localStorage.getItem('operaciones');
    return stored ? JSON.parse(stored) : [];
  });

  const [editable, setEditable] = useState(!capitalBase);

  useEffect(() => {
    localStorage.setItem('capitalBase', capitalBase);
  }, [capitalBase]);

  useEffect(() => {
    localStorage.setItem('operaciones', JSON.stringify(operaciones));
  }, [operaciones]);

  const registrarOperacion = () => {
    if (!valorOperacion || !porcentajeOperacion) return;
    const capInicial = operaciones.length
      ? operaciones[operaciones.length - 1].balance
      : parseFloat(capitalBase);
    const resultado = (parseFloat(valorOperacion) * parseFloat(porcentajeOperacion)) / 100;
    const nuevoBalance = capInicial + resultado;
    const riesgo = ((nuevoBalance - capitalBase) / capitalBase) * 100;

    const nuevaOperacion = {
      fecha: new Date().toLocaleDateString(),
      capital: capInicial.toFixed(2),
      valor: parseFloat(valorOperacion).toFixed(2),
      porcentaje: parseFloat(porcentajeOperacion).toFixed(2),
      resultado: resultado.toFixed(2),
      balance: nuevoBalance.toFixed(2),
      riesgo: riesgo.toFixed(2),
    };

    setOperaciones([...operaciones, nuevaOperacion]);
    setValorOperacion('');
    setPorcentajeOperacion('');
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text('Historial de Operaciones', 14, 10);
    doc.autoTable({
      head: [['Fecha', 'Capital', 'Valor', '% Operación', 'Resultado', 'Balance', 'Riesgo (%)']],
      body: operaciones.map(op => [
        op.fecha,
        `$${op.capital}`,
        `$${op.valor}`,
        `${op.porcentaje}%`,
        `$${op.resultado}`,
        `$${op.balance}`,
        `${op.riesgo}%`,
      ]),
    });
    doc.save('historial.pdf');
  };

  const borrarOperacion = (index) => {
    const nuevas = operaciones.filter((_, i) => i !== index);
    setOperaciones(nuevas);
  };

  const borrarCapitalBase = () => {
    localStorage.removeItem('capitalBase');
    setCapitalBase('');
    setEditable(true);
    setOperaciones([]);
  };

  const ganadas = operaciones.filter(op => parseFloat(op.resultado) > 0).length;
  const perdidas = operaciones.filter(op => parseFloat(op.resultado) < 0).length;
  const balanceTotal = operaciones.reduce((acc, op) => acc + parseFloat(op.resultado), 0);

  return (
    <div style={{ background: '#000', color: '#fff', fontFamily: 'Arial, sans-serif', padding: 20 }}>
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

      <div style={{ background: '#007bff', padding: '10px', color: '#fff', fontWeight: 'bold' }}>
        Capital base: ${capitalBase || '0.00'}
        <button onClick={borrarCapitalBase} style={{ marginLeft: 10 }}>❌ Borrar capital base</button>
      </div>

      {editable && (
        <input
          type="number"
          placeholder="Capital base"
          value={capitalBase}
          onChange={e => setCapitalBase(parseFloat(e.target.value))}
        />
      )}

      <div style={{ marginTop: 20 }}>
        <div>
          Valor operación:
          <input type="number" value={valorOperacion} onChange={e => setValorOperacion(e.target.value)} />
        </div>
        <div>
          % Operación:
          <input type="number" value={porcentajeOperacion} onChange={e => setPorcentajeOperacion(e.target.value)} />
        </div>
        <button onClick={registrarOperacion}>Registrar operación</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Resumen de metas</h3>
        <ul>
          <li>Meta 10%: ${(capitalBase * 1.10).toFixed(2)}</li>
          <li>Meta 20%: ${(capitalBase * 1.20).toFixed(2)}</li>
          <li>Pérdida máxima 5%: ${(capitalBase * 0.95).toFixed(2)}</li>
        </ul>

        <h3>Resumen de desempeño</h3>
        <ul>
          <li style={{ background: '#2e593e' }}>Operaciones ganadas: {ganadas}</li>
          <li style={{ background: '#5b2c2c' }}>Operaciones perdidas: {perdidas}</li>
          <li>Total de operaciones: {operaciones.length}</li>
          <li>Balance total: ${balanceTotal.toFixed(2)}</li>
        </ul>
      </div>

      <h3>Historial de operaciones</h3>
      <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Capital</th>
            <th>Valor</th>
            <th>% Operación</th>
            <th>Resultado</th>
            <th>Balance</th>
            <th>Riesgo (%)</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {operaciones.map((op, i) => (
            <tr key={i} style={{ backgroundColor: parseFloat(op.resultado) >= 0 ? '#003d00' : '#3d0000' }}>
              <td>{op.fecha}</td>
              <td>${op.capital}</td>
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

      <button style={{ marginTop: '20px', float: 'right' }} onClick={exportarPDF}>
        📤 Exportar a PDF
      </button>
    </div>
  );
}

export default App;
