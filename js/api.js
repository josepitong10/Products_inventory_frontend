// API Client with Mock Data Support
class ApiClient {
    constructor() {
        this.baseURL = 'https://product-inventory-backend-o0en.onrender.com';
        this.token = localStorage.getItem('token');
        this.useMock = false; // Set to true for testing without backend
        this.mockData = this.initializeMockData();
    }

    initializeMockData() {
        return {
            products: [
                { id: 1, name: 'Laptop Pro', sku: 'LP-001', category: 'Electronics', price: 1299.99, quantity: 15, supplier: 'Tech Supply Co.', lowStockThreshold: 5 },
                { id: 2, name: 'Wireless Mouse', sku: 'WM-002', category: 'Accessories', price: 29.99, quantity: 45, supplier: 'Office Mart', lowStockThreshold: 10 },
            ],
            suppliers: [
                { id: 1, name: 'Tech Supply Co.', contactPerson: 'John Smith', email: 'john@techsupply.com', phone: '+1 555-0101', address: '123 Tech St, Silicon Valley, CA' },
            ],
            transactions: [
                { id: 1, productId: 1, productName: 'Laptop Pro', type: 'in', quantity: 10, timestamp: Date.now() - 3600000, note: 'Restock order #1234' },
            ],
            users: [
                { id: 1, fullname: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin' },
            ]
        };
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async request(endpoint, options = {}) {
        // If using mock data, handle locally
        if (this.useMock) {
            return this.handleMockRequest(endpoint, options);
        }

        // Real API request
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                // Better error handling
                const errorMessage = data.message || data.error || 'API request failed';
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Mock request handler for testing
    async handleMockRequest(endpoint, options) {
        await new Promise(resolve => setTimeout(resolve, 300));

        const method = options.method || 'GET';
        const body = options.body ? JSON.parse(options.body) : null;

        // Auth endpoints
        if (endpoint === '/auth/login') {
            const user = this.mockData.users.find(u => u.email === body.email && u.password === body.password);
            if (user) {
                return {
                    success: true,
                    message: 'Login successful',
                    data: { id: user.id, fullname: user.fullname, email: user.email, role: user.role || 'user' }
                };
            }
            throw new Error('Invalid email or password');
        }

        if (endpoint === '/auth/register') {
            const existingUser = this.mockData.users.find(u => u.email === body.email);
            if (existingUser) {
                throw new Error('User already exists');
            }
            
            const newUser = {
                id: this.mockData.users.length + 1,
                fullname: body.fullname || body.name || 'User',
                email: body.email,
                password: body.password,
                role: 'user'
            };
            
            this.mockData.users.push(newUser);
            return { 
                success: true,
                message: 'User registered successfully', 
                data: { id: newUser.id, fullname: newUser.fullname, email: newUser.email, role: newUser.role }
            };
        }

        // Products endpoints
        if (endpoint === '/products') {
            if (method === 'GET') {
                return { success: true, data: this.mockData.products };
            }
            if (method === 'POST') {
                const newProduct = {
                    id: this.mockData.products.length + 1,
                    ...body,
                    quantity: parseInt(body.quantity) || 0,
                    price: parseFloat(body.price) || 0,
                };
                this.mockData.products.push(newProduct);
                return { success: true, data: newProduct };
            }
        }

        if (endpoint.startsWith('/products/')) {
            const id = parseInt(endpoint.split('/')[2]);
            const productIndex = this.mockData.products.findIndex(p => p.id === id);
            
            if (productIndex === -1) {
                throw new Error('Product not found');
            }

            if (method === 'GET') {
                return { success: true, data: this.mockData.products[productIndex] };
            }
            if (method === 'PUT') {
                this.mockData.products[productIndex] = { ...this.mockData.products[productIndex], ...body };
                return { success: true, data: this.mockData.products[productIndex] };
            }
            if (method === 'DELETE') {
                this.mockData.products.splice(productIndex, 1);
                return { success: true, message: 'Product deleted successfully' };
            }
        }

        // Suppliers endpoints
        if (endpoint === '/suppliers') {
            if (method === 'GET') {
                return { success: true, data: this.mockData.suppliers };
            }
            if (method === 'POST') {
                const newSupplier = {
                    id: this.mockData.suppliers.length + 1,
                    ...body
                };
                this.mockData.suppliers.push(newSupplier);
                return { success: true, data: newSupplier };
            }
        }

        if (endpoint.startsWith('/suppliers/')) {
            const id = parseInt(endpoint.split('/')[2]);
            const supplierIndex = this.mockData.suppliers.findIndex(s => s.id === id);
            
            if (supplierIndex === -1) {
                throw new Error('Supplier not found');
            }

            if (method === 'GET') {
                return { success: true, data: this.mockData.suppliers[supplierIndex] };
            }
            if (method === 'PUT') {
                this.mockData.suppliers[supplierIndex] = { ...this.mockData.suppliers[supplierIndex], ...body };
                return { success: true, data: this.mockData.suppliers[supplierIndex] };
            }
            if (method === 'DELETE') {
                this.mockData.suppliers.splice(supplierIndex, 1);
                return { success: true, message: 'Supplier deleted successfully' };
            }
        }

        // Transactions endpoints
        if (endpoint === '/transactions') {
            if (method === 'GET') {
                return { success: true, data: this.mockData.transactions };
            }
            if (method === 'POST') {
                const product = this.mockData.products.find(p => p.id === body.productId);
                if (!product) {
                    throw new Error('Product not found');
                }

                const transaction = {
                    id: this.mockData.transactions.length + 1,
                    productId: body.productId,
                    productName: product.name,
                    type: body.type,
                    quantity: parseInt(body.quantity),
                    timestamp: Date.now(),
                    note: body.note || ''
                };

                // Update product quantity
                if (body.type === 'in') {
                    product.quantity += parseInt(body.quantity);
                } else {
                    product.quantity -= parseInt(body.quantity);
                }

                this.mockData.transactions.unshift(transaction);
                return { success: true, data: transaction };
            }
        }

        // Dashboard stats
        if (endpoint === '/dashboard/stats') {
            const totalProducts = this.mockData.products.length;
            const lowStockItems = this.mockData.products.filter(p => p.quantity <= p.lowStockThreshold).length;
            const totalSuppliers = this.mockData.suppliers.length;
            const totalTransactions = this.mockData.transactions.length;

            return {
                success: true,
                data: {
                    totalProducts,
                    lowStockItems,
                    totalSuppliers,
                    totalTransactions
                }
            };
        }

        // Reports
        if (endpoint === '/reports/low-stock') {
            const items = this.mockData.products.filter(p => p.quantity <= p.lowStockThreshold);
            return { success: true, data: items };
        }

        if (endpoint === '/reports/recent') {
            const reports = this.mockData.transactions.slice(0, 5).map(t => ({
                id: t.id,
                title: `${t.type === 'in' ? 'Stock In' : 'Stock Out'}: ${t.productName}`,
                description: `Quantity: ${t.quantity} ${t.note ? '- ' + t.note : ''}`,
                timestamp: t.timestamp,
                totalItems: t.quantity,
                icon: t.type === 'in' ? '📥' : '📤'
            }));
            return { success: true, data: reports };
        }

        // Default response for unknown endpoints
        throw new Error(`Route ${endpoint} not found`);
    }

    // Auth methods
 // In api.js - Update the login method
async login(email, password) {
    try {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        
        console.log('Login API response:', data);
        
        if (data && data.success === true) {
            // Get the token from the response - try different field names
            const token = data.token || data.accessToken || data.access_token || data.jwt || data.data?.token;
            
            if (!token) {
                console.warn('No token received from backend. Check your backend response structure.');
                // Continue anyway but log warning
            }
            
            // Store the token
            this.token = token || 'no-token-found';
            if (token) {
                localStorage.setItem('token', token);
            }
            
            // Get user data
            const userData = data.data || data.user || {};
            
            const userToStore = {
                id: userData.id || userData.userId || Date.now(),
                email: userData.email || email,
                fullname: userData.fullname || userData.name || userData.fullName || 'User',
                role: userData.role || userData.userRole || 'user'
            };
            
            localStorage.setItem('user', JSON.stringify(userToStore));
            localStorage.setItem('userRole', userToStore.role);
            
            return {
                success: true,
                token: token,
                user: userToStore,
                role: userToStore.role
            };
        } else {
            throw new Error(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login API error:', error);
        throw error;
    }
}

    async register(userData) {
        try {
            // Prepare registration data - try different field patterns
            const registerPayload = {
                fullname: userData.fullname || userData.name,
                email: userData.email,
                password: userData.password
            };
            
            const data = await this.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(registerPayload),
            });
            
            console.log('Register API response:', data);
            
            // Handle response
            if (data && data.success === true) {
                return {
                    success: true,
                    message: data.message || 'Registration successful',
                    user: data.data || data.user || {}
                };
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Register API error:', error);
            throw error;
        }
    }

    async logout() {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        localStorage.removeItem('loginTime');
    }

    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    getUserRole() {
        return localStorage.getItem('userRole') || 'user';
    }

    isLoggedIn() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        return token !== null && token !== undefined && token !== 'null' && user !== null;
    }

    // Products
    async getProducts() {
        const response = await this.request('/products');
        return response.data || response.products || [];
    }

    async getProduct(id) {
        const response = await this.request(`/products/${id}`);
        return response.data || response;
    }

    async createProduct(product) {
        const response = await this.request('/products', {
            method: 'POST',
            body: JSON.stringify(product),
        });
        return response.data || response;
    }

    async updateProduct(id, product) {
        const response = await this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(product),
        });
        return response.data || response;
    }

    async deleteProduct(id) {
        const response = await this.request(`/products/${id}`, {
            method: 'DELETE',
        });
        return response;
    }

    // Suppliers
    async getSuppliers() {
        const response = await this.request('/suppliers');
        return response.data || response.suppliers || [];
    }

    async getSupplier(id) {
        const response = await this.request(`/suppliers/${id}`);
        return response.data || response;
    }

    async createSupplier(supplier) {
        const response = await this.request('/suppliers', {
            method: 'POST',
            body: JSON.stringify(supplier),
        });
        return response.data || response;
    }

    async updateSupplier(id, supplier) {
        const response = await this.request(`/suppliers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(supplier),
        });
        return response.data || response;
    }

    async deleteSupplier(id) {
        const response = await this.request(`/suppliers/${id}`, {
            method: 'DELETE',
        });
        return response;
    }

    // Inventory
    async getTransactions() {
        const response = await this.request('/transactions');
        return response.data || response.transactions || [];
    }

    async getTransaction(id) {
        const response = await this.request(`/transactions/${id}`);
        return response.data || response;
    }

    async createTransaction(transaction) {
        const response = await this.request('/transactions', {
            method: 'POST',
            body: JSON.stringify(transaction),
        });
        return response.data || response;
    }

    // Dashboard
    async getDashboardStats() {
        const response = await this.request('/dashboard/stats');
        return response.data || response;
    }

    // Reports
    async getLowStockItems() {
        const response = await this.request('/reports/low-stock');
        return response.data || response.items || [];
    }

    async getRecentReports() {
        const response = await this.request('/reports/recent');
        return response.data || response.reports || [];
    }
}

// Create global instance
const api = new ApiClient();