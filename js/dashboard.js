document.addEventListener('DOMContentLoaded', async () => {

    // ==========================================
    // CHECK AUTHENTICATION FIRST
    // ==========================================
    const token = api.getToken();
    const user = api.getCurrentUser();

    if (!token || !user || !user.id) {
        console.warn('User is not authenticated.');
        api.clearAuth();
        window.location.href = 'login.html';
        return;
    }

    console.log('Logged-in user:', user);

    // ==========================================
    // LOAD PRIVATE DASHBOARD
    // ==========================================
    try {
        await loadDashboardStats();
    } catch (error) {
        console.error('Dashboard error:', error);

        if (error.message === 'Authentication expired' ||
            error.message === 'User not authenticated') {
            return;
        }

        showToast(
            error.message || 'Failed to load dashboard',
            'error'
        );
    }
});


async function loadDashboardStats() {
    try {
        const stats = await api.getDashboardStats();

        console.log('Private Dashboard Stats:', stats);

        // ==========================================
        // UPDATE DASHBOARD CARDS
        // ==========================================

        const totalProducts =
            document.getElementById('totalProducts');

        const totalCategories =
            document.getElementById('totalCategories');

        const totalSuppliers =
            document.getElementById('totalSuppliers');

        const lowStockItems =
            document.getElementById('lowStockItems');

        if (totalProducts) {
            totalProducts.textContent =
                stats.totalProducts || 0;
        }

        if (totalCategories) {
            totalCategories.textContent =
                stats.totalCategories || 0;
        }

        if (totalSuppliers) {
            totalSuppliers.textContent =
                stats.totalSuppliers || 0;
        }

        if (lowStockItems) {
            lowStockItems.textContent =
                stats.lowStockItems || 0;
        }

        // ==========================================
        // RECENT TRANSACTIONS
        // ==========================================

        if (stats.recentTransactions) {
            displayRecentTransactions(
                stats.recentTransactions
            );
        }

    } catch (error) {
        console.error('Failed to load dashboard:', error);
        throw error;
    }
}