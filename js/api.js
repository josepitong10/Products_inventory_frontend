// api.js - Updated version
const API_BASE_URL = 'https://product-inventory-backend-o0en.onrender.com';

const api = {
    getToken() {
        return localStorage.getItem('token');
    },

    getCurrentUser() {
        const storedUser = localStorage.getItem('currentUser') || localStorage.getItem('user');
        if (!storedUser) {
            return null;
        }
        try {
            return JSON.parse(storedUser);
        } catch (error) {
            console.error('Invalid current user data:', error);
            return null;
        }
    },

    getCurrentUserId() {
        const user = this.getCurrentUser();
        return user ? user.id : null;
    },

    isLoggedIn() {
        return !!this.getToken();
    },

    async request(endpoint, options = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        let result;
        try {
            result = await response.json();
        } catch (error) {
            throw new Error('Server returned an invalid response');
        }

        if (response.status === 401) {
            this.clearAuth();
            window.location.href = 'login.html';
            throw new Error('Authentication expired');
        }

        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }

        return result;
    },

    async login(email, password) {
        const result = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (result.success && result.data) {
            const user = result.data.user;
            const token = result.data.token;

            localStorage.setItem('token', token);
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('loginTime', Date.now().toString());
            
            // Store user-specific data key
            localStorage.setItem('currentUserId', user.id);
        }

        return result;
    },

    async register(fullname, email, password) {
        return await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ fullname, email, password })
        });
    },

    async getMe() {
        const result = await this.request('/auth/me', {
            method: 'GET'
        });

        if (result.success && result.data && result.data.user) {
            const user = result.data.user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('currentUserId', user.id);
        }

        return result;
    },

    // ========== USER-SPECIFIC ENDPOINTS ==========
    // These endpoints should include user_id filter on the backend

async getDashboardStats() {
    // ==========================================
    // CHECK AUTHENTICATION FIRST
    // ==========================================
    const token = this.getToken();
    const user = this.getCurrentUser();

    if (!token || !user || !user.id) {
        this.clearAuth();
        window.location.href = 'login.html';
        throw new Error('User not authenticated');
    }

    // ==========================================
    // REQUEST PRIVATE DASHBOARD
    // Backend gets user ID from JWT
    // ==========================================
    const result = await this.request('/inventory/dashboard', {
        method: 'GET'
    });

    if (!result.success) {
        throw new Error(
            result.message || 'Unable to load dashboard'
        );
    }

    return result.data || result;
},
    async getProducts() {
        const userId = this.getCurrentUserId();
        if (!userId) throw new Error('User not authenticated');
        
        const response = await this.request(`/products`);
        return response.data || response.products || (Array.isArray(response) ? response : []);
    },

async getProduct(id) {
    const userId = this.getCurrentUserId();

    if (!userId) {
        throw new Error('User not authenticated');
    }

    if (!id) {
        throw new Error('Product ID is required');
    }

    const response = await this.request(`/products/${id}`, {
        method: 'GET'
    });

    return response.data || response;
},
  async createProduct(product) {
    const userId = this.getCurrentUserId();

    if (!userId) {
        throw new Error('User not authenticated');
    }

    const response = await this.request('/products', {
        method: 'POST',
        body: JSON.stringify(product)
    });

    return response.data || response;
},

async updateProduct(id, product) {
    const userId = this.getCurrentUserId();

    if (!userId) {
        throw new Error('User not authenticated');
    }

    if (!id) {
        throw new Error('Product ID is required');
    }

    const response = await this.request(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(product)
    });

    return response.data || response;
},


async deleteProduct(id) {
    const userId = this.getCurrentUserId();

    if (!userId) {
        throw new Error('User not authenticated');
    }

    return await this.request(`/products/${id}`, {
        method: 'DELETE'
    });
},



    async getCategories() {
    const userId = this.getCurrentUserId();

    if (!this.isLoggedIn() || !userId) {
        this.clearAuth();
        window.location.href = 'login.html';
        throw new Error('User not authenticated');
    }

    const response = await this.request('/categories', {
        method: 'GET'
    });

    return response.data ||
           response.categories ||
           (Array.isArray(response) ? response : []);
},

