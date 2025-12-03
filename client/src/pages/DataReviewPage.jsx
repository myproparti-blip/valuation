import React, { useState, useEffect } from 'react';
import ValuationDataReview from '../components/ValuationDataReview';

/**
 * Data Review Page
 * Demonstrates integration of ValuationDataReview component
 * Handles data persistence and PDF generation with reviewed data
 */
const DataReviewPage = () => {
  const [valuationData, setValuationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'

  useEffect(() => {
    // Load existing valuation data from localStorage or API
    loadValuationData();
  }, []);

  const loadValuationData = async () => {
    try {
      setLoading(true);
      
      // Try to load from localStorage first
      const storedData = localStorage.getItem('valuationData');
      if (storedData) {
        setValuationData(JSON.parse(storedData));
        setMessage('Data loaded from cache');
        setMessageType('info');
        setLoading(false);
        return;
      }

      // Fallback to default data
      setValuationData({});
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('Error loading valuation data');
      setMessageType('error');
      setLoading(false);
    }
  };

  const handleSaveData = async (formData) => {
    try {
      // Save to localStorage
      localStorage.setItem('valuationData', JSON.stringify(formData));
      
      // Optionally save to backend
      const response = await fetch('/api/valuations/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(formData)
      }).catch(() => null); // Graceful fallback if API not available

      if (response?.ok) {
        setMessage('✓ Valuation data saved successfully');
        setMessageType('success');
      } else if (response?.status === 404) {
        // API endpoint not found, but data is saved locally
        setMessage('✓ Data saved locally (API not available)');
        setMessageType('info');
      } else if (response) {
        throw new Error('Failed to save to backend');
      } else {
        // No API, just localStorage
        setMessage('✓ Data saved locally');
        setMessageType('success');
      }

      setValuationData(formData);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving data:', error);
      setMessage('✗ Error saving data. Check console for details.');
      setMessageType('error');
    }
  };

  const handleCancelEdit = () => {
    setMessage('✗ Edit cancelled');
    setMessageType('info');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleExportData = () => {
    if (!valuationData) return;
    
    try {
      const dataStr = JSON.stringify(valuationData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `valuation_data_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setMessage('✓ Data exported successfully');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error exporting data:', error);
      setMessage('✗ Error exporting data');
      setMessageType('error');
    }
  };

  const handleGeneratePDF = async () => {
    if (!valuationData) {
      setMessage('✗ No data available for PDF generation');
      setMessageType('error');
      return;
    }

    try {
      setMessage('Generating PDF...');
      setMessageType('info');
      
      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(valuationData)
      });

      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.statusText}`);
      }

      // Download PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `valuation_report_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage('✓ PDF generated and downloaded');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setMessage(`✗ Error generating PDF: ${error.message}`);
      setMessageType('error');
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Loading valuation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Message Display */}
      {message && (
        <div style={{ ...styles.message, ...styles[`message_${messageType}`] }}>
          {message}
        </div>
      )}

      {/* Top Action Bar */}
      <div style={styles.actionBar}>
        <div>
          <h2 style={styles.pageTitle}>Valuation Data Management</h2>
        </div>
        <div style={styles.topActions}>
          <button
            onClick={handleExportData}
            style={styles.secondaryBtn}
            title="Export reviewed data as JSON"
          >
            📥 Export Data
          </button>
          <button
            onClick={handleGeneratePDF}
            style={styles.secondaryBtn}
            title="Generate PDF from reviewed data"
          >
            📄 Generate PDF
          </button>
        </div>
      </div>

      {/* Main Component */}
      {valuationData !== null && (
        <ValuationDataReview
          initialData={valuationData}
          onSave={handleSaveData}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Footer Info */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          💡 Tip: Review all data carefully before generating PDF. Changes are automatically saved to your browser.
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f0f2f5',
    padding: '20px',
  },
  message: {
    padding: '12px 16px',
    borderRadius: '4px',
    marginBottom: '20px',
    fontWeight: '500',
    animation: 'slideDown 0.3s ease',
  },
  message_success: {
    background: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
  },
  message_error: {
    background: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
  },
  message_info: {
    background: '#d1ecf1',
    color: '#0c5460',
    border: '1px solid #bee5eb',
  },
  actionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '15px 20px',
    background: 'white',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  pageTitle: {
    margin: '0',
    color: '#2c3e50',
    fontSize: '24px',
  },
  topActions: {
    display: 'flex',
    gap: '10px',
  },
  secondaryBtn: {
    padding: '10px 16px',
    border: '1px solid #ddd',
    background: 'white',
    color: '#555',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    color: '#666',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  footer: {
    marginTop: '30px',
    padding: '20px',
    background: 'white',
    borderRadius: '4px',
    textAlign: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: '13px',
    margin: '0',
  },
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(styleSheet);

export default DataReviewPage;
