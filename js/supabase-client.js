// Cliente de Supabase y funciones helper
class SupabaseClient {
    constructor() {
        const config = window.SUPABASE_CONFIG;
        
        if (!config || !config.url || !config.anonKey) {
            throw new Error('Supabase no está configurado. Revisa js/config.js');
        }
        
        this.client = supabase.createClient(config.url, config.anonKey);
    }

    // ==================== PRODUCT TYPES ====================
    
    async getProductTypes() {
        const { data, error } = await this.client
            .from('product_types')
            .select('*')
            .order('name');
        
        if (error) throw error;
        return data;
    }

    async createProductType(name) {
        const { data, error } = await this.client
            .from('product_types')
            .insert([{ name }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async deleteProductType(id) {
        const { error } = await this.client
            .from('product_types')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    }

    // ==================== PRODUCTS ====================
    
    async getProducts() {
        const { data, error } = await this.client
            .from('products')
            .select(`
                *,
                product_types (
                    id,
                    name
                ),
                product_sizes (
                    id,
                    size,
                    price,
                    stock,
                    min_stock
                )
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }

    async getProduct(id) {
        const { data, error } = await this.client
            .from('products')
            .select(`
                *,
                product_types (
                    id,
                    name
                ),
                product_sizes (
                    id,
                    size,
                    price,
                    stock,
                    min_stock
                )
            `)
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    }

    async createProduct(productData, sizesData) {
        // Crear producto
        const { data: product, error: productError } = await this.client
            .from('products')
            .insert([{
                name: productData.name,
                description: productData.description,
                type_id: productData.type_id,
                sku: productData.sku
            }])
            .select()
            .single();
        
        if (productError) throw productError;

        // Crear tallas
        const sizesToInsert = sizesData.map(size => ({
            product_id: product.id,
            size: size.size,
            price: size.price,
            stock: size.stock || 0,
            min_stock: size.min_stock || 0
        }));

        const { error: sizesError } = await this.client
            .from('product_sizes')
            .insert(sizesToInsert);
        
        if (sizesError) throw sizesError;

        return product;
    }

    async updateProduct(id, productData, sizesData) {
        // Actualizar producto
        const { error: productError } = await this.client
            .from('products')
            .update({
                name: productData.name,
                description: productData.description,
                type_id: productData.type_id,
                sku: productData.sku
            })
            .eq('id', id);
        
        if (productError) throw productError;

        // Actualizar tallas
        for (const size of sizesData) {
            const { error: sizeError } = await this.client
                .from('product_sizes')
                .update({
                    price: size.price,
                    stock: size.stock,
                    min_stock: size.min_stock
                })
                .eq('id', size.id);
            
            if (sizeError) throw sizeError;
        }
    }

    async deleteProduct(id) {
        const { error } = await this.client
            .from('products')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    }

    // ==================== ENTRIES ====================
    
    async getEntries() {
        const { data, error } = await this.client
            .from('entries')
            .select(`
                *,
                products (
                    id,
                    name,
                    sku
                )
            `)
            .order('entry_date', { ascending: false });
        
        if (error) throw error;
        return data;
    }

    async createEntry(entryData) {
        const { data, error } = await this.client
            .from('entries')
            .insert([{
                product_id: entryData.product_id,
                size: entryData.size,
                quantity: entryData.quantity,
                cost: entryData.cost,
                notes: entryData.notes,
                entry_date: entryData.entry_date || new Date().toISOString()
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async deleteEntry(id) {
        // Obtener datos de la entrada antes de eliminarla
        const { data: entry, error: fetchError } = await this.client
            .from('entries')
            .select('product_id, size, quantity')
            .eq('id', id)
            .single();
        
        if (fetchError) throw fetchError;

        // Obtener stock actual
        const { data: sizeData, error: sizeError } = await this.client
            .from('product_sizes')
            .select('stock')
            .eq('product_id', entry.product_id)
            .eq('size', entry.size)
            .single();
        
        if (sizeError) throw sizeError;

        // Eliminar la entrada
        const { error: deleteError } = await this.client
            .from('entries')
            .delete()
            .eq('id', id);
        
        if (deleteError) throw deleteError;

        // Restar la cantidad del stock (revertir la entrada)
        const newStock = sizeData.stock - entry.quantity;
        const { error: updateError } = await this.client
            .from('product_sizes')
            .update({ stock: newStock })
            .eq('product_id', entry.product_id)
            .eq('size', entry.size);
        
        if (updateError) throw updateError;
    }

    // ==================== EXITS ====================
    
    async getExits() {
        const { data, error } = await this.client
            .from('exits')
            .select(`
                *,
                products (
                    id,
                    name,
                    sku
                )
            `)
            .order('exit_date', { ascending: false });
        
        if (error) throw error;
        return data;
    }

    async createExit(exitData) {
        const { data, error } = await this.client
            .from('exits')
            .insert([{
                product_id: exitData.product_id,
                size: exitData.size,
                quantity: exitData.quantity,
                sale_price: exitData.sale_price,
                notes: exitData.notes,
                exit_date: exitData.exit_date || new Date().toISOString()
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async deleteExit(id) {
        // Obtener datos de la salida antes de eliminarla
        const { data: exit, error: fetchError } = await this.client
            .from('exits')
            .select('product_id, size, quantity')
            .eq('id', id)
            .single();
        
        if (fetchError) throw fetchError;

        // Obtener stock actual
        const { data: sizeData, error: sizeError } = await this.client
            .from('product_sizes')
            .select('stock')
            .eq('product_id', exit.product_id)
            .eq('size', exit.size)
            .single();
        
        if (sizeError) throw sizeError;

        // Eliminar la salida
        const { error: deleteError } = await this.client
            .from('exits')
            .delete()
            .eq('id', id);
        
        if (deleteError) throw deleteError;

        // Sumar la cantidad al stock (revertir la salida)
        const newStock = sizeData.stock + exit.quantity;
        const { error: updateError } = await this.client
            .from('product_sizes')
            .update({ stock: newStock })
            .eq('product_id', exit.product_id)
            .eq('size', exit.size);
        
        if (updateError) throw updateError;
    }

    // ==================== DASHBOARD ====================
    
    async getLowStockProducts() {
        // Obtener todos los product_sizes y filtrar en JavaScript
        const { data, error } = await this.client
            .from('product_sizes')
            .select(`
                *,
                products (
                    id,
                    name,
                    sku,
                    product_types (
                        name
                    )
                )
            `);
        
        if (error) throw error;
        
        // Filtrar productos con stock bajo
        const lowStock = data.filter(item => item.stock < item.min_stock);
        
        // Ordenar por stock
        lowStock.sort((a, b) => a.stock - b.stock);
        
        return lowStock;
    }

    async getDashboardMetrics() {
        // Total de productos
        const { count: totalProducts, error: productsError } = await this.client
            .from('products')
            .select('*', { count: 'exact', head: true });
        
        if (productsError) throw productsError;

        // Valor total del inventario
        const { data: sizesData, error: sizesError } = await this.client
            .from('product_sizes')
            .select('price, stock');
        
        if (sizesError) throw sizesError;

        const totalValue = sizesData.reduce((acc, size) => {
            return acc + (size.price * size.stock);
        }, 0);

        // Total de stock
        const totalStock = sizesData.reduce((acc, size) => {
            return acc + size.stock;
        }, 0);

        // Productos con bajo stock - obtener todos y contar en JavaScript
        const { data: allSizes, error: lowStockError } = await this.client
            .from('product_sizes')
            .select('stock, min_stock');
        
        if (lowStockError) throw lowStockError;
        
        const lowStockCount = allSizes.filter(size => size.stock < size.min_stock).length;

        return {
            totalProducts,
            totalValue,
            totalStock,
            lowStockCount
        };
    }
}

// Instancia global del cliente
window.db = new SupabaseClient();
