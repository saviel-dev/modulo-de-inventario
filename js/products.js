// Products Management
const ProductsApp = {
    products: [],
    types: [],
    currentProduct: null,
    
    async init() {
        Animations.pageEnter();
        await this.loadTypes();
        await this.loadProducts();
    },
    
    // ==================== PRODUCTS ====================
    
    async loadProducts() {
        const container = document.getElementById('productsTableContainer');
        
        try {
            this.products = await window.db.getProducts();
            
            if (this.products.length === 0) {
                container.innerHTML = `
                    <p style="text-align: center; color: #64748b; padding: 2rem;">
                        No hay productos registrados. Crea tu primer producto.
                    </p>
                `;
                return;
            }
            
            let html = '<div class="table-container"><table><thead><tr>';
            html += '<th>Producto</th>';
            html += '<th>Tipo</th>';
            html += '<th>Tallas</th>';
            html += '<th>Stock Total</th>';
            html += '<th>Acciones</th>';
            html += '</tr></thead><tbody>';
            
            this.products.forEach(product => {
                const totalStock = product.product_sizes.reduce((sum, size) => sum + size.stock, 0);
                const sizesInfo = product.product_sizes.map(size => 
                    `<span class="badge ${size.stock < size.min_stock ? 'badge-danger' : 'badge-success'}" style="margin: 0.125rem;">${size.size}: ${size.stock}</span>`
                ).join(' ');
                
                html += `<tr>`;
                html += `<td><strong>${product.name}</strong><br><small style="color: #64748b;">${product.description || ''}</small></td>`;
                html += `<td>${product.product_types?.name || 'N/A'}</td>`;
                html += `<td style="white-space: normal;">${sizesInfo}</td>`;
                html += `<td><strong>${totalStock}</strong></td>`;
                html += `<td style="white-space: nowrap;">`;
                html += `  <button class="btn btn-secondary btn-sm" onclick="ProductsApp.editProduct('${product.id}')" title="Editar">`;
                html += `    <ion-icon name="create-outline"></ion-icon>`;
                html += `  </button>`;
                html += `  <button class="btn btn-accent btn-sm" onclick="ProductsApp.deleteProduct('${product.id}')" title="Eliminar">`;
                html += `    <ion-icon name="trash-outline"></ion-icon>`;
                html += `  </button>`;
                html += `</td>`;
                html += `</tr>`;
            });
            
            html += '</tbody></table></div>';
            container.innerHTML = html;
            
            Animations.tableRowsEnter('#productsTableContainer tbody tr');
            
        } catch (error) {
            console.error('Error al cargar productos:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <ion-icon name="alert-circle-outline"></ion-icon>
                    <span>Error al cargar productos</span>
                </div>
            `;
        }
    },
    
    openProductModal(productId = null) {
        this.currentProduct = productId;
        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');
        const form = document.getElementById('productForm');
        
        form.reset();
        
        if (productId) {
            title.textContent = 'Editar Producto';
            this.loadProductData(productId);
        } else {
            title.textContent = 'Nuevo Producto';
            this.generateSizeInputs();
        }
        
        modal.classList.add('active');
        Animations.modalEnter(modal);
    },
    
    closeProductModal() {
        const modal = document.getElementById('productModal');
        Animations.modalExit(modal, () => {
            modal.classList.remove('active');
        });
    },
    
    async loadProductData(productId) {
        try {
            const product = await window.db.getProduct(productId);
            
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productType').value = product.type_id || '';
            
            this.generateSizeInputs(product.product_sizes);
            
        } catch (error) {
            console.error('Error al cargar producto:', error);
            this.showNotification('Error al cargar el producto', 'danger');
        }
    },
    
    generateSizeInputs(sizes = null) {
        const container = document.getElementById('sizesContainer');
        const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];
        
        let html = '<div class="table-container" style="margin-top: 0;">';
        html += '<table><thead><tr>';
        html += '<th>Talla</th>';
        html += '<th>Precio (MXN)</th>';
        html += '<th>Stock</th>';
        html += '<th>Stock Mínimo</th>';
        html += '</tr></thead><tbody>';
        
        sizeOptions.forEach(size => {
            const sizeData = sizes ? sizes.find(s => s.size === size) : null;
            
            html += `<tr>`;
            html += `<td><strong>${size}</strong></td>`;
            html += `<input type="hidden" name="sizeId_${size}" value="${sizeData?.id || ''}" id="sizeId_${size}">`;
            
            // Precio - usar placeholder cuando sea nuevo producto
            html += `<td>`;
            if (sizeData) {
                html += `<input type="number" class="form-input" name="price_${size}" id="price_${size}" 
                    value="${sizeData.price}" step="0.01" min="0" required 
                    style="width: 100%; padding: 0.5rem;">`;
            } else {
                html += `<input type="number" class="form-input" name="price_${size}" id="price_${size}" 
                    placeholder="0.00" step="0.01" min="0" required 
                    style="width: 100%; padding: 0.5rem;">`;
            }
            html += `</td>`;
            
            // Stock - usar placeholder cuando sea nuevo producto
            html += `<td>`;
            if (sizeData) {
                html += `<input type="number" class="form-input" name="stock_${size}" id="stock_${size}" 
                    value="${sizeData.stock}" min="0" required 
                    style="width: 100%; padding: 0.5rem;">`;
            } else {
                html += `<input type="number" class="form-input" name="stock_${size}" id="stock_${size}" 
                    placeholder="0" min="0" required 
                    style="width: 100%; padding: 0.5rem;">`;
            }
            html += `</td>`;
            
            // Stock mínimo - usar placeholder cuando sea nuevo producto
            html += `<td>`;
            if (sizeData) {
                html += `<input type="number" class="form-input" name="minStock_${size}" id="minStock_${size}" 
                    value="${sizeData.min_stock}" min="0" required 
                    style="width: 100%; padding: 0.5rem;">`;
            } else {
                html += `<input type="number" class="form-input" name="minStock_${size}" id="minStock_${size}" 
                    placeholder="5" min="0" required 
                    style="width: 100%; padding: 0.5rem;">`;
            }
            html += `</td>`;
            
            html += `</tr>`;
        });
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
    },
    
    async editProduct(productId) {
        this.openProductModal(productId);
    },
    
    async deleteProduct(productId) {
        if (!confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) {
            return;
        }
        
        try {
            await window.db.deleteProduct(productId);
            this.showNotification('Producto eliminado correctamente', 'success');
            await this.loadProducts();
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            this.showNotification('Error al eliminar el producto', 'danger');
        }
    },
    
    // ==================== PRODUCT TYPES ====================
    
    async loadTypes() {
        try {
            this.types = await window.db.getProductTypes();
            
            // Actualizar select en el formulario
            const select = document.getElementById('productType');
            select.innerHTML = '<option value="">Seleccionar...</option>';
            
            this.types.forEach(type => {
                const option = document.createElement('option');
                option.value = type.id;
                option.textContent = type.name;
                select.appendChild(option);
            });
            
        } catch (error) {
            console.error('Error al cargar tipos:', error);
        }
    },
    
    openTypesModal() {
        const modal = document.getElementById('typesModal');
        this.renderTypesList();
        modal.classList.add('active');
        Animations.modalEnter(modal);
    },
    
    closeTypesModal() {
        const modal = document.getElementById('typesModal');
        Animations.modalExit(modal, () => {
            modal.classList.remove('active');
        });
    },
    
    renderTypesList() {
        const container = document.getElementById('typesListContainer');
        
        let html = '<div style="margin-top: 1.5rem;">';
        
        this.types.forEach(type => {
            const isDefault = type.name === 'Normal' || type.name === 'Premium';
            
            html += `<div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; border-bottom: 1px solid #e2e8f0;">`;
            html += `<span style="font-weight: 500;">${type.name}</span>`;
            
            if (!isDefault) {
                html += `<button class="btn btn-accent btn-sm" onclick="ProductsApp.deleteType('${type.id}')">`;
                html += `<ion-icon name="trash-outline"></ion-icon>`;
                html += `</button>`;
            } else {
                html += `<span class="badge badge-info">Por defecto</span>`;
            }
            
            html += `</div>`;
        });
        
        html += '</div>';
        container.innerHTML = html;
    },
    
    async addType() {
        const input = document.getElementById('newTypeName');
        const name = input.value.trim();
        
        if (!name) {
            this.showNotification('Ingresa un nombre para el tipo', 'warning');
            return;
        }
        
        try {
            await window.db.createProductType(name);
            input.value = '';
            await this.loadTypes();
            this.renderTypesList();
            this.showNotification('Tipo agregado correctamente', 'success');
        } catch (error) {
            console.error('Error al crear tipo:', error);
            this.showNotification('Error al crear el tipo', 'danger');
        }
    },
    
    async deleteType(typeId) {
        if (!confirm('¿Eliminar este tipo? Los productos con este tipo quedarán sin tipo asignado.')) {
            return;
        }
        
        try {
            await window.db.deleteProductType(typeId);
            await this.loadTypes();
            await this.loadProducts();
            this.renderTypesList();
            this.showNotification('Tipo eliminado correctamente', 'success');
        } catch (error) {
            console.error('Error al eliminar tipo:', error);
            this.showNotification('Error al eliminar el tipo', 'danger');
        }
    },
    
    // ==================== EXPORT ====================
    
    async exportData(format) {
        try {
            if (format === 'excel') {
                await ExportUtils.exportToExcel(this.products);
            } else if (format === 'pdf') {
                await ExportUtils.exportToPDF(this.products);
            }
        } catch (error) {
            console.error('Error al exportar:', error);
            this.showNotification('Error al exportar los datos', 'danger');
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

// Form submit handler
document.addEventListener('DOMContentLoaded', () => {
    ProductsApp.init();
    
    document.getElementById('productForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const productId = document.getElementById('productId').value;
        const productData = {
            name: document.getElementById('productName').value,
            description: null,
            type_id: document.getElementById('productType').value || null,
            sku: null
        };
        
        const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
        const sizesData = sizes.map(size => ({
            id: document.getElementById(`sizeId_${size}`).value || null,
            size: size,
            price: parseFloat(document.getElementById(`price_${size}`).value),
            stock: parseInt(document.getElementById(`stock_${size}`).value),
            min_stock: parseInt(document.getElementById(`minStock_${size}`).value)
        }));
        
        try {
            if (productId) {
                await window.db.updateProduct(productId, productData, sizesData);
                ProductsApp.showNotification('Producto actualizado correctamente', 'success');
            } else {
                await window.db.createProduct(productData, sizesData);
                ProductsApp.showNotification('Producto creado correctamente', 'success');
            }
            
            ProductsApp.closeProductModal();
            await ProductsApp.loadProducts();
            
        } catch (error) {
            console.error('Error al guardar producto:', error);
            ProductsApp.showNotification('Error al guardar el producto', 'danger');
        }
    });
});
