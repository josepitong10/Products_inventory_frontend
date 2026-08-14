
document.addEventListener('DOMContentLoaded', () => {

    if (
        typeof initAuthenticatedPage === 'function' &&
        !initAuthenticatedPage()
    ) return;

    loadLowStockItems();
    loadInventorySummary();
    setupRefreshButton();
});

async function loadLowStockItems() {
    const tbody = document.getElementById('lowStockTableBody');

    if (!tbody) return;

    try {
        const items = await api.getLowStockItems();

        if (!items || items.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="5" class="text-center">No low stock items found</td></tr>';
            return;
        }

        tbody.innerHTML = items.map(item => `
            <tr>
                <td><strong>${item.product_name}</strong></td>
                <td>${item.sku || '-'}</td>
                <td>${item.quantity}</td>
                <td>${item.minimum_stock}</td>
                <td>
                    <span class="status-badge ${
                        item.quantity <= 0
                            ? 'out-of-stock'
                            : 'low-stock'
                    }">
                        ${
                            item.quantity <= 0
                                ? '⚠️ Out of Stock'
                                : '⚠️ Low Stock'
                        }
                    </span>
                </td>
            </tr>
        `).join('');

    } catch (error) {

        console.error(
            'Failed to load low stock items:',
            error
        );

        tbody.innerHTML =
            '<tr><td colspan="5" class="text-center text-danger">Failed to load low stock items</td></tr>';
    }
}


async function loadInventorySummary() {

    const container =
        document.getElementById('reportCards');

    if (!container) return;

    try {

        const products =
            await api.getRecentReports();

        if (!products || products.length === 0) {

            container.innerHTML =
                '<p class="no-reports">No inventory data available</p>';

            return;
        }

        container.innerHTML =
            products.slice(0, 10).map(product => `

                <div class="report-card">

                    <div class="report-header">

                        <span class="report-icon">
                            📦
                        </span>

                        <span class="report-date">
                            Current Inventory
                        </span>

                    </div>

                    <h3 class="report-title">
                        ${product.product_name}
                    </h3>

                    <p class="report-description">
                        Stock: ${product.current_stock}
                        |
                        Minimum: ${product.minimum_stock}
                    </p>

                    <div class="report-meta">

                        <span>
                            ${product.stock_status}
                        </span>

                    </div>

                </div>

            `).join('');

    } catch (error) {

        console.error(
            'Failed to load inventory summary:',
            error
        );

        container.innerHTML =
            '<p class="no-reports">Failed to load inventory summary</p>';
    }
}


function setupRefreshButton() {

    const refreshBtn =
        document.getElementById('refreshReports');

    if (!refreshBtn) return;

    refreshBtn.addEventListener('click', () => {

        loadLowStockItems();
        loadInventorySummary();

        showToast(
            'Reports refreshed!',
            'info'
        );
    });
}
