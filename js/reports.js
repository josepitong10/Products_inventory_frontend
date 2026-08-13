// reports.js - Updated with user-specific data
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initAuthenticatedPage === 'function' && !initAuthenticatedPage()) return;
    loadLowStockItems();
    loadRecentReports();
    setupRefreshButton();
});

async function loadLowStockItems() {
    const tbody = document.getElementById('lowStockTableBody');
    if (!tbody) return;

    try {
        const items = await api.getLowStockItems(); // Now returns only user's items
        
        if (!items || items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No low stock items found</td></tr>';
            return;
        }

        tbody.innerHTML = items.map(item => `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.sku}</td>
                <td>${item.quantity}</td>
                <td>${item.lowStockThreshold || item.low_stock_threshold || 5}</td>
                <td><span class="status-badge ${item.quantity <= 0 ? 'out-of-stock' : 'low-stock'}">
                    ${item.quantity <= 0 ? '⚠️ Out of Stock' : '⚠️ Low Stock'}
                </span></td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to load low stock items:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Failed to load low stock items</td></tr>';
    }
}

async function loadRecentReports() {
    const container = document.getElementById('reportCards');
    if (!container) return;

    try {
        const reports = await api.getRecentReports(); // Now returns only user's reports
        
        if (!reports || reports.length === 0) {
            container.innerHTML = '<p class="no-reports">No reports generated yet</p>';
            return;
        }

        container.innerHTML = reports.map(report => `
            <div class="report-card">
                <div class="report-header">
                    <span class="report-icon">${report.icon || '📊'}</span>
                    <span class="report-date">${new Date(report.timestamp).toLocaleDateString()}</span>
                </div>
                <h3 class="report-title">${report.title}</h3>
                <p class="report-description">${report.description || ''}</p>
                <div class="report-meta">
                    <span>${report.totalItems || 0} items</span>
                    <a href="#" class="btn btn-outline btn-small">View Details</a>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load recent reports:', error);
        container.innerHTML = '<p class="no-reports">Failed to load reports</p>';
    }
}

function setupRefreshButton() {
    const refreshBtn = document.getElementById('refreshReports');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadLowStockItems();
            loadRecentReports();
            showToast('Reports refreshed!', 'info');
        });
    }
}