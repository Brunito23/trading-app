import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from './assets/logo.png';

function App() {
  const [capitalBase, setCapitalBase] = useState(() => {
    const guardado = localStorage.getItem("capitalBase");
    return guardado ? parseFloat(guardado) : "";
  });
  const [capitalInput, setCapitalInput] = useState("");
  const [valorOperacion, setValorOperacion] = useState("");
  const [porcentajeOperacion, setPorcentajeOperacion] = useState("");
  const [operaciones, setOperaciones] = useState(() => {
    const guardadas = localStorage.getItem("operaciones");
    return guardadas ? JSON.parse(guardadas) : [];
  });

  useEffect(() => {
    if (capitalBase !== "") {
      localStorage.setItem("capitalBase", capitalBase);
    }
  }, [capitalBase]);

  const registrarOperacion = () => {
    const valor = parseFloat(valorOperacion);
    const porcentaje = parseFloat(porcentajeOperacion);
    if (!valor || isNaN(porcentaje)) return;

    const capitalInicial = operaciones.length === 0 ? capitalBase : operaciones[operaciones.length - 1].balance;
    const resultado = parseFloat((valor * porcentaje / 100).toFixed(2));
    const balance = parseFloat((capitalInicial + resultado).toFixed(2));
    const riesgo = parseFloat((((balance - capitalBase) / capitalBase) * 100).toFixed(2));

    const nuevaOperacion = {
      fecha: new Date().toLocaleDateString(),
      capital: capitalInicial,
      valor,
      porcentaje,
      resultado,
      balance,
      riesgo
    };

    const nuevasOperaciones = [...operaciones, nuevaOperacion];
    setOperaciones(nuevasOperaciones);
    localStorage.setItem("operaciones", JSON.stringify(nuevasOperaciones));
    setValorOperacion("");
    setPorcentajeOperacion("");
  };

  const borrarCapitalBase = () => {
    localStorage.removeItem("capitalBase");
    setCapitalBase("");
    setCapitalInput("");
    setOperaciones([]);
    localStorage.removeItem("operaciones");
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Historial de operaciones", 14, 10);
    doc.autoTable({
      head: [["Fecha", "Capital", "Valor", "% Operación", "Resultado", "Balance", "Riesgo (%)"]],
      body: operaciones.map(op => [
        op.fecha,
        `$${op.capital.toFixed(2)}`,
        `$${op.valor.toFixed(2)}`,
        `${op.porcentaje.toFixed(2)}%`,
        `$${op.resultado.toFixed(2)}`,
        `$${op.balance.toFixed(2)}`,
        `${op.riesgo.toFixed(2)}%`
      ])
    });
    doc.save("historial_operaciones.pdf");
  };

  const eliminarOperacion = (index) => {
    const nuevasOperaciones = [...operaciones];
    nuevasOperaciones.splice(index, 1);

    for (let i = index; i < nuevasOperaciones.length; i++) {
      const prevBalance = i === 0 ? capitalBase : nuevasOperaciones[i - 1].balance;
      const valor = nuevasOperaciones[i].valor;
      const porcentaje = nuevasOperaciones[i].porcentaje;

      const resultado = parseFloat((valor * porcentaje / 100).toFixed(2));
      const balance = parseFloat((prevBalance + resultado).toFixed(2));
      const riesgo = parseFloat((((balance - capitalBase) / capitalBase) * 100).toFixed(2));

      nuevasOperaciones[i] = {
        ...nuevasOperaciones[i],
        capital: prevBalance,
        resultado,
        balance,
        riesgo
      };
    }

    setOperaciones(nuevasOperaciones);
    localStorage.setItem("operaciones", JSON.stringify(nuevasOperaciones));
  };

  const operacionesGanadas = operaciones.filter(op => op.resultado > 0).length;
  const operacionesPerdidas = operaciones.filter(op => op.resultado < 0).length;
  const balanceTotal = operaciones.length > 0 ? operaciones[operaciones.length - 1].balance : 0;

  return (
    <div style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh', padding: '20px' }}>
      <img
        src={logo}
        alt="Logo"
        style={{ position: 'absolute', top: '10px', right: '10px', width: '60px', height: 'auto', zIndex: 10 }}
      />
      <h1 style={{ textAlign: 'center' }}>Gestión de Capital</h1>

      {capitalBase === "" ? (
        <div style={{ textAlign: 'center' }}>
          <label>Capital base: </label>
          <input
            type="number"
            value={capitalInput}
            onChange={e => setCapitalInput(e.target.value)}
          />
          <button onClick={() => setCapitalBase(parseFloat(capitalInput))}>Guardar</button>
        </div>
      ) : (
        <div style={{ backgroundColor: '#007bff', padding: '10px', color: 'white', fontWeight: 'bold' }}>
          Capital base: ${capitalBase.toFixed(2)}
          <button style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }} onClick={borrarCapitalBase}>
            ❌ Borrar capital base
          </button>
        </div>
      )}

      <div style={{ margin: '20px 0', textAlign: 'center' }}>
        <div>
          Valor operación:
          <input
            type="number"
            value={valorOperacion}
            onChange={e => setValorOperacion(e.target.value)}
          />
        </div>
        <div>
          % Operación:
          <input
            type="number"
            value={porcentajeOperacion}
            onChange={e => setPorcentajeOperacion(e.target.value)}
          />
        </div>
        <button onClick={registrarOperacion}>Registrar operación</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
        <table style={{ borderCollapse: 'collapse', width: '300px', backgroundColor: '#1e1e1e' }}>
          <thead><tr><th colSpan={2}>Resumen de metas</th></tr></thead>
          <tbody>
            <tr><td>Meta 10%</td><td>${(capitalBase * 1.10).toFixed(2)}</td></tr>
            <tr><td>Meta 20%</td><td>${(capitalBase * 1.20).toFixed(2)}</td></tr>
            <tr><td>Pérdida máxima 5%</td><td>${(capitalBase * 0.95).toFixed(2)}</td></tr>
          </tbody>
        </table>

        <table style={{ borderCollapse: 'collapse', width: '300px', backgroundColor: '#1e1e1e' }}>
          <thead><tr><th colSpan={2}>Resumen de desempeño</th></tr></thead>
          <tbody>
            <tr><td style={{ backgroundColor: '#264d26' }}>Operaciones ganadas</td><td>{operacionesGanadas}</td></tr>
            <tr><td style={{ backgroundColor: '#4d2626' }}>Operaciones perdidas</td><td>{operacionesPerdidas}</td></tr>
            <tr><td>Total</td><td>{operaciones.length}</td></tr>
            <tr><td>Balance final</td><td>${balanceTotal.toFixed(2)}</td></tr>
          </tbody>
        </table>
      </div>

      <h2>Historial de operaciones</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr>
            <th>Fecha</th><th>Capital</th><th>Valor</th><th>% Operación</th><th>Resultado</th><th>Balance</th><th>Riesgo (%)</th><th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {operaciones.map((op, index) => (
            <tr key={index} style={{ backgroundColor: op.resultado >= 0 ? '#264d26' : '#4d2626' }}>
              <td>{op.fecha}</td>
              <td>${op.capital.toFixed(2)}</td>
              <td>${op.valor.toFixed(2)}</td>
              <td>{op.porcentaje.toFixed(2)}%</td>
              <td>${op.resultado.toFixed(2)}</td>
              <td>${op.balance.toFixed(2)}</td>
              <td>{op.riesgo.toFixed(2)}%</td>
              <td>
                <button onClick={() => eliminarOperacion(index)} style={{ backgroundColor: 'white' }}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <button onClick={exportarPDF}>📄 Exportar a PDF</button>
      </div>
    </div>
  );
}

export default App;
