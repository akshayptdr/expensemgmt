import React from 'react';

const Sidebar = ({ isOpen, toggleSidebar, activeView, onNavChange, onLogout }) => {
    const navItems = [
        {
            id: 'Dashboard',
            name: 'Dashboard',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
        },
        {
            id: 'Expenses',
            name: 'Expenses',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
        },
        {
            id: 'Savings',
            name: 'Savings',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4 2 2 0 0 0 0 4 2 2 0 0 0 0 4 1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-3" /><path d="M14 13h6" /></svg>
        },
    ];

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>
            <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <h1>The Editorial Ledger</h1>
                        <p>PREMIUM WEALTH MANAGEMENT</p>
                    </div>
                    <button className="sidebar-close" onClick={toggleSidebar}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <nav>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {navItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => onNavChange(item.id)}
                                    className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                                    style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    {item.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                    <button
                        onClick={onLogout}
                        className="nav-item logout-btn"
                        style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', color: '#EF4444' }}
                    >
                        <span className="nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        </span>
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
