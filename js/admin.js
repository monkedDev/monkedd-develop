/**
 * monkedDev Admin Panel
 * Заявки приходят через Web3Forms на почту monkeddev@inbox.ru
 * Это демонстрационная версия - показывает пример управления
 */

// ========================================
// Constants & State
// ========================================

const STORAGE_KEY = 'monkeddev_admin_token';
const ORDERS_KEY = 'monkeddev_orders_demo';

// Демо-заявки для примера
const DEMO_ORDERS = [
    {
        id: '1709901234567',
        name: 'Иван Петров',
        contact: 'ivan@example.com',
        type: 'Лендинг',
        budget: '10-20k',
        message: 'Нужен лендинг для компании по ремонту квартир',
        status: 'new',
        createdAt: '2025-03-09T10:30:00.000Z',
    },
    {
        id: '1709901234568',
        name: 'Анна Смирнова',
        contact: '@annas',
        type: 'Интернет-магазин',
        budget: '40-60k',
        message: 'Хочу магазин одежды с интеграцией 1С',
        status: 'in_progress',
        createdAt: '2025-03-08T14:20:00.000Z',
    },
    {
        id: '1709901234569',
        name: 'Дмитрий Козлов',
        contact: '+7 999 123-45-67',
        type: 'Telegram-бот',
        budget: '20-40k',
        message: 'Бот для доставки еды с оплатой',
        status: 'completed',
        createdAt: '2025-03-07T09:15:00.000Z',
    },
];

let allOrders = [];
let currentView = 'dashboard';

// ========================================
// DOM Elements
// ========================================

const loginScreen = document.getElementById('adminLogin');
const dashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const sidebarLinks = document.querySelectorAll('.admin-sidebar__link');
const viewLinks = document.querySelectorAll('[data-view]');
const refreshBtn = document.getElementById('refreshBtn');
const exportBtn = document.getElementById('exportBtn');

// ========================================
// Authentication (Simple Client-Side)
// ========================================

const ADMIN_PASSWORD = 'monkeddev2025';

function checkAuth() {
    const token = localStorage.getItem(STORAGE_KEY);
    if (token === ADMIN_PASSWORD) {
        showDashboard();
    } else {
        showLogin();
    }
}

function showLogin() {
    loginScreen.classList.remove('hidden');
    dashboard.classList.add('hidden');
}

function showDashboard() {
    loginScreen.classList.add('hidden');
    dashboard.classList.remove('hidden');
    loadOrders();
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem(STORAGE_KEY, password);
        showDashboard();
    } else {
        alert('Неверный пароль!');
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    showLogin();
});

// ========================================
// Orders Management
// ========================================

function loadOrders() {
    // Загружаем из localStorage или используем демо
    const stored = localStorage.getItem(ORDERS_KEY);
    
    if (stored) {
        allOrders = JSON.parse(stored);
    } else {
        // Первые загружаем демо
        allOrders = DEMO_ORDERS;
        saveOrders();
    }
    
    updateStats();
    renderRecentOrders();
}

function saveOrders() {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(allOrders));
}

function addOrder(orderData) {
    const order = {
        id: Date.now().toString(),
        ...orderData,
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    
    allOrders.unshift(order);
    saveOrders();
    return order;
}

function updateOrderStatus(id, status) {
    const order = allOrders.find(o => o.id === id);
    if (order) {
        order.status = status;
        order.updatedAt = new Date().toISOString();
        saveOrders();
    }
}

function deleteOrder(id) {
    allOrders = allOrders.filter(o => o.id !== id);
    saveOrders();
}

// ========================================
// Navigation
// ========================================

sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const view = link.dataset.view;
        if (view) {
            switchView(view);
        }
    });
});

viewLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.dataset.view;
        if (view) {
            switchView(view);
        }
    });
});

function switchView(view) {
    currentView = view;
    
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.view === view) {
            link.classList.add('active');
        }
    });
    
    document.querySelectorAll('.admin-view').forEach(v => {
        v.classList.remove('active');
    });
    document.getElementById(`view-${view}`).classList.add('active');
    
    const titles = {
        dashboard: 'Дашборд',
        orders: 'Заявки',
        analytics: 'Аналитика',
        settings: 'Настройки',
    };
    document.getElementById('pageTitle').textContent = titles[view] || 'Дашборд';
    
    if (view === 'orders') {
        renderAllOrders();
    } else if (view === 'dashboard') {
        loadOrders();
    } else if (view === 'analytics') {
        renderAnalytics();
    }
}

