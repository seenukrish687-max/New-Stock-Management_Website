import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? '#4caf50' : '#f44336';
    const icon = type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />;

    return (
        <div style={{
            backgroundColor: bgColor,
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'slideIn 0.3s ease-out',
            minWidth: '300px',
            marginBottom: '0.5rem'
        }}>
            {icon}
            <span style={{ flex: 1, fontWeight: '500' }}>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <X size={18} />
            </button>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default Toast;
