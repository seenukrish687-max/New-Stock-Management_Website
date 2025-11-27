import React, { createContext, useState, useEffect, useContext } from 'react';

const StockContext = createContext();

export const useStock = () => useContext(StockContext);

export const StockProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [transactions, setTransactions] = useState({ stockIn: [], stockOut: [] });
    const [loading, setLoading] = useState(true);

    const API_URL = 'http://localhost:5000/api';

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_URL}/products`);
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        }
    };

    const fetchTransactions = async () => {
        try {
            const res = await fetch(`${API_URL}/transactions`);
            const data = await res.json();
            setTransactions(data);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        }
    };

    useEffect(() => {
        Promise.all([fetchProducts(), fetchTransactions()]).then(() => setLoading(false));
    }, []);

    const addProduct = async (formData) => {
        try {
            const res = await fetch(`${API_URL}/products`, {
                method: 'POST',
                body: formData,
            });
            const newProduct = await res.json();
            setProducts([...products, newProduct]);
            return newProduct;
        } catch (error) {
            console.error("Failed to add product", error);
            throw error;
        }
    };

    const addStockIn = async (data) => {
        try {
            const res = await fetch(`${API_URL}/stock-in`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const transaction = await res.json();
            setTransactions(prev => ({ ...prev, stockIn: [...prev.stockIn, transaction] }));
            await fetchProducts();
            return transaction;
        } catch (error) {
            console.error("Failed to add stock in", error);
            throw error;
        }
    };

    const addStockOut = async (data) => {
        try {
            const res = await fetch(`${API_URL}/stock-out`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error);
            }
            const transaction = await res.json();
            setTransactions(prev => ({ ...prev, stockOut: [...prev.stockOut, transaction] }));
            await fetchProducts();
            return transaction;
        } catch (error) {
            console.error("Failed to add stock out", error);
            throw error;
        }
    };

    const resetData = async () => {
        try {
            const res = await fetch(`${API_URL}/reset`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setProducts([]);
                setTransactions({ stockIn: [], stockOut: [] });
                return true;
            }
        } catch (error) {
            console.error("Failed to reset data", error);
            return false;
        }
    };

    const deleteProduct = async (id) => {
        console.log("Context: deleteProduct called with id:", id);
        try {
            const res = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE',
            });
            console.log("Context: delete response status:", res.status);
            if (res.ok) {
                setProducts(prev => prev.filter(p => p.id !== id));
                return true;
            } else {
                let errorMessage;
                try {
                    const err = await res.json();
                    errorMessage = err.error || JSON.stringify(err);
                } catch (e) {
                    errorMessage = await res.text();
                }
                console.error("Failed to delete product:", errorMessage);
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error("Failed to delete product", error);
            throw error;
        }
    };

    const value = {
        products,
        transactions,
        loading,
        addProduct,
        addStockIn,
        addStockOut,
        resetData,
        deleteProduct
    };

    return (
        <StockContext.Provider value={value}>
            {children}
        </StockContext.Provider>
    );
};
