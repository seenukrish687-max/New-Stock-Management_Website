import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ArrowDownLeft, ArrowUpRight, FileText, Trash2, Moon, Sun, RotateCcw, Menu, X } from 'lucide-react';
import { useStock } from '../context/StockContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const Sidebar = () => {
    const location = useLocation();
    const { resetData } = useStock();
    const { theme, toggleTheme } = useTheme();
    const { showToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/products', label: 'Products', icon: <Package size={20} /> },
        { path: '/stock-in', label: 'Stock In', icon: <ArrowDownLeft size={20} /> },
        { path: '/stock-out', label: 'Stock Out', icon: <ArrowUpRight size={20} /> },
        { path: '/reports', label: 'Reports', icon: <FileText size={20} /> },
        { path: '/return', label: 'Return', icon: <RotateCcw size={20} /> },
    ];

    const handleReset = async () => {
        if (window.confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
            const success = await resetData();
            if (success) {
                showToast('All data has been reset.', 'success');
                setTimeout(() => window.location.reload(), 1000); // Reload to ensure clean state
            } else {
                showToast('Failed to reset data.', 'error');
            }
        }
    };

    const toggleSidebar = () => setIsOpen(!isOpen);
    const closeSidebar = () => setIsOpen(false);

    return (
        <>
            {/* Mobile Header */}
            <div className="mobile-header">
                <button onClick={toggleSidebar} style={{ background: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                    <Menu size={24} />
                </button>
                <span style={{ marginLeft: '1rem', fontWeight: 'bold', fontSize: '1.2rem' }}>Ammachee Stock</span>
            </div>

            {/* Overlay */}
            <div
                className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
                onClick={closeSidebar}
            />

            <aside
                className={isOpen ? 'open' : ''}
                style={{
                    width: '250px',
                    backgroundColor: 'var(--color-dark-accent)',
                    color: 'var(--color-white)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '2rem 1rem'
                }}
            >
                <div style={{ marginBottom: '3rem', paddingLeft: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Ammachee Stock Management</h1>
                    <button
                        onClick={closeSidebar}
                        className="mobile-only"
                        style={{
                            background: 'none',
                            color: 'white',
                            display: window.innerWidth <= 768 ? 'block' : 'none'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={closeSidebar}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    backgroundColor: isActive ? 'var(--color-secondary-accent)' : 'transparent',
                                    color: 'var(--color-white)',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <button
                    onClick={toggleTheme}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        backgroundColor: 'transparent',
                        color: 'var(--color-white)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        cursor: 'pointer',
                        marginTop: 'auto',
                        marginBottom: '1rem',
                        width: '100%',
                        textAlign: 'left'
                    }}
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>

                <button
                    onClick={handleReset}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left'
                    }}
                >
                    <Trash2 size={20} />
                    <span>Reset Data</span>
                </button>
            </aside>
        </>
    );
};

export default Sidebar;
