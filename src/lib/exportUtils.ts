/**
 * Export utilities for CSV and PDF generation
 */

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV<T extends Record<string, unknown>>(data: T[], headers?: string[]): string {
    if (data.length === 0) return '';

    // Get headers from first object if not provided
    const cols = headers || Object.keys(data[0]);

    // Create header row
    const csvHeaders = cols.join(',');

    // Create data rows
    const csvRows = data.map(row => {
        return cols.map(col => {
            let value = row[col];

            // Handle null/undefined
            if (value === null || value === undefined) {
                return '';
            }

            // Convert to string
            const stringValue = String(value);

            // Escape quotes and wrap in quotes if contains comma, newline, or quote
            if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }

            return stringValue;
        }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Generate CSV download response
 */
export function generateCSVResponse<T extends Record<string, unknown>>(data: T[], filename: string, headers?: string[]) {
    const csv = arrayToCSV(data, headers);

    return new Response(csv, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${filename}.csv"`
        }
    });
}

/**
 * Simple HTML to PDF conversion for basic tables
 * For production, consider using libraries like puppeteer or pdfkit
 */
export function generateSimplePDF<T extends Record<string, unknown>>(title: string, data: T[], columns: { key: string, label: string }[]): string {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #059669;
            padding-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th {
            background-color: #059669;
            color: white;
            padding: 12px;
            text-align: left;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <p>Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
    
    <table>
        <thead>
            <tr>
                ${columns.map(col => `<th>${col.label}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${data.map(row => `
                <tr>
                    ${columns.map(col => `<td>${row[col.key] || ''}</td>`).join('')}
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="footer">
        <p>Achrilik - Marketplace Locale</p>
        <p>Total: ${data.length} enregistrement(s)</p>
    </div>
</body>
</html>
    `;

    return html;
}

/**
 * Generate HTML PDF response (can be saved as HTML or printed to PDF)
 */
export function generatePDFResponse(html: string, filename: string) {
    return new Response(html, {
        headers: {
            'Content-Type': 'text/html',
            'Content-Disposition': `inline; filename="${filename}.html"`
        }
    });
}
