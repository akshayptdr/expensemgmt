import React, { useMemo, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const DashboardView = ({ expenseData, savingsData }) => {
    const [viewType, setViewType] = useState('Expenses'); // For Spending Flow toggle

    // Helper to robustly parse amounts (strips currency symbols and handles strings/numbers)
    const parseAmount = (val) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        // Strip everything except numbers, dots, and hyphens
        return parseFloat(String(val).replace(/[^0-9.-]+/g, "")) || 0;
    };

    // Helper to parse dates robustly, especially DD-MM-YYYY from Sheets
    const safelyParseDate = (dateVal) => {
        if (dateVal instanceof Date) return dateVal;
        if (!dateVal) return new Date(NaN);

        const dStr = String(dateVal).trim();
        // Match DD-MM-YYYY or DD/MM/YYYY
        const ddmmyyyy = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/;
        const match = dStr.match(ddmmyyyy);
        if (match) {
            return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
        }
        return new Date(dStr);
    };

    // 1. Process Spending Flow Data (Last 7 Months)
    const chartData = useMemo(() => {
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const today = new Date();
        const last7Months = [];

        // Generate the labels for the last 7 months relative to today
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            last7Months.push({
                month: monthNames[d.getMonth()],
                year: d.getFullYear(),
                Income: 0,
                Expenses: 0,
                label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`
            });
        }

        // Aggregate Expenses
        expenseData.forEach(item => {
            if (!item.date) return;
            const d = safelyParseDate(item.date);
            if (isNaN(d.getTime())) return;

            // Normalize to local month/year to prevent timezone shifts
            const mLabel = monthNames[d.getMonth()];
            const yLabel = d.getFullYear();

            const monthEntry = last7Months.find(m => m.month === mLabel && m.year === yLabel);
            if (monthEntry) {
                monthEntry.Expenses += parseAmount(item.amount);
            }
        });

        // Aggregate Savings (Income) - EXCLUDING inactive records
        savingsData.forEach(item => {
            if (!item.date || item.status === 'Inactive') return;
            const d = safelyParseDate(item.date);
            if (isNaN(d.getTime())) return;

            const mLabel = monthNames[d.getMonth()];
            const yLabel = d.getFullYear();

            const monthEntry = last7Months.find(m => m.month === mLabel && m.year === yLabel);
            if (monthEntry) {
                monthEntry.Income += parseAmount(item.amount);
            }
        });

        return last7Months;
    }, [expenseData, savingsData]);

    // 2. Process Category Split Data (Top 5 Categories)
    const categorySplitData = useMemo(() => {
        const categories = {};
        expenseData.forEach(item => {
            const cat = item.category || 'Other';
            categories[cat] = (categories[cat] || 0) + parseAmount(item.amount);
        });

        const sorted = Object.entries(categories)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        const top5 = sorted.slice(0, 5);
        const total = top5.reduce((acc, curr) => acc + curr.value, 0);

        return top5.map(item => ({
            ...item,
            percent: total > 0 ? Math.round((item.value / total) * 100) : 0
        }));
    }, [expenseData]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '12px 16px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6' }}>
                    <p className="label" style={{ margin: 0, fontSize: '10px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{payload[0].payload.label}</p>
                    <p className="intro" style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                        ₹{payload[0].value.toLocaleString('en-IN')}
                    </p>
                </div>
            );
        }
        return null;
    };

    const COLORS = ['#062820', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

    return (
        <div className="dashboard-view">
            <div className="charts-grid">
                {/* 1. Spending Flow Card */}
                <div className="chart-card spending-flow">
                    <div className="chart-header">
                        <div className="chart-title-group">
                            <h3>Spending Flow</h3>
                            <p>Last 7 Months Activity</p>
                        </div>
                        <div className="chart-toggle">
                            <button
                                className={`toggle-btn ${viewType === 'Income' ? 'active' : ''}`}
                                onClick={() => setViewType('Income')}
                            >Income</button>
                            <button
                                className={`toggle-btn ${viewType === 'Expenses' ? 'active' : ''}`}
                                onClick={() => setViewType('Expenses')}
                            >Expenses</button>
                        </div>
                    </div>

                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: '#f9fafb', radius: 8 }}
                                    content={<CustomTooltip />}
                                />
                                <Bar
                                    dataKey={viewType}
                                    fill={viewType === 'Expenses' ? '#062820' : '#10b981'}
                                    radius={[8, 8, 0, 0]}
                                    barSize={40}
                                    animationDuration={1500}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Category Split Card */}
                <div className="chart-card category-split">
                    <div className="chart-header">
                        <div className="chart-title-group">
                            <h3>Category Split</h3>
                            <p>Top 5 Spending Categories</p>
                        </div>
                    </div>

                    <div className="category-chart-wrapper">
                        <div className="pie-container">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={categorySplitData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        animationDuration={1500}
                                    >
                                        {categorySplitData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="pie-center">
                                <span className="pie-total">₹{(categorySplitData.reduce((a, b) => a + b.value, 0) / 1000).toFixed(1)}k</span>
                                <span className="pie-label">TOTAL</span>
                            </div>
                        </div>

                        <div className="category-legend">
                            {categorySplitData.map((item, index) => (
                                <div key={item.name} className="legend-item">
                                    <div className="legend-left">
                                        <span className="dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                        <span className="name">{item.name}</span>
                                    </div>
                                    <span className="percent">{item.percent}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
