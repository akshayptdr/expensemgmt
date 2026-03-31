import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TransactionTable from './components/TransactionTable';
import AddExpenseModal from './components/AddExpenseModal';
import DashboardView from './components/DashboardView';
import { safelyParseDate } from './utils/dateUtils';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw-OcDgxtU9FO8Qo7kI4-tZq1kw-wDf_FZqH8DNGazaPO1sTGNmXAk1Rgy2OfRgDuHF/exec';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Navigation State
  const [activeView, setActiveView] = useState('Dashboard');

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
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());


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
  }, [filterCategory, filterYear, activeView]);

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

  const availableYears = useMemo(() => {
    const years = new Set();
    [...expenseData, ...savingsData].forEach(item => {
      const d = safelyParseDate(item.date);
      if (!isNaN(d.getTime())) years.add(d.getFullYear());
    });
    // Ensure current year is always available
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [expenseData, savingsData]);

  const filteredTransactions = useMemo(() => {
    return currentDataset
      .filter(t => {
        const matchCategory = filterCategory === 'All Categories' || t.category === filterCategory;
        const transDate = safelyParseDate(t.date);
        if (isNaN(transDate.getTime())) return false;

        const matchYear = filterYear === 'All' || transDate.getFullYear() === parseInt(filterYear);
        return matchCategory && matchYear;
      })
      .sort((a, b) => safelyParseDate(b.date) - safelyParseDate(a.date));
  }, [currentDataset, filterCategory, filterYear]);

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

  const totalAmount = filteredTransactions.reduce((acc, t) => {
    if (activeView === 'Savings' && t.status === 'Inactive') return acc;
    return acc + (parseFloat(t.amount) || 0);
  }, 0);

  const pageTitle = activeView === 'Expenses' ? 'Expenses History' : activeView + ' Overview';

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        activeView={activeView}
        onNavChange={handleNavChange}
      />
      <main className="main-content">
        <Header toggleSidebar={toggleSidebar} title={pageTitle} />

        <div className="dashboard-grid fade-in">
          {activeView !== 'Dashboard' && (
            <div className="section-header-row">
              <h2 className="section-title desktop-only-title">{pageTitle}</h2>
              <div className="dashboard-header-actions">
                <button className="primary-btn" onClick={openModal}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Add {activeView === 'Expenses' ? 'Expense' : 'Saving'}
                </button>
              </div>
            </div>
          )}

          {activeView === 'Dashboard' ? (
            <DashboardView expenseData={expenseData} savingsData={savingsData} />
          ) : (
            <>
              {activeView !== 'Dashboard' && (
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
                      <div className="filter-group year-filter">
                        <label>Year</label>
                        <select className="filter-select" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                          <option value="All">All Years</option>
                          {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Table */}
              <TransactionTable
                transactions={paginatedTransactions}
                activeView={activeView}
                onStatusChange={handleToggleStatus}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination simplified">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="pagination-btn nav-btn prev-btn"
                  >
                    Previous
                  </button>
                  <span className="pagination-info">Page {currentPage} of {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="pagination-btn nav-btn next-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
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

      {/* Mobile Fixed Add Button */}
      {activeView !== 'Dashboard' && (
        <button className="mobile-fab" onClick={openModal} aria-label={`Add ${activeView === 'Expenses' ? 'Expense' : 'Saving'}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      )}
    </div>
  );
}

export default App;
