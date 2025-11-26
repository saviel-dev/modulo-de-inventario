-- Sistema de Control de Inventario - Playeras
-- Schema para Supabase PostgreSQL

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: Tipos de Productos
CREATE TABLE product_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: Productos
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    type_id UUID REFERENCES product_types(id) ON DELETE SET NULL,
    sku TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: Tallas de Productos (Inventario por Talla)
CREATE TABLE product_sizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    size TEXT NOT NULL CHECK (size IN ('S', 'M', 'L', 'XL', 'XXL')),
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_stock INTEGER NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, size)
);

-- Tabla: Entradas de Inventario
CREATE TABLE entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    size TEXT NOT NULL CHECK (size IN ('S', 'M', 'L', 'XL', 'XXL')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    cost DECIMAL(10, 2),
    notes TEXT,
    entry_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: Salidas de Inventario
CREATE TABLE exits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    size TEXT NOT NULL CHECK (size IN ('S', 'M', 'L', 'XL', 'XXL')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    sale_price DECIMAL(10, 2),
    notes TEXT,
    exit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX idx_products_type ON products(type_id);
CREATE INDEX idx_product_sizes_product ON product_sizes(product_id);
CREATE INDEX idx_entries_product ON entries(product_id);
CREATE INDEX idx_entries_date ON entries(entry_date);
CREATE INDEX idx_exits_product ON exits(product_id);
CREATE INDEX idx_exits_date ON exits(exit_date);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_sizes_updated_at
    BEFORE UPDATE ON product_sizes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar stock automáticamente en entradas
CREATE OR REPLACE FUNCTION update_stock_on_entry()
RETURNS TRIGGER AS $$
BEGIN
    -- Incrementar stock en product_sizes
    UPDATE product_sizes
    SET stock = stock + NEW.quantity
    WHERE product_id = NEW.product_id AND size = NEW.size;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar stock automáticamente en salidas
CREATE OR REPLACE FUNCTION update_stock_on_exit()
RETURNS TRIGGER AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    -- Obtener stock actual
    SELECT stock INTO current_stock
    FROM product_sizes
    WHERE product_id = NEW.product_id AND size = NEW.size;
    
    -- Validar que hay suficiente stock
    IF current_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Stock insuficiente. Stock actual: %, Cantidad solicitada: %', current_stock, NEW.quantity;
    END IF;
    
    -- Decrementar stock
    UPDATE product_sizes
    SET stock = stock - NEW.quantity
    WHERE product_id = NEW.product_id AND size = NEW.size;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar stock automáticamente
CREATE TRIGGER auto_update_stock_on_entry
    AFTER INSERT ON entries
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_on_entry();

CREATE TRIGGER auto_update_stock_on_exit
    AFTER INSERT ON exits
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_on_exit();

-- Insertar tipos de productos por defecto
INSERT INTO product_types (name) VALUES
    ('Normal'),
    ('Premium')
ON CONFLICT (name) DO NOTHING;

-- Datos de ejemplo (opcional - comentar si no se desea)
-- Insertar un producto de ejemplo
DO $$
DECLARE
    producto_id UUID;
    tipo_normal_id UUID;
BEGIN
    -- Obtener el ID del tipo "Normal"
    SELECT id INTO tipo_normal_id FROM product_types WHERE name = 'Normal';
    
    -- Insertar producto de ejemplo
    INSERT INTO products (name, description, type_id, sku)
    VALUES ('Playera México Flag', 'Playera con bandera de México', tipo_normal_id, 'MEX-001')
    RETURNING id INTO producto_id;
    
    -- Insertar tallas para el producto
    INSERT INTO product_sizes (product_id, size, price, stock, min_stock) VALUES
        (producto_id, 'S', 250.00, 10, 5),
        (producto_id, 'M', 250.00, 15, 5),
        (producto_id, 'L', 250.00, 20, 5),
        (producto_id, 'XL', 280.00, 12, 5),
        (producto_id, 'XXL', 300.00, 8, 5);
END $$;

-- Habilitar Row Level Security (RLS) - Opcional si se necesita autenticación
-- ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE exits ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para acceso público (sin autenticación)
-- Si no necesitas autenticación, permite acceso total
-- ALTER TABLE product_types FORCE ROW LEVEL SECURITY;
-- CREATE POLICY "Enable all access for product_types" ON product_types FOR ALL USING (true) WITH CHECK (true);
