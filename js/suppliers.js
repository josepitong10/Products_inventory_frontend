// suppliers.js - Updated with user-specific data
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initAuthenticatedPage === 'function' && !initAuthenticatedPage()) return;
    loadSuppliers();
    setupSupplierModal();
    setupSearchFilter();
});

let currentSuppliers = [];

async function loadSuppliers() {
    const tbody = document.getElementById('suppliersTableBody');
    if (!tbody) return;

    try {
        const data = await api.getSuppliers(); // Now returns only user's suppliers
        currentSuppliers = Array.isArray(data) ? data : [];
        
        if (currentSuppliers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No suppliers found</td></tr>';
            return;
        }

        tbody.innerHTML = currentSuppliers.map(supplier => `
            <tr>
                <td>${supplier.id}</td>
                <td><strong>${supplier.name}</strong></td>
                <td>${supplier.contactPerson || supplier.contact_person || '-'}</td>
                <td><a href="mailto:${supplier.email}">${supplier.email}</a></td>
                <td>${supplier.phone || '-'}</td>
                <td>${supplier.address || '-'}</td>
                <td class="action-buttons">
                    <button onclick="editSupplier(${supplier.id})" class="btn btn-outline btn-small">✏️</button>
                    <button onclick="deleteSupplier(${supplier.id})" class="btn btn-danger btn-small">🗑️</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to load suppliers:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Failed to load suppliers</td></tr>';
    }
}

// ... rest of the functions remain the same but use api methods that now include userId

function setupSupplierModal() {
    const modal = document.getElementById('supplierModal');
    const addBtn = document.getElementById('addSupplierBtn');
    const closeBtns = document.querySelectorAll('.modal-close');
    const form = document.getElementById('supplierForm');

    if (!modal || !addBtn) return;

    addBtn.addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Add Supplier';
        form.reset();
        document.getElementById('supplierId').value = '';
        modal.classList.add('active');
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('supplierId').value;
        const supplierData = {
            name: document.getElementById('supplierName').value,
            contactPerson: document.getElementById('supplierContact').value,
            email: document.getElementById('supplierEmail').value,
            phone: document.getElementById('supplierPhone').value,
            address: document.getElementById('supplierAddress').value,
        };

        try {
            if (id) {
                await api.updateSupplier(id, supplierData);
                showToast('Supplier updated successfully!', 'success');
            } else {
                await api.createSupplier(supplierData);
                showToast('Supplier created successfully!', 'success');
            }
            modal.classList.remove('active');
            loadSuppliers();
        } catch (error) {
            showToast(error.message || 'Failed to save supplier', 'error');
        }
    });
}

function setupSearchFilter() {
    const searchInput = document.getElementById('searchSupplier');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#suppliersTableBody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    });
}

// Global functions
window.editSupplier = async function(id) {
    try {
        const supplier = await api.getSupplier(id);
        if (!supplier) {
            showToast('Supplier not found', 'error');
            return;
        }

        const modal = document.getElementById('supplierModal');
        document.getElementById('modalTitle').textContent = 'Edit Supplier';
        document.getElementById('supplierId').value = supplier.id;
        document.getElementById('supplierName').value = supplier.name;
        document.getElementById('supplierContact').value = supplier.contactPerson || supplier.contact_person || '';
        document.getElementById('supplierEmail').value = supplier.email;
        document.getElementById('supplierPhone').value = supplier.phone || '';
        document.getElementById('supplierAddress').value = supplier.address || '';
        
        modal.classList.add('active');
    } catch (error) {
        showToast('Failed to load supplier data', 'error');
    }
};

window.deleteSupplier = async function(id) {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    
    try {
        await api.deleteSupplier(id);
        showToast('Supplier deleted successfully', 'success');
        loadSuppliers();
    } catch (error) {
        showToast('Failed to delete supplier', 'error');
    }
};