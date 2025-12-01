import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StockProvider } from './context/StockContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import StockIn from './pages/StockIn';
import StockOut from './pages/StockOut';
import Reports from './pages/Reports';
import ReturnProduct from './pages/ReturnProduct';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <StockProvider>
          <Router>
            <div className="layout-container">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/stock-in" element={<StockIn />} />
                  <Route path="/stock-out" element={<StockOut />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/return" element={<ReturnProduct />} />
                </Routes>
              </main>
            </div>
          </Router>
        </StockProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