// ========================================
// Stats
// ========================================

function updateStats() {
    const total = allOrders.length;
    const newCount = allOrders.filter(o => o.status === 'new').length;
    const inProgress = allOrders.filter(o => o.status === 'in_progress').length;
    const completed = allOrders.filter(o => o.status === 'completed').length;

    document.getElementById('totalOrders').textContent = total;
    document.getElementById('newOrders').textContent = newCount;
    document.getElementById('inProgressOrders').textContent = inProgress;
    document.getElementById('completedOrders').textContent = completed;
    document.getElementById('newOrdersBadge').textContent = newCount;
}

// ========================================
// Render Tables
// ========================================

function renderRecentOrders() {
    const tbody = document.getElementById('recentOrdersTable');
    const recent = allOrders.slice(0, 5);
    
    if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="admin-table__empty">Нет заявок</td></tr>';
        return;
    }
    
    tbody.innerHTML = recent.map(order => `
        <tr>
            <td>#${order.id.slice(-6)}</td>
            <td>${escapeHtml(order.name)}</td>
            <td>${escapeHtml(order.contact)}</td>
            <td>${escapeHtml(order.type || '—')}</td>
            <td>${escapeHtml(order.budget || '—')}</td>
            <td>${renderStatus(order.status)}</td>
            <td>${formatDate(order.createdAt)}</td>
        </tr>
    `).join('');
}

