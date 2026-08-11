// Dashboard Logic
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    if (!api.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    await loadDashboardStats();
    await loadRecentActivity();
});

async function loadDashboardStats() {
    try {
        const stats = await api.getDashboardStats();
        console.log('Dashboard stats:', stats);
        
        document.getElementById('totalProducts').textContent = stats.totalProducts || stats.total_products || 0;
        document.getElementById('lowStockItems').textContent = stats.lowStockItems || stats.low_stock_items || 0;
        document.getElementById('totalSuppliers').textContent = stats.totalSuppliers || stats.total_suppliers || 0;
        document.getElementById('totalTransactions').textContent = stats.totalTransactions || stats.total_transactions || 0;
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        // Set default values
        document.getElementById('totalProducts').textContent = '0';
        document.getElementById('lowStockItems').textContent = '0';
        document.getElementById('totalSuppliers').textContent = '0';
        document.getElementById('totalTransactions').textContent = '0';
    }
}

async function loadRecentActivity() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;

    try {
        const activities = await api.getRecentReports();
        console.log('Recent activities:', activities);
        
        if (activities && activities.length > 0) {
            activityList.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">${activity.icon || '📝'}</div>
                    <div class="activity-content">
                        <p class="activity-text">${activity.title || activity.message}</p>
                        <span class="activity-time">${new Date(activity.timestamp).toLocaleString()}</span>
                    </div>
                </div>
            `).join('');
        } else {
            activityList.innerHTML = '<p class="no-activity">No recent activity</p>';
        }
    } catch (error) {
        console.error('Failed to load recent activity:', error);
        activityList.innerHTML = '<p class="no-activity">No recent activity</p>';
    }
}