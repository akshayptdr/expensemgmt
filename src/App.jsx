import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TransactionTable from './components/TransactionTable';
import AddExpenseModal from './components/AddExpenseModal';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw-OcDgxtU9FO8Qo7kI4-tZq1kw-wDf_FZqH8DNGazaPO1sTGNmXAk1Rgy2OfRgDuHF/exec';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Navigation State
  const [activeView, setActiveView] = useState('Transactions');

  // Data States
  const [expenseData, setExpenseData] = useState([]);
  const [savingsData, setSavingsData] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [savingsCategories, setSavingsCategories] = useState([]);
  const [belongsToList, setBelongsToList] = useState([]);
  const [depositedToList, setDepositedToList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleNavChange = (view) => {
    setActiveView(view);
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, filterStartDate, filterEndDate, activeView]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(SCRIPT_URL);
      const data = await response.json();

      // Update states from new multi-sheet structure
      if (data.expenses) setExpenseData(data.expenses);
      if (data.savings) setSavingsData(data.savings);
      if (data.expenseCategories) setExpenseCategories(data.expenseCategories);
      if (data.savingsCategories) setSavingsCategories(data.savingsCategories);
      if (data.belongsToList) setBelongsToList(data.belongsToList);
      if (data.depositedToList) setDepositedToList(data.depositedToList);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine current dataset and categories based on view
  const currentDataset = activeView === 'Savings' ? savingsData : expenseData;
  const currentCategories = activeView === 'Savings' ? savingsCategories : expenseCategories;

  const filteredTransactions = useMemo(() => {
    return currentDataset.filter(t => {
      const matchCategory = filterCategory === 'All Categories' || t.category === filterCategory;
      const transDate = new Date(t.date);
      const start = filterStartDate ? new Date(filterStartDate) : null;
      const end = filterEndDate ? new Date(filterEndDate) : null;
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);
      const matchDate = (!start || transDate >= start) && (!end || transDate <= end);
      return matchCategory && matchDate;
    });
  }, [currentDataset, filterCategory, filterStartDate, filterEndDate]);

  const totalPages = Math.ceil(filteredTransactions.length / entriesPerPage);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredTransactions.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredTransactions, currentPage, entriesPerPage]);

  const handleToggleStatus = async (id, target, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

    // Optimistic Update
    if (target === 'Savings') {
      setSavingsData(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    } else {
      setExpenseData(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    }

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateStatus',
          id: id,
          target: target,
          status: newStatus
        })
      });
    } catch (error) {
      console.error('Error updating status:', error);
      // Rollback on error if needed, but no-cors makes it hard to detect failure
    }
  };

  const totalAmount = filteredTransactions.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        activeView={activeView}
        onNavChange={handleNavChange}
      />
      <main className="main-content">
        <Header toggleSidebar={toggleSidebar} />

        <div className="dashboard-grid fade-in">
          <div className="section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="section-title">{activeView === 'Transactions' ? 'Transaction History' : activeView + ' Overview'}</h2>
            <div className="dashboard-header-actions">
              <button className="primary-btn" onClick={openModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add {activeView === 'Transactions' ? 'Expense' : 'Saving'}
              </button>
            </div>
          </div>

          {(activeView === 'Transactions' || activeView === 'Savings') && (
            <div className="stats-row">
              <div className="stats-card highlight">
                <p className="stats-label">TOTAL {activeView.toUpperCase()} {activeView === 'Savings' ? 'ACCUMULATED' : 'SPEND'}</p>
                <h3 className="stats-value">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalAmount)}
                </h3>
                <p className="stats-comparison">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><line x1="17" y1="7" x2="7" y2="17"></line><polyline points="17 17 7 17 7 7"></polyline></svg>
                  {filteredTransactions.length} records found
                </p>
              </div>

              <div className="refine-view-card">
                <div className="filter-minimal-row">
                  <div className="filter-group">
                    <label>Category</label>
                    <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                      <option>All Categories</option>
                      {currentCategories.map(cat => <option key={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Start Date</label>
                    <input type="date" className="filter-input" value={filterStartDate || ''} onChange={(e) => setFilterStartDate(e.target.value)} />
                  </div>
                  <div className="filter-group">
                    <label>End Date</label>
                    <input type="date" className="filter-input" value={filterEndDate || ''} onChange={(e) => setFilterEndDate(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'Dashboard' ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#6B7280', background: 'white', borderRadius: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
              <h3>Dashboard Overview Coming Soon</h3>
              <p>General wealth statistics for both Expenses and Savings will be displayed here.</p>
            </div>
          ) : (
            <TransactionTable
              transactions={paginatedTransactions}
              totalResults={filteredTransactions.length}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
              activeView={activeView}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </div>
      </main>
      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={fetchData}
        target={activeView}
        categories={currentCategories}
        belongsToList={belongsToList}
        depositedToList={depositedToList}
      />
    </div>
  );
}

export default App;