function renderAllOrders() {
    const tbody = document.getElementById('allOrdersTable');
    const statusFilter = document.getElementById('statusFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    let filtered = allOrders;
    
    if (statusFilter !== 'all') {
        filtered = filtered.filter(o => o.status === statusFilter);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(o => 
            o.name.toLowerCase().includes(searchTerm) ||
            o.contact.toLowerCase().includes(searchTerm) ||
            o.message.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="admin-table__empty">Нет заявок</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(order => `
        <tr>
            <td>#${order.id.slice(-6)}</td>
            <td>${escapeHtml(order.name)}</td>
            <td>${escapeHtml(order.contact)}</td>
            <td>${escapeHtml(order.type || '—')}</td>
            <td>${escapeHtml(order.budget || '—')}</td>
            <td><small>${escapeHtml(order.message?.substring(0, 30) || '—')}...</small></td>
            <td>${renderStatus(order.status)}</td>
            <td>${formatDate(order.createdAt)}</td>
            <td>
                <button class="admin-btn-sm" onclick="viewOrder('${order.id}')">👁️</button>
                <button class="admin-btn-sm" onclick="deleteOrderById('${order.id}')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// ========================================
// Helpers
// ========================================

function renderStatus(status) {
    const statuses = {
        new: { label: 'Новая', class: 'admin-status--new' },
        in_progress: { label: 'В работе', class: 'admin-status--in_progress' },
        completed: { label: 'Завершена', class: 'admin-status--completed' },
        cancelled: { label: 'Отменена', class: 'admin-status--cancelled' },
    };
    
    const s = statuses[status] || statuses.new;
    return `<span class="admin-status ${s.class}">${s.label}</span>`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function escapeHtml(text) {
    if (!text) return '—';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// Modal Actions
// ========================================

window.viewOrder = function(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const modal = document.getElementById('orderModal');
    const body = document.getElementById('orderModalBody');
    
    body.innerHTML = `
        <h2 style="margin-bottom: 20px;">Заявка #${order.id.slice(-6)}</h2>
        <div style="display: grid; gap: 15px;">
            <div><strong>Имя:</strong> ${escapeHtml(order.name)}</div>
            <div><strong>Контакт:</strong> ${escapeHtml(order.contact)}</div>
            <div><strong>Тип проекта:</strong> ${escapeHtml(order.type || 'Не указан')}</div>
            <div><strong>Бюджет:</strong> ${escapeHtml(order.budget || 'Не указан')}</div>
            <div>
                <strong>Сообщение:</strong>
                <p style="background: #F5F7FF; padding: 15px; border-radius: 8px; margin-top: 5px;">
                    ${escapeHtml(order.message)}
                </p>
            </div>
            <div><strong>Статус:</strong> ${renderStatus(order.status)}</div>
            <div><strong>Дата:</strong> ${formatDate(order.createdAt)}</div>
        </div>
        <div style="margin-top: 30px; display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn--primary" onclick="updateOrderStatus('${order.id}', 'new')">🆕 Новая</button>
            <button class="btn btn--outline" onclick="updateOrderStatus('${order.id}', 'in_progress')">⏳ В работу</button>
            <button class="btn btn--outline" onclick="updateOrderStatus('${order.id}', 'completed')">✅ Завершена</button>
            <button class="btn btn--outline" onclick="updateOrderStatus('${order.id}', 'cancelled')">❌ Отменена</button>
        </div>
    `;
    
    modal.classList.add('active');
};

window.updateOrderStatus = function(orderId, status) {
    updateOrderStatus(orderId, status);
    renderAllOrders();
    renderRecentOrders();
    document.getElementById('orderModal').classList.remove('active');
};

window.deleteOrderById = function(orderId) {
    if (!confirm('Удалить эту заявку?')) return;
    deleteOrder(orderId);
    renderAllOrders();
    renderRecentOrders();
};

// ========================================
// Filters & Export
// ========================================

document.getElementById('statusFilter').addEventListener('change', renderAllOrders);
document.getElementById('searchInput').addEventListener('input', renderAllOrders);

document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('orderModal').classList.remove('active');
});

document.querySelector('.admin-modal__overlay').addEventListener('click', () => {
    document.getElementById('orderModal').classList.remove('active');
});

refreshBtn.addEventListener('click', loadOrders);

exportBtn.addEventListener('click', () => {
    const csv = [
        ['ID', 'Имя', 'Контакт', 'Тип', 'Бюджет', 'Сообщение', 'Статус', 'Дата'],
        ...allOrders.map(o => [
            o.id,
            o.name,
            o.contact,
            o.type || '',
            o.budget || '',
            o.message || '',
            o.status,
            o.createdAt,
        ])
    ].map(row => row.map(cell => `"${cell || ''}"`).join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
});

// ========================================
// Analytics
// ========================================

function renderAnalytics() {
    const ordersByDay = {};
    const ordersByType = {};
    
    allOrders.forEach(order => {
        const day = order.createdAt.split('T')[0];
        ordersByDay[day] = (ordersByDay[day] || 0) + 1;
        
        const type = order.type || 'Другое';
        ordersByType[type] = (ordersByType[type] || 0) + 1;
    });
    
    document.getElementById('ordersChart').innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
            ${Object.entries(ordersByDay).slice(-7).map(([day, count]) => `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="width: 100px; font-size: 13px;">${day}</span>
                    <div style="flex: 1; height: 30px; background: #F0F4FF; border-radius: 8px; overflow: hidden;">
                        <div style="width: ${Math.min(count * 20, 100)}%; height: 100%; background: linear-gradient(90deg, #6B7FC4, #8A9FD4);"></div>
                    </div>
                    <span style="width: 30px; text-align: right; font-weight: 600;">${count}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    document.getElementById('servicesChart').innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
            ${Object.entries(ordersByType).map(([type, count]) => `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="width: 150px; font-size: 13px;">${type}</span>
                    <div style="flex: 1; height: 30px; background: #F0F4FF; border-radius: 8px; overflow: hidden;">
                        <div style="width: ${(count / Math.max(allOrders.length, 1)) * 100}%; height: 100%; background: linear-gradient(90deg, #6B7FC4, #8A9FD4);"></div>
                    </div>
                    <span style="width: 30px; text-align: right; font-weight: 600;">${count}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// ========================================
// Form Handler (для интеграции с сайтом)
// ========================================

window.submitOrderToAdmin = function(formData) {
    const orderData = Object.fromEntries(formData);
    addOrder(orderData);
    return orderData;
};

// ========================================
// Initialize
// ========================================

checkAuth();
