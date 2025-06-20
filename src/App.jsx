import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from './assets/logo.png';

function App() {
  const [capitalBase, setCapitalBase] = useState(() => localStorage.getItem('capitalBase') || '');
  const [inputCapital, setInputCapital] = useState('');
  const [valor, setValor] = useState('');
  const [porcentaje, setPorcentaje] = useState('');
  const [operaciones, setOperaciones] = useState(() => JSON.parse(localStorage.getItem('operaciones')) || []);

  const calcularRiesgo = (balanceFinal) => {
    const riesgo = ((balanceFinal - parseFloat(capitalBase)) / parseFloat(capitalBase)) * 100;
    return riesgo.toFixed(2) + '%';
  };

  const registrarOperacion = () => {
    if (!valor || !porcentaje || isNaN(valor) || isNaN(porcentaje)) return;

    const capitalInicial = operaciones.length > 0
      ? operaciones[operaciones.length - 1].balance
      : parseFloat(capitalBase);

    const resultado = parseFloat(valor) * (parseFloat(porcentaje) / 100);
    const balance = capitalInicial + resultado;
    const nuevaOperacion = {
      fecha: new Date().toLocaleDateString(),
      capital: capitalInicial.toFixed(2),
      valor: parseFloat(valor).toFixed(2),
      porcentaje: parseFloat(porcentaje).toFixed(2),
      resultado: resultado.toFixed(2),
      balance: balance.toFixed(2),
      riesgo: calcularRiesgo(balance)
    };

    const nuevasOperaciones = [...operaciones, nuevaOperacion];
    setOperaciones(nuevasOperaciones);
    localStorage.setItem('operaciones', JSON.stringify(nuevasOperaciones));

    setValor('');
    setPorcentaje('');
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text('Historial de Operaciones', 14, 16);
    doc.autoTable({
      head: [["Fecha", "Capital", "Valor", "% Operación", "Resultado", "Balance", "Riesgo"]],
      body: operaciones.map(op => [op.fecha, `$${op.capital}`, `$${op.valor}`, `${op.porcentaje}%`, `$${op.resultado}`, `$${op.balance}`, op.riesgo])
    });
    doc.save('historial_operaciones.pdf');
  };

  const borrarOperacion = (index) => {
    const nuevasOperaciones = operaciones.filter((_, i) => i !== index);
    for (let i = index; i < nuevasOperaciones.length; i++) {
      const anterior = i === 0 ? parseFloat(capitalBase) : parseFloat(nuevasOperaciones[i - 1].balance);
      const resultado = parseFloat(nuevasOperaciones[i].valor) * (parseFloat(nuevasOperaciones[i].porcentaje) / 100);
      const balance = anterior + resultado;
      nuevasOperaciones[i].capital = anterior.toFixed(2);
      nuevasOperaciones[i].resultado = resultado.toFixed(2);
      nuevasOperaciones[i].balance = balance.toFixed(2);
      nuevasOperaciones[i].riesgo = calcularRiesgo(balance);
    }
    setOperaciones(nuevasOperaciones);
    localStorage.setItem('operaciones', JSON.stringify(nuevasOperaciones));
  };

  const borrarCapitalBase = () => {
    setCapitalBase('');
    setOperaciones([]);
    localStorage.removeItem('capitalBase');
    localStorage.removeItem('operaciones');
  };

  const ganadas = operaciones.filter(op => parseFloat(op.resultado) > 0).length;
  const perdidas = operaciones.filter(op => parseFloat(op.resultado) < 0).length;

  useEffect(() => {
    if (inputCapital && !capitalBase) {
      setCapitalBase(inputCapital);
      localStorage.setItem('capitalBase', inputCapital);
    }
  }, [inputCapital, capitalBase]);

  return (
    <div style={{ backgroundColor: 'black', color: 'white', padding: '20px', fontFamily: 'Arial' }}>
      <img
        src={logo}
        alt="Logo"
        style={{ position: 'absolute', top: '10px', right: '10px', width: '25%', height: 'auto', zIndex: 10 }}
      />

      <h1 style={{ textAlign: 'center' }}>Gestión de Capital</h1>
      {capitalBase ? (
        <div style={{ backgroundColor: '#007bff', padding: '10px', fontWeight: 'bold' }}>
          Capital base: ${parseFloat(capitalBase).toFixed(2)}
          <button onClick={borrarCapitalBase} style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}>❌ Borrar capital base</button>
        </div>
      ) : (
        <input
          type="number"
          placeholder="Ingrese capital base"
          value={inputCapital}
          onChange={(e) => setInputCapital(e.target.value)}
          style={{ marginBottom: '10px', padding: '5px' }}
        />
      )}

      <div style={{ margin: '20px 0' }}>
        <label>Valor operación: </label>
        <input type="number" value={valor} onChange={e => setValor(e.target.value)} placeholder="Ej. 25" />
        <br />
        <label>% Operación: </label>
        <input type="number" value={porcentaje} onChange={e => setPorcentaje(e.target.value)} placeholder="Ej. 84 o -100" />
        <br />
        <button onClick={registrarOperacion}>Registrar operación</button>
      </div>

      {capitalBase && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <table style={{ backgroundColor: '#222', width: '50%' }}>
            <tbody>
              <tr><th colSpan="2">Resumen de metas</th></tr>
              <tr><td>Meta 10%</td><td>${(capitalBase * 1.10).toFixed(2)}</td></tr>
              <tr><td>Meta 20%</td><td>${(capitalBase * 1.20).toFixed(2)}</td></tr>
              <tr><td>Pérdida máxima 5%</td><td>${(capitalBase * 0.95).toFixed(2)}</td></tr>
            </tbody>
          </table>
          <table style={{ backgroundColor: '#222', width: '50%' }}>
            <tbody>
              <tr><th colSpan="2">Resumen de desempeño</th></tr>
              <tr><td style={{ backgroundColor: '#2e5736' }}>Operaciones ganadas</td><td>{ganadas}</td></tr>
              <tr><td style={{ backgroundColor: '#5c2e2e' }}>Operaciones perdidas</td><td>{perdidas}</td></tr>
              <tr><td>Total</td><td>{operaciones.length}</td></tr>
              <tr><td>Balance final</td><td>${operaciones.length > 0 ? operaciones[operaciones.length - 1].balance : '0.00'}</td></tr>
            </tbody>
          </table>
        </div>
      )}

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
          {operaciones.map((op, i) => (
            <tr key={i} style={{ backgroundColor: parseFloat(op.resultado) > 0 ? '#2e5736' : '#5c2e2e' }}>
              <td>{op.fecha}</td>
              <td>${op.capital}</td>
              <td>${op.valor}</td>
              <td>{op.porcentaje}%</td>
              <td>${op.resultado}</td>
              <td>${op.balance}</td>
              <td>{op.riesgo}</td>
              <td><button onClick={() => borrarOperacion(i)} style={{ backgroundColor: 'white' }}>❌</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <button style={{ marginTop: '20px', float: 'right' }} onClick={exportarPDF}>📤 Exportar a PDF</button>
    </div>
  );
}

export default App;
