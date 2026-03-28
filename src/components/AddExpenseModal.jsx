import React, { useState, useEffect } from 'react';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw-OcDgxtU9FO8Qo7kI4-tZq1kw-wDf_FZqH8DNGazaPO1sTGNmXAk1Rgy2OfRgDuHF/exec';

const AddExpenseModal = ({ isOpen, onClose, onSuccess, target, categories, belongsToList, depositedToList }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Common Form States
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('PhonePe');
    const [notes, setNotes] = useState('');

    // Savings Specific States
    const [belongsTo, setBelongsTo] = useState('');
    const [startDate, setStartDate] = useState('');
    const [maturityDate, setMaturityDate] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [depositedTo, setDepositedTo] = useState('');
    const [matureAmount, setMatureAmount] = useState('');

    // Set defaults when lists are loaded
    useEffect(() => {
        if (isOpen) {
            if (categories?.length > 0 && !category) setCategory(categories[0]);
            if (belongsToList?.length > 0 && !belongsTo) setBelongsTo(belongsToList[0]);
            if (depositedToList?.length > 0 && !depositedTo) setDepositedTo(depositedToList[0]);
        }
    }, [isOpen, categories, belongsToList, depositedToList]);

    const handleSave = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!amount || parseFloat(amount) <= 0) {
            alert('Please enter a valid amount.');
            return;
        }
        if (!category) {
            alert('Please select a category.');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                target: target,
                amount: parseFloat(amount),
                category,
                paymentMethod,
                notes,
                belongsTo,
                startDate,
                maturityDate,
                interestRate,
                depositedTo,
                matureAmount
            };

            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                cache: 'no-cache',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            alert(`${target === 'Savings' ? 'Saving' : 'Expense'} saved successfully!`);

            // Reset
            setAmount('');
            setNotes('');
            setBelongsTo(belongsToList?.[0] || '');
            setStartDate('');
            setMaturityDate('');
            setInterestRate('');
            setDepositedTo(depositedToList?.[0] || '');
            setMatureAmount('');

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save. Please check your Script URL.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    const isSavings = target === 'Savings';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <div className="modal-header">
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                        {isSavings ? 'Principal Amount / Saving' : 'Amount Spent'}
                    </p>
                    <div className="amount-display">
                        <span className="currency">₹</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="amount-input"
                            placeholder="0.00"
                            required
                        />
                    </div>
                </div>

                <div className="modal-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label><span className="form-icon">🏷️</span> Category</label>
                            <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)} required>
                                {categories?.length === 0 ? <option>Loading...</option> :
                                    categories?.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)
                                }
                            </select>
                        </div>

                        {!isSavings && (
                            <div className="form-group">
                                <label><span className="form-icon">💳</span> Payment Method</label>
                                <select className="form-input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required>
                                    <option>PhonePe</option>
                                    <option>Paytm</option>
                                    <option>HDFC Credit Card</option>
                                    <option>Cash</option>
                                    <option>Bank Account</option>
                                </select>
                            </div>
                        )}

                        {isSavings && (
                            <>
                                <div className="form-group">
                                    <label><span className="form-icon">👤</span> Belongs To</label>
                                    <select className="form-input" value={belongsTo} onChange={(e) => setBelongsTo(e.target.value)}>
                                        {belongsToList?.length === 0 ? <option>No names found</option> :
                                            belongsToList?.map((name, idx) => <option key={idx} value={name}>{name}</option>)
                                        }
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label><span className="form-icon">🏦</span> Deposited To</label>
                                    <select className="form-input" value={depositedTo} onChange={(e) => setDepositedTo(e.target.value)}>
                                        {depositedToList?.length === 0 ? <option>No banks found</option> :
                                            depositedToList?.map((bank, idx) => <option key={idx} value={bank}>{bank}</option>)
                                        }
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label><span className="form-icon">📅</span> Start Date</label>
                                    <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label><span className="form-icon">⌛</span> Maturity Date</label>
                                    <input type="date" className="form-input" value={maturityDate} onChange={(e) => setMaturityDate(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label><span className="form-icon">📈</span> Interest Rate (%)</label>
                                    <input type="text" className="form-input" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} placeholder="e.g. 7.5" />
                                </div>
                                <div className="form-group">
                                    <label><span className="form-icon">💰</span> Mature Amount</label>
                                    <input type="number" className="form-input" value={matureAmount} onChange={(e) => setMatureAmount(e.target.value)} placeholder="₹ Estimated" />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <label><span className="form-icon">📝</span> Notes</label>
                        <textarea
                            placeholder={isSavings ? "Add details about this investment..." : "Add details about this purchase..."}
                            className="form-textarea"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <button className="save-btn" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Processing...' : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Save {isSavings ? 'Investment' : 'Expense'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddExpenseModal;
