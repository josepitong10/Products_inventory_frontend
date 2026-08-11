// Product Management Logic
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!api.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    loadProducts();
    setupProductModal();
    setupSearchFilter();
    setupRefreshButton();
});

let currentProducts = [];

async function loadProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    try {
        const data = await api.getProducts();
        currentProducts = Array.isArray(data) ? data : [];
        
        if (currentProducts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No products found</td></tr>';
            return;
        }

        tbody.innerHTML = currentProducts.map(product => `
            <tr>
                <td>${product.id}</td>
                <td><strong>${product.name}</strong></td>
                <td>${product.sku}</td>
                <td>${product.category || '-'}</td>
                <td>$${parseFloat(product.price).toFixed(2)}</td>
                <td>
                    <span class="status-badge ${getStockStatus(product.quantity, product.lowStockThreshold)}">
                        ${product.quantity}
                    </span>
                </td>
                <td>${product.supplier || '-'}</td>
                <td class="action-buttons">
                    <button onclick="editProduct(${product.id})" class="btn btn-outline btn-small">✏️</button>
                    <button onclick="deleteProduct(${product.id})" class="btn btn-danger btn-small">🗑️</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to load products:', error);
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Failed to load products</td></tr>';
    }
}

function getStockStatus(quantity, threshold = 5) {
    if (quantity <= 0) return 'out-of-stock';
    if (quantity <= threshold) return 'low-stock';
    return 'in-stock';
}

function setupProductModal() {
    const modal = document.getElementById('productModal');
    const addBtn = document.getElementById('addProductBtn');
    const closeBtns = document.querySelectorAll('.modal-close');
    const form = document.getElementById('productForm');

    if (!modal || !addBtn) return;

    // Open modal for adding
    addBtn.addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Add Product';
        form.reset();
        document.getElementById('productId').value = '';
        modal.classList.add('active');
    });

    // Close modal
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Handle form submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('productId').value;
        const productData = {
            name: document.getElementById('productName').value,
            sku: document.getElementById('productSku').value,
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            quantity: parseInt(document.getElementById('productStock').value),
            supplier: document.getElementById('productSupplier').value,
            lowStockThreshold: parseInt(document.getElementById('productLowStock').value) || 5,
        };

        try {
            if (id) {
                await api.updateProduct(id, productData);
                showToast('Product updated successfully!', 'success');
            } else {
                await api.createProduct(productData);
                showToast('Product created successfully!', 'success');
            }
            modal.classList.remove('active');
            loadProducts();
        } catch (error) {
            showToast(error.message || 'Failed to save product', 'error');
        }
    });
}

function setupSearchFilter() {
    const searchInput = document.getElementById('searchProduct');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#productsTableBody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    });
}

function setupRefreshButton() {
    const refreshBtn = document.getElementById('refreshProducts');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadProducts();
            showToast('Refreshed!', 'info');
        });
    }
}

// Global functions for inline actions
window.editProduct = async function(id) {
    try {
        const product = await api.getProduct(id);
        if (!product) {
            showToast('Product not found', 'error');
            return;
        }

        const modal = document.getElementById('productModal');
        document.getElementById('modalTitle').textContent = 'Edit Product';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productSku').value = product.sku;
        document.getElementById('productCategory').value = product.category || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.quantity;
        document.getElementById('productSupplier').value = product.supplier || '';
        document.getElementById('productLowStock').value = product.lowStockThreshold || 5;
        
        modal.classList.add('active');
    } catch (error) {
        showToast('Failed to load product data', 'error');
    }
};

window.deleteProduct = async function(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        await api.deleteProduct(id);
        showToast('Product deleted successfully', 'success');
        loadProducts();
    } catch (error) {
        showToast('Failed to delete product', 'error');
    }
};