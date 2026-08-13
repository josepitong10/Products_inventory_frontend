// ============================================
// PRODUCTS PAGE
// ============================================

document.addEventListener('DOMContentLoaded', async () => {

    try {

        // ===============================
        // CHECK AUTHENTICATION
        // ===============================

        const token = api.getToken();
        const user = api.getCurrentUser();

        if (!token || !user || !user.id) {

            api.clearAuth();

            window.location.href = 'login.html';

            return;
        }

        console.log('Logged-in user:', user);


        // ===============================
        // LOAD DATA
        // ===============================

        await loadCategories();

        await loadSuppliers();

        await loadProducts();


        // ===============================
        // SETUP UI
        // ===============================

        setupProductModal();

        setupSearchFilter();

        setupRefreshButton();

    } catch (error) {

        console.error(
            'Products page error:',
            error
        );

        if (typeof showToast === 'function') {

            showToast(
                error.message ||
                'Unable to load products',
                'error'
            );
        }
    }
});


// ============================================
// CURRENT PRODUCTS
// ============================================

let currentProducts = [];


// ============================================
// LOAD PRODUCTS
// ============================================

async function loadProducts() {

    const tbody =
        document.getElementById(
            'productsTableBody'
        );

    if (!tbody) return;

    try {

        const products =
            await api.getProducts();

        console.log(
            'MY PRODUCTS:',
            products
        );

        currentProducts =
            Array.isArray(products)
                ? products
                : [];


        if (currentProducts.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="8"
                        class="text-center">
                        No products found
                    </td>
                </tr>
            `;

            return;
        }


        tbody.innerHTML =
            currentProducts.map(product => {

                return `
                    <tr>

                        <td>
                            ${product.id}
                        </td>

                        <td>
                            <strong>
                                ${
                                    product.product_name
                                    || '-'
                                }
                            </strong>
                        </td>

                        <td>
                            ${
                                product.description
                                || '-'
                            }
                        </td>

                        <td>
                            ${
                                product.category_name
                                || '-'
                            }
                        </td>

                        <td>
                            $${parseFloat(
                                product.price || 0
                            ).toFixed(2)}
                        </td>

                        <td>

                            <span class="status-badge ${
                                getStockStatus(
                                    product.quantity,
                                    product.minimum_stock
                                )
                            }">

                                ${
                                    product.quantity
                                    ?? 0
                                }

                            </span>

                        </td>

                        <td>
                            ${
                                product.supplier_name
                                || '-'
                            }
                        </td>

                        <td class="action-buttons">

                            <button
                                onclick="editProduct(${product.id})"
                                class="btn btn-outline btn-small">
                                ✏️
                            </button>

                            <button
                                onclick="deleteProduct(${product.id})"
                                class="btn btn-danger btn-small">
                                🗑️
                            </button>

                        </td>

                    </tr>
                `;

            }).join('');


    } catch (error) {

        console.error(
            'Failed to load products:',
            error
        );

        tbody.innerHTML = `
            <tr>
                <td colspan="8"
                    class="text-center text-danger">

                    Failed to load products

                </td>
            </tr>
        `;
    }
}


// ============================================
// LOAD USER CATEGORIES
// ============================================

async function loadCategories() {

    const select =
        document.getElementById(
            'productCategory'
        );

    if (!select) {

        console.error(
            'productCategory select not found'
        );

        return;
    }


    try {

        select.innerHTML = `
            <option value="">
                Loading categories...
            </option>
        `;


        const categories =
            await api.getCategories();


        console.log(
            'MY CATEGORIES:',
            categories
        );


        select.innerHTML = `
            <option value="">
                Select Category
            </option>
        `;


        if (
            !Array.isArray(categories) ||
            categories.length === 0
        ) {

            select.innerHTML = `
                <option value="">
                    No categories available
                </option>
            `;

            console.warn(
                'No categories found for current user'
            );

            return;
        }


        categories.forEach(category => {

            const option =
                document.createElement(
                    'option'
                );

            option.value =
                category.id;

            option.textContent =
                category.category_name;

            select.appendChild(option);

        });


    } catch (error) {

        console.error(
            'Failed to load categories:',
            error
        );

        select.innerHTML = `
            <option value="">
                Failed to load categories
            </option>
        `;
    }
}


// ============================================
// LOAD USER SUPPLIERS
// ============================================

async function loadSuppliers() {

    const select =
        document.getElementById(
            'productSupplier'
        );

    if (!select) {

        console.error(
            'productSupplier select not found'
        );

        return;
    }


    try {

        select.innerHTML = `
            <option value="">
                Loading suppliers...
            </option>
        `;


        const suppliers =
            await api.getSuppliers();


        console.log(
            'MY SUPPLIERS:',
            suppliers
        );


        select.innerHTML = `
            <option value="">
                Select Supplier
            </option>
        `;


        if (
            !Array.isArray(suppliers) ||
            suppliers.length === 0
        ) {

            select.innerHTML = `
                <option value="">
                    No suppliers available
                </option>
            `;

            console.warn(
                'No suppliers found for current user'
            );

            return;
        }


        suppliers.forEach(supplier => {

            const option =
                document.createElement(
                    'option'
                );

            option.value =
                supplier.id;

            option.textContent =
                supplier.supplier_name;

            select.appendChild(option);

        });


    } catch (error) {

        console.error(
            'Failed to load suppliers:',
            error
        );

        select.innerHTML = `
            <option value="">
                Failed to load suppliers
            </option>
        `;
    }
}


// ============================================
// STOCK STATUS
// ============================================

function getStockStatus(
    quantity,
    threshold = 5
) {

    quantity =
        Number(quantity) || 0;

    threshold =
        Number(threshold) || 5;


    if (quantity <= 0) {

        return 'out-of-stock';
    }

    if (quantity <= threshold) {

        return 'low-stock';
    }

    return 'in-stock';
}


// ============================================
// PRODUCT MODAL
// ============================================

function setupProductModal() {

    const modal =
        document.getElementById(
            'productModal'
        );

    const addBtn =
        document.getElementById(
            'addProductBtn'
        );

    const form =
        document.getElementById(
            'productForm'
        );

    const closeBtns =
        document.querySelectorAll(
            '.modal-close'
        );


    if (!modal || !addBtn || !form) {

        console.error(
            'Product modal elements missing'
        );

        return;
    }


    // ===============================
    // ADD PRODUCT
    // ===============================

    addBtn.addEventListener(
        'click',
        async () => {

            document.getElementById(
                'modalTitle'
            ).textContent =
                'Add Product';


            form.reset();


            document.getElementById(
                'productId'
            ).value = '';


            // Reload user's categories
            await loadCategories();

            // Reload user's suppliers
            await loadSuppliers();


            modal.classList.add(
                'active'
            );
        }
    );


    // ===============================
    // CLOSE
    // ===============================

    closeBtns.forEach(btn => {

        btn.addEventListener(
            'click',
            () => {

                modal.classList.remove(
                    'active'
                );

            }
        );

    });


    // ===============================
    // OUTSIDE CLICK
    // ===============================

    modal.addEventListener(
        'click',
        event => {

            if (
                event.target === modal
            ) {

                modal.classList.remove(
                    'active'
                );
            }

        }
    );


    // ===============================
    // FORM SUBMIT
    // ===============================

  form.addEventListener('submit', async event => {
    event.preventDefault();

    const id = document.getElementById('productId').value;
    const productName = document.getElementById('productName').value.trim();
    
    // Get the TEXT values (names)
    const categoryName = document.getElementById('productCategory').value.trim();
    const supplierName = document.getElementById('productSupplier').value.trim();
    
    const price = document.getElementById('productPrice').value;
    const stock = document.getElementById('productStock').value;
    const lowStock = document.getElementById('productLowStock').value;
    const description = document.getElementById('productDescription')?.value.trim() || null;

    // ===============================
    // FRONTEND VALIDATION
    // ===============================
    if (!productName) {
        showToast('Product name is required', 'error');
        return;
    }

    if (!categoryName) {
        showToast('Please enter a category', 'error');
        return;
    }

    if (!supplierName) {
        showToast('Please enter a supplier', 'error');
        return;
    }

    if (price === '') {
        showToast('Price is required', 'error');
        return;
    }

    // ===============================
    // PRODUCT DATA - SEND NAMES, NOT IDs
    // ===============================
    const productData = {
        product_name: productName,
        category_name: categoryName,    // ← Send name instead of ID
        supplier_name: supplierName,    // ← Send name instead of ID
        price: Number(price),
        quantity: Number(stock) || 0,
        minimum_stock: Number(lowStock) || 5,
        description: description
    };

    console.log('PRODUCT DATA TO API:', productData);

    try {
        if (id) {
            // For update, you might need to handle differently
            await api.updateProduct(id, productData);
            showToast('Product updated successfully!', 'success');
        } else {
            await api.createProduct(productData);
            showToast('Product created successfully!', 'success');
        }

        modal.classList.remove('active');
        await loadProducts();

    } catch (error) {
        console.error('Product save error:', error);
        showToast(error.message || 'Failed to save product', 'error');
    }
});


// ============================================
// SEARCH
// ============================================

function setupSearchFilter() {

    const searchInput =
        document.getElementById(
            'searchProduct'
        );

    if (!searchInput) return;


    searchInput.addEventListener(
        'input',
        event => {

            const query =
                event.target.value
                    .toLowerCase();


            const rows =
                document.querySelectorAll(
                    '#productsTableBody tr'
                );


            rows.forEach(row => {

                const text =
                    row.textContent
                        .toLowerCase();


                row.style.display =
                    text.includes(query)
                        ? ''
                        : 'none';

            });

        }
    );
}


// ============================================
// REFRESH
// ============================================

function setupRefreshButton() {

    const refreshBtn =
        document.getElementById(
            'refreshProducts'
        );

    if (!refreshBtn) return;


    refreshBtn.addEventListener(
        'click',
        async () => {

            await loadCategories();

            await loadSuppliers();

            await loadProducts();

            showToast(
                'Products refreshed!',
                'info'
            );

        }
    );
}


// ============================================
// EDIT PRODUCT
// ============================================

window.editProduct = async function(id) {
    try {
        const product = await api.getProduct(id);

        if (!product) {
            showToast('Product not found', 'error');
            return;
        }

        document.getElementById('modalTitle').textContent = 'Edit Product';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.product_name || '';
        
        // Set the TEXT values (names)
        document.getElementById('productCategory').value = product.category_name || '';
        document.getElementById('productSupplier').value = product.supplier_name || '';
        
        document.getElementById('productPrice').value = product.price || 0;
        document.getElementById('productStock').value = product.quantity || 0;
        document.getElementById('productLowStock').value = product.minimum_stock || 5;
        document.getElementById('productDescription').value = product.description || '';

        document.getElementById('productModal').classList.add('active');

    } catch (error) {
        console.error('Edit product error:', error);
        showToast(error.message || 'Failed to load product data', 'error');
    }
};


// ============================================
// DELETE PRODUCT
// ============================================

window.deleteProduct =
    async function(id) {

        if (
            !confirm(
                'Are you sure you want to delete this product?'
            )
        ) {

            return;
        }


        try {

            await api.deleteProduct(id);


            showToast(
                'Product deleted successfully',
                'success'
            );


            await loadProducts();


        } catch (error) {

            console.error(
                'Delete product error:',
                error
            );


            showToast(
                error.message ||
                'Failed to delete product',
                'error'
            );
        }
    };
}