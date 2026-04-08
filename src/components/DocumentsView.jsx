import React from 'react';
import { safelyParseDate } from '../utils/dateUtils';

const DocumentsView = ({ documents, isLoading }) => {
    const formatDate = (dateValue) => {
        if (!dateValue) return 'N/A';
        const date = safelyParseDate(dateValue);
        if (isNaN(date.getTime())) return String(dateValue);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="documents-view" style={{ textAlign: 'center', padding: '4rem', color: '#6B7280' }}>
                <p>Loading your documents...</p>
            </div>
        );
    }

    if (!documents || documents.length === 0) {
        return (
            <div className="documents-view">
                <div className="empty-actions-card" style={{ padding: '6rem 2rem' }}>
                    <div className="empty-icon" style={{ backgroundColor: '#DBEAFE', color: '#2563EB' }}>📂</div>
                    <h3>No documents yet</h3>
                    <p>Start organizing your files by adding your first document link.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="documents-view fade-in">
            <div className="documents-grid">
                {documents.map((doc, idx) => (
                    <div key={doc.id || idx} className="document-card">
                        <div className="doc-type-icon">
                            {doc.category?.toLowerCase().includes('pdf') ? '📕' : 
                             doc.category?.toLowerCase().includes('sheet') ? '📗' : 
                             doc.category?.toLowerCase().includes('image') ? '🖼️' : '📄'}
                        </div>
                        <div className="doc-content">
                            <div className="doc-header">
                                <span className="doc-category">{doc.category || 'General'}</span>
                                <span className="doc-date">{formatDate(doc.date)}</span>
                            </div>
                            <h3 className="doc-title">{doc.name || 'Untitled Document'}</h3>
                            <p className="doc-notes">{doc.notes || 'No additional notes'}</p>
                            
                            {doc.url ? (
                                <a 
                                    href={doc.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="doc-open-btn"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <line x1="10" y1="14" x2="21" y2="3"></line>
                                    </svg>
                                    Open Link
                                </a>
                            ) : (
                                <span className="doc-no-link">No link provided</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DocumentsView;
