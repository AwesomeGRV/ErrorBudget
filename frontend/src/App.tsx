import React from 'react';
import './App.css';
import Dashboard from './components/Dashboard';

function App(): JSX.Element {
  return (
    <div className="App">
      <header className="bg-gray-900 text-white p-4">
        <h1 className="text-2xl font-bold">SLO Platform</h1>
        <p className="text-gray-300">Reliability as a Product</p>
      </header>
      <main className="container mx-auto p-4">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
