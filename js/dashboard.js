// Dashboard Logic
document.addEventListener('DOMContentLoaded', async () => {
    // Iniciar animación de entrada
    Animations.pageEnter();
    
    try {
        // Cargar métricas
        await loadMetrics();
        
        // Cargar productos con stock bajo
        await loadLowStockProducts();
        
        // Cargar movimientos recientes
        await loadRecentMovements();
        
    } catch (error) {
        console.error('Error al cargar dashboard:', error);
        showError('Error al cargar los datos del dashboard');
    }
});

// Cargar métricas principales
async function loadMetrics() {
    const container = document.getElementById('metricsContainer');
    
    try {
        const metrics = await window.db.getDashboardMetrics();
        
        container.innerHTML = `
            <div class="metric-card">
                <div class="metric-value" data-value="${metrics.totalProducts}">0</div>
                <div class="metric-label">Total Productos</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value" data-value="${metrics.totalStock}">0</div>
                <div class="metric-label">Piezas en Stock</div>
            </div>
            
            <div class="metric-card accent">
                <div class="metric-value">$<span data-value="${metrics.totalValue}">0</span></div>
                <div class="metric-label">Valor del Inventario</div>
            </div>
            
            <div class="metric-card ${metrics.lowStockCount > 0 ? 'accent' : ''}">
                <div class="metric-value" data-value="${metrics.lowStockCount}">0</div>
                <div class="metric-label">
                    <ion-icon name="warning-outline" style="vertical-align: middle;"></ion-icon>
                    Stock Bajo
                </div>
            </div>
        `;
        
        // Animar números
        setTimeout(() => {
            document.querySelectorAll('[data-value]').forEach(el => {
                const value = parseFloat(el.getAttribute('data-value'));
                Animations.counterUp(el, value);
            });
        }, 200);
        
        Animations.cardsEnter('.metric-card');
        
    } catch (error) {
        container.innerHTML = `
            <div class="alert alert-danger" style="grid-column: 1 / -1;">
                <ion-icon name="alert-circle-outline"></ion-icon>
                <span>Error al cargar métricas</span>
            </div>
        `;
        throw error;
    }
}

// Cargar productos con stock bajo
async function loadLowStockProducts() {
    const container = document.getElementById('lowStockContainer');
    
    try {
        const lowStockItems = await window.db.getLowStockProducts();
        
        if (lowStockItems.length === 0) {
            container.innerHTML = `
                <div class="alert alert-success">
                    <ion-icon name="checkmark-circle-outline"></ion-icon>
                    <span>¡Excelente! No hay productos con stock bajo</span>
                </div>
            `;
            return;
        }
        
        let html = '<div class="table-container"><table><thead><tr>';
        html += '<th>Producto</th>';
        html += '<th>Tipo</th>';
        html += '<th>Talla</th>';
        html += '<th>Stock Actual</th>';
        html += '<th>Stock Mínimo</th>';
        html += '<th>Estado</th>';
        html += '</tr></thead><tbody>';
        
        lowStockItems.forEach(item => {
            const stockPercentage = (item.stock / item.min_stock) * 100;
            let badge = 'badge-danger';
            let status = 'Crítico';
            
            if (stockPercentage >= 50) {
                badge = 'badge-warning';
                status = 'Bajo';
            }
            
            html += `<tr>`;
            html += `<td><strong>${item.products.name}</strong></td>`;
            html += `<td>${item.products.product_types?.name || 'N/A'}</td>`;
            html += `<td><span class="badge badge-info">${item.size}</span></td>`;
            html += `<td>${item.stock}</td>`;
            html += `<td>${item.min_stock}</td>`;
            html += `<td><span class="badge ${badge}">${status}</span></td>`;
            html += `</tr>`;
        });
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
        
        Animations.tableRowsEnter('#lowStockContainer tbody tr');
        
    } catch (error) {
        container.innerHTML = `
            <div class="alert alert-danger">
                <ion-icon name="alert-circle-outline"></ion-icon>
                <span>Error al cargar productos con stock bajo</span>
            </div>
        `;
        throw error;
    }
}

// Cargar movimientos recientes
async function loadRecentMovements() {
    const container = document.getElementById('recentMovementsContainer');
    
    try {
        // Obtener últimas 5 entradas y 5 salidas
        const [entries, exits] = await Promise.all([
            window.db.getEntries(),
            window.db.getExits()
        ]);
        
        // Combinar y ordenar por fecha
        const allMovements = [
            ...entries.slice(0, 5).map(e => ({ ...e, type: 'entry' })),
            ...exits.slice(0, 5).map(e => ({ ...e, type: 'exit' }))
        ].sort((a, b) => {
            const dateA = new Date(a.entry_date || a.exit_date);
            const dateB = new Date(b.entry_date || b.exit_date);
            return dateB - dateA;
        }).slice(0, 10);
        
        if (allMovements.length === 0) {
            container.innerHTML = `
                <p style="text-align: center; color: #64748b; padding: 2rem;">
                    No hay movimientos registrados
                </p>
            `;
            return;
        }
        
        let html = '<div class="table-container"><table><thead><tr>';
        html += '<th>Fecha</th>';
        html += '<th>Tipo</th>';
        html += '<th>Producto</th>';
        html += '<th>Talla</th>';
        html += '<th>Cantidad</th>';
        html += '</tr></thead><tbody>';
        
        allMovements.forEach(movement => {
            const date = new Date(movement.entry_date || movement.exit_date);
            const formattedDate = date.toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const typeIcon = movement.type === 'entry' 
                ? '<ion-icon name="arrow-down-circle" style="color: var(--success);"></ion-icon>' 
                : '<ion-icon name="arrow-up-circle" style="color: var(--accent-600);"></ion-icon>';
            
            const typeText = movement.type === 'entry' ? 'Entrada' : 'Salida';
            const typeBadge = movement.type === 'entry' ? 'badge-success' : 'badge-danger';
            
            html += `<tr>`;
            html += `<td>${formattedDate}</td>`;
            html += `<td><span class="badge ${typeBadge}">${typeIcon} ${typeText}</span></td>`;
            html += `<td>${movement.products.name}</td>`;
            html += `<td><span class="badge badge-info">${movement.size}</span></td>`;
            html += `<td><strong>${movement.quantity}</strong></td>`;
            html += `</tr>`;
        });
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
        
        Animations.tableRowsEnter('#recentMovementsContainer tbody tr');
        
    } catch (error) {
        container.innerHTML = `
            <div class="alert alert-danger">
                <ion-icon name="alert-circle-outline"></ion-icon>
                <span>Error al cargar movimientos recientes</span>
            </div>
        `;
        throw error;
    }
}

// Mostrar error
function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger';
    alert.style.position = 'fixed';
    alert.style.top = '2rem';
    alert.style.right = '2rem';
    alert.style.zIndex = '3000';
    alert.innerHTML = `
        <ion-icon name="alert-circle-outline"></ion-icon>
        <span>${message}</span>
    `;
    
    document.body.appendChild(alert);
    
    Animations.alertEnter(alert);
    
    setTimeout(() => {
        Animations.fadeOut(alert, 300, () => {
            alert.remove();
        });
    }, 4000);
}
