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

    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());

    // Extract available years from data
    const availableYears = useMemo(() => {
        const years = new Set();
        [...expenseData, ...savingsData].forEach(item => {
            const d = safelyParseDate(item.date);
            if (!isNaN(d.getTime())) years.add(d.getFullYear());
        });
        years.add(new Date().getFullYear());
        return Array.from(years).sort((a, b) => b - a);
    }, [expenseData, savingsData]);

    // 1. Process Spending Flow Data (Full 12 Months for Selected Year)
    const chartData = useMemo(() => {
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const selectedYear = parseInt(filterYear);
        const data = [];

        // Generate JAN-DEC for the selected year
        for (let i = 0; i < 12; i++) {
            data.push({
                month: monthNames[i],
                year: selectedYear,
                Income: 0,
                Expenses: 0,
                label: `${monthNames[i]} ${selectedYear}`
            });
        }

        // Aggregate Expenses for the selected year
        expenseData.forEach(item => {
            if (!item.date) return;
            const d = safelyParseDate(item.date);
            if (isNaN(d.getTime()) || d.getFullYear() !== selectedYear) return;

            const monthEntry = data[d.getMonth()];
            if (monthEntry) {
                monthEntry.Expenses += parseAmount(item.amount);
            }
        });

        // Aggregate Savings (Income) for the selected year
        savingsData.forEach(item => {
            if (!item.date || item.status === 'Inactive' || safelyParseDate(item.date).getFullYear() !== selectedYear) return;
            const d = safelyParseDate(item.date);
            if (isNaN(d.getTime())) return;

            const monthEntry = data[d.getMonth()];
            if (monthEntry) {
                monthEntry.Income += parseAmount(item.amount);
            }
        });

        return data;
    }, [expenseData, savingsData, filterYear]);

    // 2. Process Category Split Data (Top 5 Categories for Selected Year)
    const categorySplitData = useMemo(() => {
        const categories = {};
        const selectedYear = parseInt(filterYear);

        expenseData.forEach(item => {
            const d = safelyParseDate(item.date);
            if (isNaN(d.getTime()) || d.getFullYear() !== selectedYear) return;

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
    }, [expenseData, filterYear]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '12px 16px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6' }}>
                    <p className="label" style={{ margin: '0 0 8px', fontSize: '10px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: index > 0 ? '4px' : '0' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }}></div>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#4B5563' }}>{entry.name}:</span>
                            <span style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>₹{entry.value.toLocaleString('en-IN')}</span>
                        </div>
                    ))}
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
                            <div className="title-with-select">
                                <h3>Spending Flow</h3>
                                <select
                                    className="chart-year-select"
                                    value={filterYear}
                                    onChange={(e) => setFilterYear(e.target.value)}
                                >
                                    {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                                </select>
                                <select
                                    className="chart-year-select"
                                    value={viewType}
                                    onChange={(e) => setViewType(e.target.value)}
                                >
                                    <option value="Expenses">Expenses</option>
                                    <option value="Income">Income</option>
                                </select>
                            </div>
                            <p>{filterYear} {viewType} Activity</p>
                        </div>
                    </div>

                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    interval={0}
                                    tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }}
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
