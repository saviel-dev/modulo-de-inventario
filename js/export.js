// Export utilities for Excel and PDF
const ExportUtils = {
    
    // Export to Excel using SheetJS
    async exportToExcel(products) {
        try {
            // Crear un nuevo libro de trabajo
            const wb = XLSX.utils.book_new();
            
            // ===== Hoja 1: Inventario Detallado =====
            const inventoryData = [];
            
            // Encabezados
            inventoryData.push([
                'Producto',
                'Tipo',
                'SKU',
                'Talla',
                'Precio (MXN)',
                'Stock',
                'Stock Mínimo',
                'Estado',
                'Valor Total'
            ]);
            
            // Datos
            products.forEach(product => {
                product.product_sizes.forEach(size => {
                    const status = size.stock < size.min_stock ? 'BAJO' : 'OK';
                    const totalValue = size.price * size.stock;
                    
                    inventoryData.push([
                        product.name,
                        product.product_types?.name || 'N/A',
                        product.sku || '-',
                        size.size,
                        size.price,
                        size.stock,
                        size.min_stock,
                        status,
                        totalValue
                    ]);
                });
            });
            
            const wsInventory = XLSX.utils.aoa_to_sheet(inventoryData);
            
            // Ajustar anchos de columnas
            wsInventory['!cols'] = [
                { wch: 25 }, // Producto
                { wch: 15 }, // Tipo
                { wch: 12 }, // SKU
                { wch: 8 },  // Talla
                { wch: 12 }, // Precio
                { wch: 8 },  // Stock
                { wch: 12 }, // Stock Mínimo
                { wch: 10 }, // Estado
                { wch: 12 }  // Valor Total
            ];
            
            XLSX.utils.book_append_sheet(wb, wsInventory, 'Inventario');
            
            // ===== Hoja 2: Resumen por Producto =====
            const summaryData = [];
            summaryData.push(['Producto', 'Tipo', 'SKU', 'Stock Total', 'Valor Total']);
            
            products.forEach(product => {
                const totalStock = product.product_sizes.reduce((sum, size) => sum + size.stock, 0);
                const totalValue = product.product_sizes.reduce((sum, size) => sum + (size.price * size.stock), 0);
                
                summaryData.push([
                    product.name,
                    product.product_types?.name || 'N/A',
                    product.sku || '-',
                    totalStock,
                    totalValue
                ]);
            });
            
            const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
            wsSummary['!cols'] = [
                { wch: 25 },
                { wch: 15 },
                { wch: 12 },
                { wch: 12 },
                { wch: 15 }
            ];
            
            XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');
            
            // ===== Hoja 3: Alertas de Stock =====
            const alertsData = [];
            alertsData.push(['Producto', 'Talla', 'Stock Actual', 'Stock Mínimo', 'Diferencia']);
            
            products.forEach(product => {
                product.product_sizes.forEach(size => {
                    if (size.stock < size.min_stock) {
                        alertsData.push([
                            product.name,
                            size.size,
                            size.stock,
                            size.min_stock,
                            size.stock - size.min_stock
                        ]);
                    }
                });
            });
            
            if (alertsData.length > 1) {
                const wsAlerts = XLSX.utils.aoa_to_sheet(alertsData);
                wsAlerts['!cols'] = [
                    { wch: 25 },
                    { wch: 8 },
                    { wch: 12 },
                    { wch: 12 },
                    { wch: 12 }
                ];
                XLSX.utils.book_append_sheet(wb, wsAlerts, 'Alertas');
            }
            
            // Descargar archivo
            const date = new Date().toISOString().split('T')[0];
            XLSX.writeFile(wb, `inventario_${date}.xlsx`);
            
        } catch (error) {
            console.error('Error al exportar a Excel:', error);
            throw error;
        }
    },
    
    // Export to PDF using jsPDF
    async exportToPDF(products) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Título
            doc.setFontSize(18);
            doc.setTextColor(31, 41, 55);
            doc.text('YuzApp - Inventario', 14, 20);
            
            // Fecha
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            const date = new Date().toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            doc.text(`Generado: ${date}`, 14, 28);
            
            // Preparar datos para la tabla
            const tableData = [];
            
            products.forEach(product => {
                product.product_sizes.forEach(size => {
                    const status = size.stock < size.min_stock ? 'BAJO' : 'OK';
                    const totalValue = (size.price * size.stock).toFixed(2);
                    
                    tableData.push([
                        product.name,
                        product.product_types?.name || 'N/A',
                        size.size,
                        `$${size.price.toFixed(2)}`,
                        size.stock.toString(),
                        size.min_stock.toString(),
                        status,
                        `$${totalValue}`
                    ]);
                });
            });
            
            // Generar tabla
            doc.autoTable({
                head: [[
                    'Producto',
                    'Tipo',
                    'Talla',
                    'Precio',
                    'Stock',
                    'Min',
                    'Estado',
                    'Valor'
                ]],
                body: tableData,
                startY: 35,
                styles: {
                    fontSize: 8,
                    cellPadding: 3
                },
                headStyles: {
                    fillColor: [30, 41, 59],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 252]
                },
                columnStyles: {
                    0: { cellWidth: 40 }, // Producto
                    1: { cellWidth: 25 }, // Tipo
                    2: { cellWidth: 15 }, // Talla
                    3: { cellWidth: 20 }, // Precio
                    4: { cellWidth: 15 }, // Stock
                    5: { cellWidth: 15 }, // Min
                    6: { cellWidth: 18 }, // Estado
                    7: { cellWidth: 22 }  // Valor
                },
                didParseCell: function(data) {
                    // Colorear el estado
                    if (data.column.index === 6 && data.cell.text[0] === 'BAJO') {
                        data.cell.styles.textColor = [220, 38, 38];
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            });
            
            // Resumen al final
            const finalY = doc.lastAutoTable.finalY + 10;
            
            const totalStock = products.reduce((sum, product) => {
                return sum + product.product_sizes.reduce((s, size) => s + size.stock, 0);
            }, 0);
            
            const totalValue = products.reduce((sum, product) => {
                return sum + product.product_sizes.reduce((s, size) => s + (size.price * size.stock), 0);
            }, 0);
            
            const lowStockCount = products.reduce((sum, product) => {
                return sum + product.product_sizes.filter(size => size.stock < size.min_stock).length;
            }, 0);
            
            doc.setFontSize(10);
            doc.setTextColor(31, 41, 55);
            doc.text(`Total de Productos: ${products.length}`, 14, finalY);
            doc.text(`Piezas en Stock: ${totalStock}`, 14, finalY + 6);
            doc.text(`Valor del Inventario: $${totalValue.toFixed(2)} MXN`, 14, finalY + 12);
            doc.text(`Productos con Stock Bajo: ${lowStockCount}`, 14, finalY + 18);
            
            // Pie de página
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(100, 116, 139);
                doc.text(
                    `Página ${i} de ${pageCount}`,
                    doc.internal.pageSize.getWidth() / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
            }
            
            // Descargar archivo
            const dateStr = new Date().toISOString().split('T')[0];
            doc.save(`inventario_${dateStr}.pdf`);
            
        } catch (error) {
            console.error('Error al exportar a PDF:', error);
            throw error;
        }
    }
};

// Exportar para uso global
window.ExportUtils = ExportUtils;
