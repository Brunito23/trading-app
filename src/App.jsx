// Asegurando una aplicación funcional con:
// - ingreso libre de capital base (editable hasta que se confirme)
// - posibilidad de registrar múltiples operaciones
// - cálculo de desempeño y riesgo
// - exportación a PDF
// - eliminación de operaciones
// - tabla visual compacta y legible
// - logo en esquina superior derecha

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from './assets/logo.png';

function App() {
  const [capitalBase, setCapitalBase] = useState(() => localStorage.getItem('capitalBase') || '');
  const [valor, setValor] = useState('');
  const [porcentaje, setPorcentaje] = useState('');
  const [operaciones, setOperaciones] = useState(() => JSON.parse(localStorage.getItem('operaciones')) || []);
  const [capitalInicial, setCapitalInicial] = useState(() => Number(capitalBase) || 0);
  const [confirmado, setConfirmado] = useState(() => localStorage.getItem('confirmado') === 'true');

  useEffect(() => {
    if (confirmado) {
      localStorage.setItem('capitalBase', capitalBase);
    }
  }, [capitalBase, confirmado]);

  useEffect(() => {
    localStorage.setItem('operaciones', JSON.stringify(operaciones));
  }, [operaciones]);

  const registrarOperacion = () => {
    if (!valor || !porcentaje || isNaN(valor) || isNaN(porcentaje)) return;

    const resultado = (parseFloat(valor) * parseFloat(porcentaje)) / 100;
    const nuevoBalance = capitalInicial + resultado;
    const riesgo = (((nuevoBalance - Number(capitalBase)) / Number(capitalBase)) * 100).toFixed(2);

    const nuevaOperacion = {
      fecha: new Date().toLocaleDateString(),
      capital: capitalInicial,
      valor: parseFloat(valor),
      porcentaje: parseFloat(porcentaje),
      resultado: resultado,
      balance: nuevoBalance,
      riesgo: riesgo
    };

    setOperaciones([...operaciones, nuevaOperacion]);
    setCapitalInicial(nuevoBalance);
    setValor('');
    setPorcentaje('');
  };

  const borrarOperacion = (index) => {
    const nuevas = operaciones.filter((_, i) => i !== index);
    let capitalTemp = Number(capitalBase);
    const actualizadas = nuevas.map(op => {
      const res = (op.valor * op.porcentaje) / 100;
      const nuevoBalance = capitalTemp + res;
      const riesgo = (((nuevoBalance - Number(capitalBase)) / Number(capitalBase)) * 100).toFixed(2);
      const nueva = { ...op, capital: capitalTemp, balance: nuevoBalance, riesgo };
      capitalTemp = nuevoBalance;
      return nueva;
    });
    setOperaciones(actualizadas);
    setCapitalInicial(actualizadas.at(-1)?.balance || Number(capitalBase));
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Fecha', 'Capital', 'Valor', '% Operación', 'Resultado', 'Balance', 'Riesgo (%)']],
      body: operaciones.map(op => [
        op.fecha,
        `$${op.capital.toFixed(2)}`,
        `$${op.valor.toFixed(2)}`,
        `${op.porcentaje.toFixed(2)}%`,
        `$${op.resultado.toFixed(2)}`,
        `$${op.balance.toFixed(2)}`,
        `${op.riesgo}%`
      ])
    });
    doc.save('historial_operaciones.pdf');
  };

  const ganadas = operaciones.filter(op => op.resultado > 0).length;
  const perdidas = operaciones.filter(op => op.resultado < 0).length;
  const balanceFinal = operaciones.at(-1)?.balance || 0;

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px', fontSize: '16px' }}>
      <img src={logo} alt="Logo" style={{ position: 'absolute', top: 10, right: 10, width: 60 }} />
      <h1 style={{ textAlign: 'center' }}>Gestión de Capital</h1>

      {!confirmado ? (
        <div style={{ textAlign: 'center' }}>
          <label>Capital base: </label>
          <input value={capitalBase} onChange={e => setCapitalBase(e.target.value)} type="number" />
          <button onClick={() => {
            setConfirmado(true);
            localStorage.setItem('confirmado', 'true');
            setCapitalInicial(Number(capitalBase));
          }}>Confirmar</button>
        </div>
      ) : (
        <div style={{ backgroundColor: '#007bff', padding: '10px', fontWeight: 'bold', color: '#fff' }}>
          Capital base: ${parseFloat(capitalBase).toFixed(2)}
          <button onClick={() => {
            localStorage.clear();
            setCapitalBase('');
            setOperaciones([]);
            setConfirmado(false);
          }} style={{ marginLeft: '10px', backgroundColor: '#f00', color: '#fff' }}>
            ❌ Borrar capital base
          </button>
        </div>
      )}

      {confirmado && (
        <>
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <div>
              <label>Valor operación: </label>
              <input value={valor} onChange={e => setValor(e.target.value)} type="number" />
            </div>
            <div>
              <label>% Operación: </label>
              <input value={porcentaje} onChange={e => setPorcentaje(e.target.value)} type="number" />
            </div>
            <button onClick={registrarOperacion}>Registrar operación</button>
          </div>

          <div style={{ display: 'flex', marginTop: '20px', justifyContent: 'space-around', fontSize: '15px' }}>
            <table style={{ background: '#111', color: '#fff', width: '45%' }}>
              <thead><tr><th colSpan="2">Resumen de metas</th></tr></thead>
              <tbody>
                <tr><td>Meta 10%</td><td>${(capitalBase * 1.1).toFixed(2)}</td></tr>
                <tr><td>Meta 20%</td><td>${(capitalBase * 1.2).toFixed(2)}</td></tr>
                <tr><td>Pérdida máxima 5%</td><td>${(capitalBase * 0.95).toFixed(2)}</td></tr>
              </tbody>
            </table>

            <table style={{ background: '#111', color: '#fff', width: '45%' }}>
              <thead><tr><th colSpan="2">Resumen de desempeño</th></tr></thead>
              <tbody>
                <tr><td style={{ background: '#2e7031' }}>Operaciones ganadas</td><td>{ganadas}</td></tr>
                <tr><td style={{ background: '#702e2e' }}>Operaciones perdidas</td><td>{perdidas}</td></tr>
                <tr><td>Total</td><td>{operaciones.length}</td></tr>
                <tr><td>Balance final</td><td>${balanceFinal.toFixed(2)}</td></tr>
              </tbody>
            </table>
          </div>

          <h2 style={{ marginTop: '30px' }}>Historial de operaciones</h2>
          <table style={{ width: '100%', fontSize: '14px' }}>
            <thead style={{ backgroundColor: '#333' }}>
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
              {operaciones.map((op, index) => (
                <tr key={index} style={{ backgroundColor: op.resultado >= 0 ? '#1e4023' : '#40231e' }}>
                  <td>{op.fecha}</td>
                  <td>${op.capital.toFixed(2)}</td>
                  <td>${op.valor.toFixed(2)}</td>
                  <td>{op.porcentaje.toFixed(2)}%</td>
                  <td>${op.resultado.toFixed(2)}</td>
                  <td>${op.balance.toFixed(2)}</td>
                  <td>{op.riesgo}%</td>
                  <td><button onClick={() => borrarOperacion(index)}>❌</button></td>
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
