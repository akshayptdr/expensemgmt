import React from 'react';

const Header = ({ toggleSidebar }) => {
    return (
        <header className="header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className="menu-toggle" onClick={toggleSidebar}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
            </div>
        </header>
    );
};

export default Header;