async getSuppliers() {
    const userId = this.getCurrentUserId();

    if (!this.isLoggedIn() || !userId) {
        this.clearAuth();
        window.location.href = 'login.html';
        throw new Error('User not authenticated');
    }

    const response = await this.request('/suppliers', {
        method: 'GET'
    });

    return response.data ||
           response.suppliers ||
           (Array.isArray(response) ? response : []);
},

async getSupplier(id) {
    const userId = this.getCurrentUserId();

    if (!this.isLoggedIn() || !userId) {
        this.clearAuth();
        window.location.href = 'login.html';
        throw new Error('User not authenticated');
    }

    if (!id) {
        throw new Error('Supplier ID is required');
    }

    const response = await this.request(`/suppliers/${id}`, {
        method: 'GET'
    });

    return response.data || response;
},

async createSupplier(supplier) {
    const userId = this.getCurrentUserId();

    if (!userId) {
        throw new Error('User not authenticated');
    }

    const response = await this.request('/suppliers', {
        method: 'POST',
        body: JSON.stringify({
            ...supplier,
            userId
        })
    });

    return response.data || response;
},

async updateSupplier(id, supplier) {
    const userId = this.getCurrentUserId();

    if (!userId) {
        throw new Error('User not authenticated');
    }

    if (!id) {
        throw new Error('Supplier ID is required');
    }

    const response = await this.request(`/suppliers/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            ...supplier,
            userId
        })
    });

    return response.data || response;
},

async deleteSupplier(id) {
    const userId = this.getCurrentUserId();

    if (!userId) {
        throw new Error('User not authenticated');
    }

    if (!id) {
        throw new Error('Supplier ID is required');
    }

    const response = await this.request(`/suppliers/${id}`, {
        method: 'DELETE'
    });

    return response.data || response;
}, 

async getTransactions() {

    const userId = this.getCurrentUserId();

    if (!userId) {
        throw new Error('User not authenticated');
    }

    const response = await this.request('/inventory/history', {
        method: 'GET'
    });

    return response.data ||
           response.transactions ||
           (Array.isArray(response) ? response : []);
},

async createTransaction(transaction) {

    const userId = this.getCurrentUserId();

    if (!userId) {
        throw new Error('User not authenticated');
    }

    const endpoint =
        transaction.type === 'in'
            ? '/inventory/stock-in'
            : '/inventory/stock-out';

    const response = await this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify({
            product_id: transaction.productId,
            quantity: transaction.quantity,
            notes: transaction.note || ''
        })
    });

    return response.data || response;
},

  async getLowStockItems() {
    const userId = this.getCurrentUserId();

    if (!userId) {
        throw new Error('User not authenticated');
    }

    const response = await this.request('/products/low-stock', {
        method: 'GET'
    });

    return response.data ||
           response.items ||
           [];
},

async getRecentReports() {
    const userId = this.getCurrentUserId();

    if (!userId) {
        throw new Error('User not authenticated');
    }

    const response = await this.request('/products/summary', {
        method: 'GET'
    });

    return response.data || [];
},

    getUserRole() {
        const user = this.getCurrentUser();
        return (user && user.role) || localStorage.getItem('userRole') || 'user';
    },

    logout() {
        this.clearAuth();
        window.location.href = 'login.html';
    },

    clearAuth() {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        localStorage.removeItem('loginTime');
        localStorage.removeItem('currentUserId');
    }
};

function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;

    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '12px 24px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'opacity 0.3s ease',
        maxWidth: '400px',
        fontSize: '14px',
    });

    const colors = {
        success: '#22c55e',
        error: '#ef4444',
        info: '#2563eb',
        warning: '#f59e0b',
    };
    toast.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

window.api = api;
window.showToast = showToast;