// src/App.jsx
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from './assets/logo.png';

function App() {
  const [capitalBase, setCapitalBase] = useState(
    localStorage.getItem('capitalBase') || ''
  );
  const [valorOperacion, setValorOperacion] = useState('');
  const [porcentajeOperacion, setPorcentajeOperacion] = useState('');
  const [operaciones, setOperaciones] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('capitalBase');
    if (stored && operaciones.length === 0) {
      setCapitalBase(parseFloat(stored));
    }
  }, []);

  const handleCapitalKeyPress = (e) => {
    if (e.key === 'Enter') {
      localStorage.setItem('capitalBase', capitalBase);
    }
  };

  const handleBorrarCapital = () => {
    localStorage.removeItem('capitalBase');
    setCapitalBase('');
    setOperaciones([]);
  };

  const handleRegistrarOperacion = () => {
    if (!valorOperacion || !porcentajeOperacion || !capitalBase) return;
    const ultimaOperacion = operaciones[operaciones.length - 1];
    const capitalInicial = ultimaOperacion ? ultimaOperacion.balance : parseFloat(capitalBase);
    const resultado = (parseFloat(valorOperacion) * parseFloat(porcentajeOperacion)) / 100;
    const balance = capitalInicial + resultado;
    const riesgo = ((balance - parseFloat(capitalBase)) / parseFloat(capitalBase)) * 100;
    const nuevaOperacion = {
      fecha: new Date().toLocaleDateString(),
      capital: capitalInicial.toFixed(2),
      valor: parseFloat(valorOperacion).toFixed(2),
      porcentaje: parseFloat(porcentajeOperacion).toFixed(2),
      resultado: resultado.toFixed(2),
      balance: balance.toFixed(2),
      riesgo: riesgo.toFixed(2)
    };
    setOperaciones([...operaciones, nuevaOperacion]);
    setValorOperacion('');
    setPorcentajeOperacion('');
  };

  const handleEliminarOperacion = (index) => {
    const nuevas = operaciones.filter((_, i) => i !== index);
    const recalculadas = nuevas.map((op, i) => {
      const capitalInicial = i === 0 ? parseFloat(capitalBase) : parseFloat(recalculadas[i - 1].balance);
      const resultado = (parseFloat(op.valor) * parseFloat(op.porcentaje)) / 100;
      const balance = capitalInicial + resultado;
      const riesgo = ((balance - parseFloat(capitalBase)) / parseFloat(capitalBase)) * 100;
      return {
        ...op,
        capital: capitalInicial.toFixed(2),
        resultado: resultado.toFixed(2),
        balance: balance.toFixed(2),
        riesgo: riesgo.toFixed(2)
      };
    });
    setOperaciones(recalculadas);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text('Historial de Operaciones', 20, 10);
    doc.autoTable({
      head: [['Fecha', 'Capital', 'Valor', '% Operación', 'Resultado', 'Balance', 'Riesgo (%)']],
      body: operaciones.map(op => [op.fecha, `$${op.capital}`, `$${op.valor}`, `${op.porcentaje}%`, `$${op.resultado}`, `$${op.balance}`, `${op.riesgo}%`])
    });
    doc.save('historial_operaciones.pdf');
  };

  const total = operaciones.length;
  const ganadas = operaciones.filter(op => parseFloat(op.resultado) > 0).length;
  const perdidas = operaciones.filter(op => parseFloat(op.resultado) < 0).length;
  const balanceFinal = operaciones.length > 0 ? operaciones[operaciones.length - 1].balance : capitalBase;
  const meta10 = (parseFloat(capitalBase) * 1.1).toFixed(2);
  const meta20 = (parseFloat(capitalBase) * 1.2).toFixed(2);
  const perdidaMaxima = (parseFloat(capitalBase) * 0.95).toFixed(2);

  return (
    <div style={{ padding: '10px', color: 'white', backgroundColor: 'black', fontFamily: 'Arial' }}>
      <img src={logo} alt="Logo" style={{ position: 'absolute', top: '20px', right: '20px', width: '25%', zIndex: 5 }} />
      <h1 style={{ textAlign: 'center' }}>Gestión de Capital</h1>

      <div style={{ backgroundColor: '#007bff', padding: '10px', fontWeight: 'bold' }}>
        Capital base: ${parseFloat(capitalBase).toFixed(2)}
        <button style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }} onClick={handleBorrarCapital}>❌ Borrar capital base</button>
      </div>

      <div>
        <label>Valor operación: </label>
        <input type="number" value={valorOperacion} onChange={e => setValorOperacion(e.target.value)} />
        <br />
        <label>% Operación: </label>
        <input type="number" value={porcentajeOperacion} onChange={e => setPorcentajeOperacion(e.target.value)} />
        <br />
        <button onClick={handleRegistrarOperacion}>Registrar operación</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <table style={{ borderCollapse: 'collapse', width: '45%', fontSize: '16px' }}>
          <thead><tr><th colSpan={2}>Resumen de metas</th></tr></thead>
          <tbody>
            <tr><td>Meta 10%:</td><td>${meta10}</td></tr>
            <tr><td>Meta 20%:</td><td>${meta20}</td></tr>
            <tr><td>Pérdida máxima 5%</td><td>${perdidaMaxima}</td></tr>
          </tbody>
        </table>

        <table style={{ borderCollapse: 'collapse', width: '45%', fontSize: '16px' }}>
          <thead><tr><th colSpan={2}>Resumen de desempeño</th></tr></thead>
          <tbody>
            <tr><td style={{ backgroundColor: 'darkgreen' }}>Operaciones ganadas</td><td>{ganadas}</td></tr>
            <tr><td style={{ backgroundColor: '#6c1e1e' }}>Operaciones perdidas</td><td>{perdidas}</td></tr>
            <tr><td>Total</td><td>{total}</td></tr>
            <tr><td>Balance final</td><td>${parseFloat(balanceFinal).toFixed(2)}</td></tr>
          </tbody>
        </table>
      </div>

      <h2>Historial de operaciones</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
        <thead>
          <tr style={{ backgroundColor: '#444' }}>
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
          {operaciones.map((op, index) => (
            <tr key={index} style={{ backgroundColor: parseFloat(op.resultado) >= 0 ? 'darkgreen' : '#6c1e1e', color: 'white' }}>
              <td>{op.fecha}</td>
              <td>${op.capital}</td>
              <td>${op.valor}</td>
              <td>{op.porcentaje}%</td>
              <td>${op.resultado}</td>
              <td>${op.balance}</td>
              <td>{op.riesgo}%</td>
              <td><button onClick={() => handleEliminarOperacion(index)}>❌</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ textAlign: 'right', marginTop: '10px' }}>
        <button onClick={exportarPDF}>📄 Exportar a PDF</button>
      </div>
    </div>
  );
}

export default App;
