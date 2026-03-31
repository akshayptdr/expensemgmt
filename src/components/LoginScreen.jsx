import React, { useState } from 'react';

const LoginScreen = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === '1610') {
            onLogin();
        } else {
            setError(true);
            setPassword('');
            setTimeout(() => setError(false), 500);
        }
    };

    return (
        <div className="login-overlay">
            <div className={`login-card ${error ? 'shake' : ''}`}>
                <div className="login-header">
                    <div className="login-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <h1>The Editorial Ledger</h1>
                    <p>PREMIUM WEALTH MANAGEMENT</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="password-input-wrapper">
                        <input
                            type="password"
                            placeholder="••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                            maxLength={4}
                            className={error ? 'error' : ''}
                        />
                    </div>
                    
                    <button type="submit" className="login-submit-btn">
                        Access Account
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </form>

                {error && <p className="error-message">Access Denied. Invalid Authorization Code.</p>}
                
                <div className="login-footer">
                    <p>SECURE TERMINAL ACCESS v2.0</p>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
