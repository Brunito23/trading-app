import React, { useState, useEffect } from 'react';

function App() {
  const [capitalBase, setCapitalBase] = useState(() => {
    const valorGuardado = localStorage.getItem('capitalBase');
    return valorGuardado ? parseFloat(valorGuardado) : '';
  });

  const [valorOperacion, setValorOperacion] = useState('');
  const [porcentajeOperacion, setPorcentajeOperacion] = useState('');
  const [operaciones, setOperaciones] = useState(() => {
    const guardadas = localStorage.getItem('operaciones');
    return guardadas ? JSON.parse(guardadas) : [];
  });

  const [capitalActual, setCapitalActual] = useState(capitalBase || '');

  useEffect(() => {
    localStorage.setItem('capitalBase', capitalBase);
  }, [capitalBase]);

  useEffect(() => {
    localStorage.setItem('operaciones', JSON.stringify(operaciones));
  }, [operaciones]);

  const registrarOperacion = () => {
    const fecha = new Date().toLocaleDateString();
    const capitalInicial = parseFloat(capitalActual);
    const valor = parseFloat(valorOperacion);
    const porcentaje = parseFloat(porcentajeOperacion);

    const resultado = (valor * porcentaje) / 100;
    const nuevoBalance = capitalInicial + resultado;

    const riesgo =
      ((nuevoBalance - capitalBase) / capitalBase) * 100;

    const nuevaOperacion = {
      fecha,
      capitalInicial: capitalInicial.toFixed(2),
      valor: valor.toFixed(2),
      porcentaje: porcentaje.toFixed(2),
      resultado: resultado.toFixed(2),
      balance: nuevoBalance.toFixed(2),
      riesgo: riesgo.toFixed(2),
    };

    setOperaciones([...operaciones, nuevaOperacion]);
    setCapitalActual(nuevoBalance);
    setValorOperacion('');
    setPorcentajeOperacion('');
  };

  return (
    <div style={{ backgroundColor: 'black', color: 'white', padding: '2rem' }}>
      <h1 style={{ textAlign: 'center' }}>Gestión de Capital</h1>

      {capitalBase === '' ? (
        <div>
          <label>Capital base: </label>
          <input
            type="number"
            value={capitalBase}
            onChange={(e) => setCapitalBase(parseFloat(e.target.value))}
          />
        </div>
      ) : (
        <div style={{ backgroundColor: '#0074D9', padding: '0.5rem', margin: '1rem 0' }}>
          <strong>Capital base: ${capitalBase.toFixed(2)}</strong>
        </div>
      )}

      <div>
        <label>Valor operación: </label>
        <input
          type="number"
          value={valorOperacion}
          onChange={(e) => setValorOperacion(e.target.value)}
          placeholder="Ej. 25"
        />
        <br />
        <label>% Operación: </label>
        <input
          type="number"
          value={porcentajeOperacion}
          onChange={(e) => setPorcentajeOperacion(e.target.value)}
          placeholder="Ej. 84 o -100"
        />
        <br />
        <button onClick={registrarOperacion}>Registrar operación</button>
      </div>

      <h2>Historial de operaciones</h2>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Capital Inicial</th>
            <th>Valor</th>
            <th>% Operación</th>
            <th>Resultado</th>
            <th>Balance</th>
            <th>Riesgo (%)</th>
          </tr>
        </thead>
        <tbody>
          {operaciones.map((op, idx) => (
            <tr key={idx}>
              <td>{op.fecha}</td>
              <td>${op.capitalInicial}</td>
              <td>${op.valor}</td>
              <td>{op.porcentaje}%</td>
              <td>${op.resultado}</td>
              <td>${op.balance}</td>
              <td>{op.riesgo}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
