// inventory.js - Updated with user-specific data
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initAuthenticatedPage === 'function' && !initAuthenticatedPage()) return;
    loadProductsForSelect();
    loadTransactions();
    setupTransactionForm();
});

async function loadProductsForSelect() {
    const select = document.getElementById('transactionProduct');
    if (!select) return;

    try {
        const products = await api.getProducts(); // Now returns only user's products
        
        select.innerHTML = `
            <option value="">Select a product</option>
            ${products.map(p => `
                <option value="${p.id}">${p.name} (${p.sku}) - Stock: ${p.quantity}</option>
            `).join('')}
        `;
    } catch (error) {
        console.error('Failed to load products for select:', error);
    }
}

async function loadTransactions() {
    const tbody = document.getElementById('transactionsTableBody');
    if (!tbody) return;

    try {
        const transactions = await api.getTransactions(); // Now returns only user's transactions
        
        if (!transactions || transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No transactions found</td></tr>';
            return;
        }

        tbody.innerHTML = transactions.slice(0, 50).map(transaction => `
            <tr>
                <td>${transaction.id}</td>
                <td>${transaction.productName || transaction.product_name || transaction.productId}</td>
                <td><span class="status-badge ${transaction.type === 'in' ? 'in-stock' : 'out-of-stock'}">
                    ${transaction.type === 'in' ? '📥 Stock In' : '📤 Stock Out'}
                </span></td>
                <td>${transaction.quantity}</td>
                <td>${new Date(transaction.timestamp).toLocaleString()}</td>
                <td>${transaction.note || '-'}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to load transactions:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Failed to load transactions</td></tr>';
    }
}

function setupTransactionForm() {
    const form = document.getElementById('transactionForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const productId = parseInt(document.getElementById('transactionProduct').value);
        const type = document.getElementById('transactionType').value;
        const quantity = parseInt(document.getElementById('transactionQuantity').value);
        const note = document.getElementById('transactionNote').value || '';

        if (!productId || !quantity) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            await api.createTransaction({ productId, type, quantity, note });
            showToast('Transaction recorded successfully!', 'success');
            form.reset();
            document.getElementById('transactionProduct').value = '';
            loadTransactions();
            loadProductsForSelect();
        } catch (error) {
            showToast(error.message || 'Failed to record transaction', 'error');
        }
    });
}