# YuzApp - Sistema de Control de Inventario

Sistema web moderno para gestión de inventario de playeras con soporte para múltiples tallas, tipos personalizables y tracking de movimientos.

## 🚀 Características

- ✅ **YuzApp Dashboard**: Métricas en tiempo real y alertas de stock bajo
- ✅ **Gestión de Productos**: Control por talla (S, M, L, XL, XXL) y tipos personalizables
- ✅ **Movimientos**: Registro detallado de entradas y salidas
- ✅ **Reportes**: Exportación profesional a Excel y PDF con marca de agua YuzApp
- ✅ **Diseño Premium**: Interfaz moderna, responsive y con animaciones fluidas
- ✅ **Loader Personalizado**: Animación de carga "Jumping Cube"
- ✅ **Responsive**: Adaptado perfectamente a móviles, tablets y escritorio

## 📋 Requisitos Previos

1. **Cuenta de Supabase** - [Crear cuenta gratuita](https://supabase.com)
2. **Navegador web moderno** (Chrome, Firefox, Safari, Edge)

## ⚙️ Configuración de Supabase

### Paso 1: Crear Proyecto en Supabase

1. Ve a [Supabase](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto:
   - **Organization**: Crea una nueva o selecciona una existente
   - **Name**: "inventario-playeras" (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (¡guárdala!)
   - **Region**: Selecciona la más cercana a tu ubicación
3. Espera a que el proyecto se inicialice (1-2 minutos)

### Paso 2: Ejecutar el Schema SQL

1. En tu proyecto de Supabase, ve a **SQL Editor** (icono de base de datos en el menú izquierdo)
2. Click en **New Query**
3. Copia todo el contenido del archivo `database/schema.sql`
4. Pega el contenido en el editor SQL
5. Click en **Run** (o presiona Ctrl/Cmd + Enter)
6. Verifica que aparezca "Success. No rows returned" o similar

### Paso 3: Obtener las Credenciales

1. Ve a **Project Settings** (icono de engranaje en el menú izquierdo)
2. Click en **API** en el menú lateral
3. Copia los siguientes valores:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public** (API Key): Una clave larga que empieza con `eyJ...`

### Paso 4: Configurar la Aplicación

1. Abre el archivo `js/config.js`
2. Reemplaza los valores con tus credenciales:

```javascript
const SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
const SUPABASE_ANON_KEY = "tu-anon-key-aqui";
```

## 🖥️ Instalación y Uso

### Opción 1: Servidor Local Simple

```bash
# Si tienes Python instalado
python -m http.server 8000

# O con Node.js
npx http-server -p 8000
```

Luego abre en tu navegador: `http://localhost:8000`

### Opción 2: Abrir Directamente

1. Simplemente abre `index.html` en tu navegador
2. **Nota**: Algunas funciones pueden requerir un servidor local debido a CORS

## 📁 Estructura del Proyecto

```
inventario-playeras/
├── index.html              # Dashboard principal
├── products.html           # Gestión de productos
├── movements.html          # Entradas y salidas
├── README.md              # Este archivo
├── database/
│   └── schema.sql         # Schema de Supabase
├── css/
│   └── styles.css         # Estilos personalizados
├── js/
│   ├── config.js          # Configuración de Supabase
│   ├── supabase-client.js # Cliente y funciones helper
│   ├── dashboard.js       # Lógica del dashboard
│   ├── products.js        # CRUD de productos
│   ├── movements.js       # CRUD de movimientos
│   ├── animations.js      # Configuración de animaciones
│   └── export.js          # Exportación Excel/PDF
```

## 🎨 Tecnologías Utilizadas

- **HTML5** - Estructura
- **Tailwind CSS** - Framework CSS
- **Vanilla JavaScript** - Lógica de la aplicación
- **Supabase** - Backend (PostgreSQL)
- **Anime.js** - Animaciones
- **Ionicons** - Iconos
- **SheetJS (XLSX)** - Exportación Excel
- **jsPDF** - Exportación PDF

## 📊 Uso del Sistema

### Dashboard

- Visualiza productos con stock bajo
- Métricas generales del inventario
- Movimientos recientes

### Productos

- **Crear**: Click en "Nuevo Producto", completa el formulario
- **Editar**: Click en el icono de editar en la tabla
- **Eliminar**: Click en el icono de eliminar
- **Tipos**: Gestiona tipos personalizados desde el botón "Tipos"
- **Exportar**: Selecciona Excel o PDF para exportar el inventario

### Movimientos

- **Entradas**: Registra nuevas adquisiciones de inventario
- **Salidas**: Registra ventas o salidas de inventario
- El stock se actualiza automáticamente

## 🔒 Seguridad

Por defecto, la aplicación usa la API pública de Supabase sin autenticación. Para producción, considera:

1. Habilitar Row Level Security (RLS) en Supabase
2. Implementar autenticación de usuarios
3. Configurar políticas de acceso adecuadas

## 📝 Notas

- Los datos de ejemplo se crean automáticamente al ejecutar el schema
- El stock nunca puede ser negativo (validación en la base de datos)
- Las salidas validan que haya stock suficiente antes de procesarse

## 🆘 Soporte

Si tienes problemas:

1. Verifica que las credenciales de Supabase sean correctas
2. Asegúrate de que el schema SQL se ejecutó correctamente
3. Revisa la consola del navegador para mensajes de error
4. Verifica tu conexión a internet

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
