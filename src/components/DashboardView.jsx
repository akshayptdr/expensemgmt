import React, { useMemo, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const DashboardView = ({ expenseData, savingsData }) => {
    const [viewType, setViewType] = useState('Expenses'); // For Spending Flow toggle

    // 1. Process Spending Flow Data (Last 7 Months)
    const chartData = useMemo(() => {
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const today = new Date();
        const last7Months = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            last7Months.push({
                month: monthNames[d.getMonth()],
                year: d.getFullYear(),
                timestamp: d.getTime(),
                Income: 0,
                Expenses: 0
            });
        }

        // Aggregate Expenses
        expenseData.forEach(item => {
            const d = new Date(item.date);
            const mLabel = monthNames[d.getMonth()];
            const yLabel = d.getFullYear();
            const monthEntry = last7Months.find(m => m.month === mLabel && m.year === yLabel);
            if (monthEntry) {
                monthEntry.Expenses += parseFloat(item.amount) || 0;
            }
        });

        // Aggregate Savings (as "Income" for this chart)
        savingsData.forEach(item => {
            const d = new Date(item.date);
            const mLabel = monthNames[d.getMonth()];
            const yLabel = d.getFullYear();
            const monthEntry = last7Months.find(m => m.month === mLabel && m.year === yLabel);
            if (monthEntry) {
                monthEntry.Income += parseFloat(item.amount) || 0;
            }
        });

        return last7Months;
    }, [expenseData, savingsData]);

    // 2. Process Category Split Data (All time or current year)
    const categorySplitData = useMemo(() => {
        const categories = {};
        expenseData.forEach(item => {
            const cat = item.category || 'Other';
            categories[cat] = (categories[cat] || 0) + (parseFloat(item.amount) || 0);
        });

        const total = Object.values(categories).reduce((a, b) => a + b, 0);

        return Object.entries(categories)
            .map(([name, value]) => ({
                name,
                value,
                percent: total > 0 ? Math.round((value / total) * 100) : 0
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5 categories
    }, [expenseData]);

    const COLORS = ['#062820', '#99fadc', '#e5e7eb', '#374151', '#10b981'];

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
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Bar
                                    dataKey={viewType}
                                    fill={viewType === 'Expenses' ? '#062820' : '#99fadc'}
                                    radius={[8, 8, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Category Split Card */}
                <div className="chart-card category-split">
                    <div className="chart-header">
                        <h3>Category Split</h3>
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
                                    >
                                        {categorySplitData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="pie-center">
                                <span className="pie-total">₹{(Object.values(categorySplitData).reduce((a, b) => a + b.value, 0) / 1000).toFixed(1)}k</span>
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
