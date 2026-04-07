import React from 'react';
import { safelyParseDate } from '../utils/dateUtils';

const TransactionTable = ({ transactions, totalResults, currentPage, totalPages, onPageChange, isLoading, activeView, onToggleStatus }) => {
    // Format currency to Indian Rupee
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '-';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Format date string
    const formatDate = (dateValue) => {
        if (!dateValue) return { main: 'N/A', time: '' };
        const date = safelyParseDate(dateValue);
        
        if (isNaN(date.getTime())) {
            return { main: String(dateValue), time: '' };
        }

        return {
            main: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
    };

    // Determine if we should show extended columns (Savings/FD mode)
    const isExtended = activeView === 'Savings';

    return (
        <section className="table-section fade-in">
            <div className="transactions-table-wrapper" style={{ overflowX: 'auto' }}>
                <table className="transactions-table">
                    <thead>
                        <tr>
                            <th>DATE</th>
                            {isExtended && <th>BELONGS TO</th>}
                            <th>DESCRIPTION / NOTES</th>
                            <th>CATEGORY</th>
                            <th>AMOUNT</th>
                            {!isExtended && <th>METHOD</th>}
                            {isExtended && (
                                <>
                                    <th>DEPOSITED TO</th>
                                    <th>START DATE</th>
                                    <th>MATURITY DATE</th>
                                    <th>RATE</th>
                                    <th>MATURE AMT</th>
                                </>
                            )}
                            {isExtended && <th>STATUS</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={isExtended ? 12 : 5} style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
                                    Loading live data...
                                </td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan={isExtended ? 12 : 5} style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
                                    No records found.
                                </td>
                            </tr>
                        ) : (
                            transactions.map((t, idx) => {
                                const dateInfo = formatDate(t.date);
                                const startInfo = t.startDate ? formatDate(t.startDate) : null;
                                const maturityInfo = t.maturityDate ? formatDate(t.maturityDate) : null;
                                const isActive = (t.status || 'Active').trim().toLowerCase() === 'active';

                                return (
                                    <tr key={t.id || idx}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{dateInfo.main}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '2px' }}>{dateInfo.time}</div>
                                        </td>
                                        {isExtended && <td style={{ fontWeight: 500 }}>{t.belongsTo || '-'}</td>}
                                        <td style={{ fontWeight: 500, color: '#374151', minWidth: '150px' }}>
                                            {t.notes || 'No description'}
                                        </td>
                                        <td>
                                            <span className="category-badge">{t.category}</span>
                                        </td>
                                        <td style={{ fontWeight: 700, color: '#062820' }}>
                                            {formatCurrency(t.amount)}
                                        </td>
                                        {!isExtended && (
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4B5563', fontSize: '0.875rem' }}>
                                                    {t.method}
                                                </div>
                                            </td>
                                        )}
                                        {isExtended && (
                                            <>
                                                <td style={{ fontSize: '0.875rem' }}>{t.depositedTo || '-'}</td>
                                                <td style={{ fontSize: '0.875rem' }}>{startInfo ? startInfo.main : '-'}</td>
                                                <td style={{ fontSize: '0.875rem', color: '#B45309', fontWeight: 600 }}>{maturityInfo ? maturityInfo.main : '-'}</td>
                                                <td style={{ fontSize: '0.875rem', fontWeight: 600 }}>{t.interestRate ? `${t.interestRate}%` : '-'}</td>
                                                <td style={{ fontWeight: 700, color: '#059669' }}>
                                                    {formatCurrency(t.matureAmount)}
                                                </td>
                                            </>
                                        )}
                                        {isExtended && (
                                            <td>
                                                <div className="status-toggle-wrapper">
                                                    <label className="switch">
                                                        <input
                                                            type="checkbox"
                                                            checked={isActive}
                                                            onChange={() => onToggleStatus(t.id, activeView, t.status || 'Active')}
                                                        />
                                                        <span className="slider round"></span>
                                                    </label>
                                                    <span className={`status-text ${isActive ? 'active' : 'inactive'}`}>
                                                        {isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default TransactionTable;
