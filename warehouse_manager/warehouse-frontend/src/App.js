import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EntryList from './components/EntryList';
import ExitList from './components/ExitList';
import StockChart from './components/StockChart';
import Login from './components/Login';
import Register from './components/Register';
import Logout from './components/Logout'; // Importa el componente de Logout
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function Home() {
  return (
    <div>
      <div className="section">
        <h2>Entradas</h2>
        <EntryList />
      </div>
      <div className="section">
        <h2>Salidas</h2>
        <ExitList />
      </div>
      <div className="section chart-section">
        <h2>Gráficos de Stock</h2>
        <StockChart />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>AMALIA. Gestión Almacén</h1>
          <Logout /> {/* Agrega el botón de Logout */}
        </header>
        <main>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute component={Home} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
