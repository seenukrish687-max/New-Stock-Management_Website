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

import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <StockProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/*" element={
                  <ProtectedRoute>
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
                  </ProtectedRoute>
                } />
              </Routes>
            </Router>
          </StockProvider>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
