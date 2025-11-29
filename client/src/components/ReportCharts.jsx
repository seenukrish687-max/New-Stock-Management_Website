import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getCategoryColor } from '../utils/colors';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ReportCharts = ({ data, type, products }) => {
    if (type === 'monthly') {
        // Prepare data for Daily Revenue Trend
        const dailyRevenue = {};
        // Initialize all days in month to 0 if needed, but for now just showing days with sales

        data.stockOut.forEach(t => {
            // t.date is likely YYYY-MM-DD or ISO string.
            // If it's ISO string from new Date().toISOString(), it has time part? 
            // In StockOut.jsx: new Date().toISOString().split('T')[0] -> YYYY-MM-DD
            // So t.date is YYYY-MM-DD
            const date = t.date;
            const amount = t.quantity * t.sellingPriceAtTime;
            dailyRevenue[date] = (dailyRevenue[date] || 0) + amount;
        });

        const trendData = Object.keys(dailyRevenue).sort().map(date => ({
            date: date.split('-')[2], // Just the day
            revenue: dailyRevenue[date]
        }));

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 'bold', color: '#333' }}>Revenue Trend</h3>
                    <div style={{ height: '300px' }}>
                        {trendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `RM${val}`} />
                                    <Tooltip
                                        formatter={(value) => `RM ${value.toFixed(2)}`}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#2563eb"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>No revenue data</div>
                        )}
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 'bold', color: '#333' }}>Top 5 Products</h3>
                    <div style={{ height: '300px' }}>
                        {data.topProducts.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.topProducts} layout="vertical" margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                                    <XAxis type="number" axisLine={false} tickLine={false} />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="quantity" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>No sales data</div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'daily') {
        return null;
    }

    return null;
};

export default ReportCharts;
