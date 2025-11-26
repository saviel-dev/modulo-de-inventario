// Movements Management (Entries and Exits)
const MovementsApp = {
    products: [],
    entries: [],
    exits: [],
    currentTab: 'entries',
    selectedProduct: null,
    
    async init() {
        Animations.pageEnter();
        
        // Set current date/time as default
        this.setDefaultDateTime();
        
        // Load products for dropdowns
        await this.loadProducts();
        
        // Load movements
        await this.loadEntries();
        await this.loadExits();
    },
    
    setDefaultDateTime() {
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        
        document.getElementById('entryDate').value = localDateTime;
        document.getElementById('exitDate').value = localDateTime;
    },
    
    // ==================== TAB SWITCHING ====================
    
    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        // Update tab content
        document.getElementById('entriesTab').style.display = tab === 'entries' ? 'block' : 'none';
        document.getElementById('exitsTab').style.display = tab === 'exits' ? 'block' : 'none';
    },
    
    // ==================== PRODUCTS ====================
    
    async loadProducts() {
        try {
            this.products = await window.db.getProducts();
            
            // Populate entry dropdown
            const entrySelect = document.getElementById('entryProduct');
            entrySelect.innerHTML = '<option value="">Seleccionar producto...</option>';
            
            // Populate exit dropdown
            const exitSelect = document.getElementById('exitProduct');
            exitSelect.innerHTML = '<option value="">Seleccionar producto...</option>';
            
            this.products.forEach(product => {
                const optionEntry = document.createElement('option');
                optionEntry.value = product.id;
                optionEntry.textContent = `${product.name}${product.sku ? ' (' + product.sku + ')' : ''}`;
                entrySelect.appendChild(optionEntry);
                
                const optionExit = optionEntry.cloneNode(true);
                exitSelect.appendChild(optionExit);
            });
            
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    },
    
    loadProductSizes(type) {
        const productId = document.getElementById(`${type}Product`).value;
        const sizeSelect = document.getElementById(`${type}Size`);
        
        sizeSelect.innerHTML = '<option value="">Seleccionar talla...</option>';
        
        if (!productId) {
            this.selectedProduct = null;
            return;
        }
        
        const product = this.products.find(p => p.id === productId);
        this.selectedProduct = product;
        
        if (product && product.product_sizes) {
            product.product_sizes.forEach(size => {
                const option = document.createElement('option');
                option.value = size.size;
                option.textContent = `${size.size} (Stock: ${size.stock})`;
                option.dataset.stock = size.stock;
                sizeSelect.appendChild(option);
            });
        }
    },
    
    checkStock() {
        const sizeSelect = document.getElementById('exitSize');
        const quantityInput = document.getElementById('exitQuantity');
        const stockInfo = document.getElementById('stockInfo');
        
        const selectedOption = sizeSelect.options[sizeSelect.selectedIndex];
        const availableStock = parseInt(selectedOption?.dataset?.stock || 0);
        const requestedQty = parseInt(quantityInput.value || 0);
        
        if (selectedOption && selectedOption.value) {
            if (requestedQty > availableStock) {
                stockInfo.style.color = 'var(--danger)';
                stockInfo.textContent = `⚠️ Stock insuficiente (disponible: ${availableStock})`;
            } else {
                stockInfo.style.color = 'var(--success)';
                stockInfo.textContent = `✓ Stock disponible: ${availableStock}`;
            }
        } else {
            stockInfo.textContent = '';
        }
    },
    
    // ==================== ENTRIES ====================
    
    async loadEntries() {
        const container = document.getElementById('entriesTableContainer');
        
        try {
            this.entries = await window.db.getEntries();
            
            if (this.entries.length === 0) {
                container.innerHTML = `
                    <p style="text-align: center; color: #64748b; padding: 2rem;">
                        No hay entradas registradas
                    </p>
                `;
                return;
            }
            
            let html = '<div class="table-container"><table><thead><tr>';
            html += '<th>Fecha</th>';
            html += '<th>Producto</th>';
            html += '<th>Talla</th>';
            html += '<th>Cantidad</th>';
            html += '<th>Costo</th>';
            html += '<th>Notas</th>';
            html += '<th>Acciones</th>';
            html += '</tr></thead><tbody>';
            
            this.entries.forEach(entry => {
                const date = new Date(entry.entry_date);
                const formattedDate = date.toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                html += `<tr>`;
                html += `<td>${formattedDate}</td>`;
                html += `<td><strong>${entry.products.name}</strong><br><small style="color: #64748b;">${entry.products.sku || ''}</small></td>`;
                html += `<td><span class="badge badge-info">${entry.size}</span></td>`;
                html += `<td><strong>${entry.quantity}</strong></td>`;
                html += `<td>${entry.cost ? '$' + entry.cost.toFixed(2) : '-'}</td>`;
                html += `<td>${entry.notes || '-'}</td>`;
                html += `<td>`;
                html += `  <button class="btn btn-accent btn-sm" onclick="MovementsApp.deleteEntry('${entry.id}')" title="Eliminar">`;
                html += `    <ion-icon name="trash-outline"></ion-icon>`;
                html += `  </button>`;
                html += `</td>`;
                html += `</tr>`;
            });
            
            html += '</tbody></table></div>';
            container.innerHTML = html;
            
            Animations.tableRowsEnter('#entriesTableContainer tbody tr');
            
        } catch (error) {
            console.error('Error al cargar entradas:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <ion-icon name="alert-circle-outline"></ion-icon>
                    <span>Error al cargar entradas</span>
                </div>
            `;
        }
    },
    
    openEntryModal() {
        const modal = document.getElementById('entryModal');
        document.getElementById('entryForm').reset();
        this.setDefaultDateTime();
        modal.classList.add('active');
        Animations.modalEnter(modal);
    },
    
    closeEntryModal() {
        const modal = document.getElementById('entryModal');
        Animations.modalExit(modal, () => {
            modal.classList.remove('active');
        });
    },
    
    async deleteEntry(entryId) {
        if (!confirm('¿Eliminar esta entrada? El stock se ajustará automáticamente.')) {
            return;
        }
        
        try {
            await window.db.deleteEntry(entryId);
            this.showNotification('Entrada eliminada correctamente', 'success');
            await this.loadEntries();
        } catch (error) {
            console.error('Error al eliminar entrada:', error);
            this.showNotification('Error al eliminar la entrada', 'danger');
        }
    },
    
    // ==================== EXITS ====================
    
    async loadExits() {
        const container = document.getElementById('exitsTableContainer');
        
        try {
            this.exits = await window.db.getExits();
            
            if (this.exits.length === 0) {
                container.innerHTML = `
                    <p style="text-align: center; color: #64748b; padding: 2rem;">
                        No hay salidas registradas
                    </p>
                `;
                return;
            }
            
            let html = '<div class="table-container"><table><thead><tr>';
            html += '<th>Fecha</th>';
            html += '<th>Producto</th>';
            html += '<th>Talla</th>';
            html += '<th>Cantidad</th>';
            html += '<th>Precio Venta</th>';
            html += '<th>Notas</th>';
            html += '<th>Acciones</th>';
            html += '</tr></thead><tbody>';
            
            this.exits.forEach(exit => {
                const date = new Date(exit.exit_date);
                const formattedDate = date.toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                html += `<tr>`;
                html += `<td>${formattedDate}</td>`;
                html += `<td><strong>${exit.products.name}</strong><br><small style="color: #64748b;">${exit.products.sku || ''}</small></td>`;
                html += `<td><span class="badge badge-info">${exit.size}</span></td>`;
                html += `<td><strong>${exit.quantity}</strong></td>`;
                html += `<td>${exit.sale_price ? '$' + exit.sale_price.toFixed(2) : '-'}</td>`;
                html += `<td>${exit.notes || '-'}</td>`;
                html += `<td>`;
                html += `  <button class="btn btn-accent btn-sm" onclick="MovementsApp.deleteExit('${exit.id}')" title="Eliminar">`;
                html += `    <ion-icon name="trash-outline"></ion-icon>`;
                html += `  </button>`;
                html += `</td>`;
                html += `</tr>`;
            });
            
            html += '</tbody></table></div>';
            container.innerHTML = html;
            
            Animations.tableRowsEnter('#exitsTableContainer tbody tr');
            
        } catch (error) {
            console.error('Error al cargar salidas:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <ion-icon name="alert-circle-outline"></ion-icon>
                    <span>Error al cargar salidas</span>
                </div>
            `;
        }
    },
    
    openExitModal() {
        const modal = document.getElementById('exitModal');
        document.getElementById('exitForm').reset();
        this.setDefaultDateTime();
        document.getElementById('stockInfo').textContent = '';
        modal.classList.add('active');
        Animations.modalEnter(modal);
    },
    
    closeExitModal() {
        const modal = document.getElementById('exitModal');
        Animations.modalExit(modal, () => {
            modal.classList.remove('active');
        });
    },
    
    async deleteExit(exitId) {
        if (!confirm('¿Eliminar esta salida? El stock se ajustará automáticamente.')) {
            return;
        }
        
        try {
            await window.db.deleteExit(exitId);
            this.showNotification('Salida eliminada correctamente', 'success');
            await this.loadExits();
        } catch (error) {
            console.error('Error al eliminar salida:', error);
            this.showNotification('Error al eliminar la salida', 'danger');
        }
    },
    
    // ==================== UTILITIES ====================
    
    showNotification(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.style.position = 'fixed';
        alert.style.top = '2rem';
        alert.style.right = '2rem';
        alert.style.zIndex = '3000';
        
        const icons = {
            success: 'checkmark-circle-outline',
            danger: 'alert-circle-outline',
            warning: 'warning-outline',
            info: 'information-circle-outline'
        };
        
        alert.innerHTML = `
            <ion-icon name="${icons[type]}"></ion-icon>
            <span>${message}</span>
        `;
        
        document.body.appendChild(alert);
        Animations.alertEnter(alert);
        
        setTimeout(() => {
            Animations.fadeOut(alert, 300, () => alert.remove());
        }, 4000);
    }
};

// Form handlers
document.addEventListener('DOMContentLoaded', () => {
    MovementsApp.init();
    
    // Entry form submit
    document.getElementById('entryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const entryData = {
            product_id: document.getElementById('entryProduct').value,
            size: document.getElementById('entrySize').value,
            quantity: parseInt(document.getElementById('entryQuantity').value),
            cost: parseFloat(document.getElementById('entryCost').value) || null,
            notes: document.getElementById('entryNotes').value || null,
            entry_date: document.getElementById('entryDate').value
        };
        
        try {
            await window.db.createEntry(entryData);
            MovementsApp.showNotification('Entrada registrada correctamente', 'success');
            MovementsApp.closeEntryModal();
            await MovementsApp.loadEntries();
        } catch (error) {
            console.error('Error al crear entrada:', error);
            MovementsApp.showNotification('Error al registrar la entrada', 'danger');
        }
    });
    
    // Exit form submit
    document.getElementById('exitForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const exitData = {
            product_id: document.getElementById('exitProduct').value,
            size: document.getElementById('exitSize').value,
            quantity: parseInt(document.getElementById('exitQuantity').value),
            sale_price: parseFloat(document.getElementById('exitSalePrice').value) || null,
            notes: document.getElementById('exitNotes').value || null,
            exit_date: document.getElementById('exitDate').value
        };
        
        try {
            await window.db.createExit(exitData);
            MovementsApp.showNotification('Salida registrada correctamente', 'success');
            MovementsApp.closeExitModal();
            await MovementsApp.loadExits();
        } catch (error) {
            console.error('Error al crear salida:', error);
            
            // Check if it's a stock error
            if (error.message && error.message.includes('Stock insuficiente')) {
                MovementsApp.showNotification(error.message, 'danger');
            } else {
                MovementsApp.showNotification('Error al registrar la salida', 'danger');
            }
        }
    });
});
