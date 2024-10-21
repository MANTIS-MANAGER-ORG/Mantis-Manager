const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const app = express();
app.use(express.json());

// Función para generar el HTML usando Handlebars
async function generarHtml(tickets) {
    const templatePath = path.join(__dirname, 'views', 'template.hbs');
    const templateHtml = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateHtml);
    return template({ tickets });
}

// Ruta para generar el PDF
app.post('/generar-pdf', async (req, res) => {
    try {
        const tickets = req.body.tickets; // Recibir tickets desde el cuerpo de la solicitud

        // Generar el HTML
        const html = await generarHtml(tickets);

        // Iniciar Puppeteer
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true
        });
        const page = await browser.newPage();

        // Cargar el HTML generado en la página
        await page.setContent(html, { waitUntil: 'domcontentloaded' });

        // Generar el PDF
        const pdfBuffer = await page.pdf({ format: 'A4' });

        // Cerrar el navegador
        await browser.close();

        // Configurar las cabeceras
        res.status(200).set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            'Content-Type': 'application/pdf',
        }).end(pdfBuffer);

        //fs.writeFileSync('tickets.pdf', pdfBuffer);
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).send('Error al generar el PDF');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});