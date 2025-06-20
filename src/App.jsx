// src/App.jsx
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from './assets/logo.png';

function App() {
  const [capitalBase, setCapitalBase] = useState(
    localStorage.getItem('capitalBase') || ''
  );
  const [capitalBaseFinal, setCapitalBaseFinal] = useState(
    localStorage.getItem('capitalBase') || null
  );
  const [valorOperacion, setValorOperacion] = useState('');
  const [porcentajeOperacion, setPorcentajeOperacion] = useState('');
  const [operaciones, setOperaciones] = useState(
    JSON.parse(localStorage.getItem('operaciones')) || []
  );

  useEffect(() => {
    localStorage.setItem('operaciones', JSON.stringify(operaciones));
  }, [operaciones]);

  const calcularResumen = () => {
    let ganadas = 0,
      perdidas = 0,
      balanceTotal = 0;
    operaciones.forEach((op) => {
      if (op.resultado >= 0) ganadas++;
      else perdidas++;
      balanceTotal += parseFloat(op.resultado);
    });
    return {
      ganadas,
      perdidas,
      total: operaciones.length,
      balanceTotal,
    };
  };

  const registrarOperacion = () => {
    if (!valorOperacion || !porcentajeOperacion || !capitalBaseFinal) return;
    const fecha = new Date().toLocaleDateString();
    const capitalInicial = operaciones.length
      ? operaciones[operaciones.length - 1].balance
      : parseFloat(capitalBaseFinal);
    const resultado = (
      (parseFloat(valorOperacion) * parseFloat(porcentajeOperacion)) /
      100
    ).toFixed(2);
    const balance = (parseFloat(capitalInicial) + parseFloat(resultado)).toFixed(2);
    const riesgo = (
      ((balance - capitalBaseFinal) / capitalBaseFinal) * 100
    ).toFixed(2);

    const nuevaOperacion = {
      fecha,
      capitalInicial: capitalInicial.toFixed(2),
      valor: parseFloat(valorOperacion).toFixed(2),
      porcentaje: parseFloat(porcentajeOperacion).toFixed(2),
      resultado,
      balance,
      riesgo,
    };

    setOperaciones([...operaciones, nuevaOperacion]);
    setValorOperacion('');
    setPorcentajeOperacion('');
  };

  const borrarOperacion = (index) => {
    const nuevas = [...operaciones];
    nuevas.splice(index, 1);
    for (let i = index; i < nuevas.length; i++) {
      const anterior = i === 0 ? parseFloat(capitalBaseFinal) : parseFloat(nuevas[i - 1].balance);
      const resultado = (
        (parseFloat(nuevas[i].valor) * parseFloat(nuevas[i].porcentaje)) /
        100
      ).toFixed(2);
      const balance = (anterior + parseFloat(resultado)).toFixed(2);
      const riesgo = (
        ((balance - capitalBaseFinal) / capitalBaseFinal) * 100
      ).toFixed(2);

      nuevas[i] = {
        ...nuevas[i],
        capitalInicial: anterior.toFixed(2),
        resultado,
        balance,
        riesgo,
      };
    }
    setOperaciones(nuevas);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text('Historial de operaciones', 10, 10);
    doc.autoTable({
      head: [['Fecha', 'Capital', 'Valor', '% Operación', 'Resultado', 'Balance', 'Riesgo (%)']],
      body: operaciones.map((op) => [
        op.fecha,
        `$${op.capitalInicial}`,
        `$${op.valor}`,
        `${op.porcentaje}%`,
        `$${op.resultado}`,
        `$${op.balance}`,
        `${op.riesgo}%`,
      ]),
    });
    doc.save('historial.pdf');
  };

  const resumen = calcularResumen();

  return (
    <div style={{ backgroundColor: 'black', color: 'white', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <img
        src={logo}
        alt="Logo"
        style={{ position: 'absolute', top: '20px', right: '20px', width: '25%', zIndex: 10 }}
      />
      <h1 style={{ textAlign: 'center' }}>Gestión de Capital</h1>

      {!capitalBaseFinal ? (
        <input
          type="number"
          value={capitalBase}
          onChange={(e) => setCapitalBase(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setCapitalBaseFinal(parseFloat(capitalBase));
              localStorage.setItem('capitalBase', parseFloat(capitalBase));
            }
          }}
          placeholder="Ingresa capital base y presiona Enter"
        />
      ) : (
        <div style={{ backgroundColor: '#007bff', padding: '10px', color: 'white', fontWeight: 'bold' }}>
          Capital base: ${parseFloat(capitalBaseFinal).toFixed(2)}{' '}
          <button
            onClick={() => {
              localStorage.removeItem('capitalBase');
              setCapitalBase('');
              setCapitalBaseFinal(null);
              setOperaciones([]);
            }}
            style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}
          >
            ❌ Borrar capital base
          </button>
        </div>
      )}

      {capitalBaseFinal && (
        <>
          <div style={{ margin: '20px 0' }}>
            <div>
              Valor operación:{' '}
              <input
                type="number"
                value={valorOperacion}
                onChange={(e) => setValorOperacion(e.target.value)}
              />
            </div>
            <div>
              % Operación:{' '}
              <input
                type="number"
                value={porcentajeOperacion}
                onChange={(e) => setPorcentajeOperacion(e.target.value)}
              />
            </div>
            <button onClick={registrarOperacion}>Registrar operación</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <table style={{ backgroundColor: '#2a2a2a', padding: '10px' }}>
              <thead>
                <tr><th colSpan="2">Resumen de metas</th></tr>
              </thead>
              <tbody>
                <tr><td>Meta 10%</td><td>${(capitalBaseFinal * 1.1).toFixed(2)}</td></tr>
                <tr><td>Meta 20%</td><td>${(capitalBaseFinal * 1.2).toFixed(2)}</td></tr>
                <tr><td>Pérdida máxima 5%</td><td>${(capitalBaseFinal * 0.95).toFixed(2)}</td></tr>
              </tbody>
            </table>

            <table style={{ backgroundColor: '#2a2a2a', padding: '10px' }}>
              <thead>
                <tr><th colSpan="2">Resumen de desempeño</th></tr>
              </thead>
              <tbody>
                <tr><td style={{ backgroundColor: 'darkgreen' }}>Operaciones ganadas</td><td>{resumen.ganadas}</td></tr>
                <tr><td style={{ backgroundColor: 'brown' }}>Operaciones perdidas</td><td>{resumen.perdidas}</td></tr>
                <tr><td>Total</td><td>{resumen.total}</td></tr>
                <tr><td>Balance final</td><td>${(capitalBaseFinal + resumen.balanceTotal).toFixed(2)}</td></tr>
              </tbody>
            </table>
          </div>

          <h2>Historial de operaciones</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead style={{ backgroundColor: '#444' }}>
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
              {operaciones.map((op, idx) => (
                <tr key={idx} style={{ backgroundColor: op.resultado >= 0 ? '#184d28' : '#4d1f1f' }}>
                  <td>{op.fecha}</td>
                  <td>${op.capitalInicial}</td>
                  <td>${op.valor}</td>
                  <td>{op.porcentaje}%</td>
                  <td>${op.resultado}</td>
                  <td>${op.balance}</td>
                  <td>{op.riesgo}%</td>
                  <td>
                    <button onClick={() => borrarOperacion(idx)} style={{ backgroundColor: 'white' }}>❌</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={exportarPDF} style={{ float: 'right', marginTop: '10px' }}>📤 Exportar a PDF</button>
        </>
      )}
    </div>
  );
}

export default App;
