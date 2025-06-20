import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function App() {
  const [capitalBase, setCapitalBase] = useState(() => localStorage.getItem('capitalBase') || '');
  const [valorOperacion, setValorOperacion] = useState('');
  const [porcentaje, setPorcentaje] = useState('');
  const [operaciones, setOperaciones] = useState(() => JSON.parse(localStorage.getItem('operaciones')) || []);
  const [capitalBloqueado, setCapitalBloqueado] = useState(!!localStorage.getItem('capitalBase'));

  const calcularBalanceFinal = () => {
    if (operaciones.length === 0) return 0;
    return operaciones[operaciones.length - 1].balance;
  };

  const calcularRiesgo = (balanceFinal) => {
    if (!capitalBase || isNaN(capitalBase)) return '0.00%';
    return `${(((balanceFinal - parseFloat(capitalBase)) / parseFloat(capitalBase)) * 100).toFixed(2)}%`;
  };

  const registrarOperacion = () => {
    const capitalInicial = operaciones.length === 0 ? parseFloat(capitalBase) : operaciones[operaciones.length - 1].balance;
    const valor = parseFloat(valorOperacion);
    const porcentajeNum = parseFloat(porcentaje);
    const resultado = parseFloat((valor * porcentajeNum) / 100).toFixed(2);
    const balance = parseFloat(capitalInicial + parseFloat(resultado)).toFixed(2);
    const riesgo = calcularRiesgo(balance);

    const nuevaOperacion = {
      fecha: new Date().toLocaleDateString(),
      capitalInicial: `$${capitalInicial.toFixed(2)}`,
      valor: `$${valor.toFixed(2)}`,
      porcentaje: `${porcentajeNum.toFixed(2)}%`,
      resultado: `$${resultado}`,
      balance: `$${balance}`,
      riesgo,
    };

    const nuevasOperaciones = [...operaciones, nuevaOperacion];
    setOperaciones(nuevasOperaciones);
    localStorage.setItem('operaciones', JSON.stringify(nuevasOperaciones));
  };

  const borrarCapitalBase = () => {
    localStorage.removeItem('capitalBase');
    setCapitalBase('');
    setCapitalBloqueado(false);
    setOperaciones([]);
    localStorage.removeItem('operaciones');
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text('Historial de Operaciones', 14, 16);
    const rows = operaciones.map(op => Object.values(op));
    doc.autoTable({
      startY: 20,
      head: [['Fecha', 'Capital Inicial', 'Valor', '% Operación', 'Resultado', 'Balance', 'Riesgo (%)']],
      body: rows
    });
    doc.save('historial_operaciones.pdf');
  };

  const eliminarOperacion = (index) => {
    const nuevasOperaciones = operaciones.filter((_, i) => i !== index);
    setOperaciones(nuevasOperaciones);
    localStorage.setItem('operaciones', JSON.stringify(nuevasOperaciones));
  };

  useEffect(() => {
    if (capitalBase && capitalBloqueado) {
      localStorage.setItem('capitalBase', capitalBase);
    }
  }, [capitalBase, capitalBloqueado]);

  const metas = capitalBase ? {
    meta10: (capitalBase * 1.10).toFixed(2),
    meta20: (capitalBase * 1.20).toFixed(2),
    perdida5: (capitalBase * 0.95).toFixed(2),
  } : {};

  const ganancias = operaciones.filter(op => parseFloat(op.resultado.replace('$', '')) > 0).length;
  const perdidas = operaciones.length - ganancias;
  const balanceTotal = operaciones.length > 0
    ? parseFloat(operaciones[operaciones.length - 1].balance.replace('$', '')) - parseFloat(capitalBase)
    : 0;

  return (
    <div style={{ backgroundColor: 'black', color: 'white', fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1 style={{ textAlign: 'center' }}>Gestión de Capital</h1>

      {!capitalBloqueado ? (
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <label>Capital base: </label>
          <input type="number" value={capitalBase} onChange={e => setCapitalBase(e.target.value)} />
          <button onClick={() => setCapitalBloqueado(true)}>Guardar</button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <p style={{ backgroundColor: '#007BFF', padding: '0.5rem', fontWeight: 'bold' }}>Capital base: ${capitalBase}</p>
          <button onClick={borrarCapitalBase}>❌ Borrar capital base</button>
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <div>
          <label>Valor operación: </label>
          <input type="number" placeholder="Ej. 25" value={valorOperacion} onChange={e => setValorOperacion(e.target.value)} />
        </div>
        <div>
          <label>% Operación: </label>
          <input type="number" placeholder="Ej. 84 o -100" value={porcentaje} onChange={e => setPorcentaje(e.target.value)} />
        </div>
        <button onClick={registrarOperacion}>Registrar operación</button>
      </div>

      {capitalBase && (
        <>
          <h3>Resumen de metas</h3>
          <ul>
            <li>Meta 10%: ${metas.meta10}</li>
            <li>Meta 20%: ${metas.meta20}</li>
            <li>Pérdida máxima 5%: ${metas.perdida5}</li>
          </ul>

          <h3>Resumen de desempeño</h3>
          <ul>
            <li>Operaciones ganadas: {ganancias}</li>
            <li>Operaciones perdidas: {perdidas}</li>
            <li>Total de operaciones: {operaciones.length}</li>
            <li>Balance total: ${balanceTotal.toFixed(2)}</li>
          </ul>

          <h3>Historial de operaciones</h3>
          <table border="1" cellPadding="5" style={{ width: '100%', backgroundColor: '#111' }}>
            <thead>
              <tr>
                <th>Día</th>
                <th>Capital</th>
                <th>Valor</th>
                <th>% Operación</th>
                <th>Resultado</th>
                <th>Balance</th>
                <th>Riesgo (%)</th>
                <th>🗑️</th>
              </tr>
            </thead>
            <tbody>
              {operaciones.map((op, i) => (
                <tr key={i}>
                  <td>{op.fecha}</td>
                  <td>{op.capitalInicial}</td>
                  <td>{op.valor}</td>
                  <td>{op.porcentaje}</td>
                  <td>{op.resultado}</td>
                  <td>{op.balance}</td>
                  <td>{op.riesgo}</td>
                  <td><button onClick={() => eliminarOperacion(i)}>❌</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button onClick={exportarPDF}>📤 Exportar a PDF</button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
