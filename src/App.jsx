import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from './assets/logo.png';

function App() {
  const [capitalBase, setCapitalBase] = useState(() => localStorage.getItem('capitalBase') || '');
  const [capitalFinal, setCapitalFinal] = useState(capitalBase);
  const [inputCapital, setInputCapital] = useState('');
  const [valorOperacion, setValorOperacion] = useState('');
  const [porcentajeOperacion, setPorcentajeOperacion] = useState('');
  const [historial, setHistorial] = useState(() => {
    const saved = localStorage.getItem('historial');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('capitalBase', capitalBase);
    localStorage.setItem('historial', JSON.stringify(historial));
  }, [capitalBase, historial]);

  const handleSetCapitalBase = () => {
    if (!isNaN(parseFloat(inputCapital))) {
      setCapitalBase(inputCapital);
      setCapitalFinal(inputCapital);
      setInputCapital('');
    }
  };

  const borrarCapitalBase = () => {
    setCapitalBase('');
    setHistorial([]);
    setCapitalFinal('');
    localStorage.removeItem('capitalBase');
    localStorage.removeItem('historial');
  };

  const registrarOperacion = () => {
    const valor = parseFloat(valorOperacion);
    const porcentaje = parseFloat(porcentajeOperacion);
    if (isNaN(valor) || isNaN(porcentaje)) return;

    const resultado = valor * (porcentaje / 100);
    const nuevoCapital = parseFloat(capitalFinal) + resultado;
    const riesgo = ((nuevoCapital - parseFloat(capitalBase)) / parseFloat(capitalBase)) * 100;

    const nuevaOperacion = {
      fecha: new Date().toLocaleDateString(),
      capitalInicial: capitalFinal,
      valorOperado: valorOperacion,
      porcentajeOperacion,
      resultado: resultado.toFixed(2),
      balance: nuevoCapital.toFixed(2),
      riesgo: riesgo.toFixed(2)
    };

    const nuevoHistorial = [...historial, nuevaOperacion];
    setHistorial(nuevoHistorial);
    setCapitalFinal(nuevoCapital.toFixed(2));
    setValorOperacion('');
    setPorcentajeOperacion('');
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text('Historial de Operaciones', 14, 16);
    doc.autoTable({
      startY: 20,
      head: [['Fecha', 'Capital Inicial', 'Valor Operado', '% Operación', 'Resultado', 'Balance', 'Riesgo (%)']],
      body: historial.map(op => [
        op.fecha,
        op.capitalInicial,
        op.valorOperado,
        op.porcentajeOperacion,
        op.resultado,
        op.balance,
        op.riesgo
      ])
    });
    doc.save('historial_operaciones.pdf');
  };

  return (
    <div style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh', padding: '20px' }}>
      <img
        src={logo}
        alt="Logo"
        style={{ position: 'absolute', top: '10px', right: '10px', width: '60px', height: 'auto', zIndex: 10 }}
      />

      <h1 style={{ fontSize: '1.8em' }}>Gestión de Capital</h1>

      <div>
        <input
          type="number"
          placeholder="Capital Base"
          value={inputCapital}
          onChange={(e) => setInputCapital(e.target.value)}
        />
        <button onClick={handleSetCapitalBase}>Guardar Capital</button>
        <button onClick={borrarCapitalBase}>Borrar Capital</button>
      </div>

      {capitalBase && (
        <div style={{ marginTop: '20px', backgroundColor: '#0d6efd', padding: '10px', borderRadius: '8px', width: 'fit-content' }}>
          <strong>Capital Base:</strong> ${capitalBase}
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <h2>Registro de Operaciones</h2>
        <input
          type="number"
          placeholder="Valor operado"
          value={valorOperacion}
          onChange={(e) => setValorOperacion(e.target.value)}
        />
        <input
          type="number"
          placeholder="% operación"
          value={porcentajeOperacion}
          onChange={(e) => setPorcentajeOperacion(e.target.value)}
        />
        <button onClick={registrarOperacion}>Registrar operación</button>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Resumen de Metas</h3>
        <table border="1" style={{ borderCollapse: 'collapse', width: '300px', fontSize: '1.2em' }}>
          <tbody>
            <tr><td>Meta 10%</td><td>${(parseFloat(capitalBase) * 1.10).toFixed(2)}</td></tr>
            <tr><td>Meta 20%</td><td>${(parseFloat(capitalBase) * 1.20).toFixed(2)}</td></tr>
            <tr><td>Pérdida Máx. 5%</td><td>${(parseFloat(capitalBase) * 0.95).toFixed(2)}</td></tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Historial de Operaciones</h3>
        <table border="1" style={{ borderCollapse: 'collapse', width: '100%', fontSize: '1em' }}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Capital Inicial</th>
              <th>Valor Operado</th>
              <th>% Operación</th>
              <th>Resultado</th>
              <th>Balance</th>
              <th>Riesgo (%)</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((op, index) => (
              <tr key={index}>
                <td>{op.fecha}</td>
                <td>{op.capitalInicial}</td>
                <td>{op.valorOperado}</td>
                <td>{op.porcentajeOperacion}</td>
                <td>{op.resultado}</td>
                <td>{op.balance}</td>
                <td>{op.riesgo}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button style={{ marginTop: '20px', float: 'right' }} onClick={exportarPDF}>Exportar a PDF</button>
      </div>
    </div>
  );
}

export default App;
