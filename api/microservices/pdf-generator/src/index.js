const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const cors = require('cors');  // <--- Importa cors

const app = express();

// Habilitar CORS para todas las solicitudes
app.use(cors());

app.use(express.json());

// Función para generar el HTML usando Handlebars
async function generarHtml(tickets) {
    const templatePath = path.join(__dirname, 'views', 'template.hbs');
    const templateHtml = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateHtml);
    return template({ tickets });
}

async function generarHtml2(tickets, reportData) {
    const templatePath = path.join(__dirname, 'views', 'template2.hbs');
    const templateHtml = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateHtml);

    // reportData debe contener las variables adicionales como fechas y logoUrl
    const data = {
        tickets, // los tickets vienen en un array con propiedades detalladas
        logoUrl: reportData.logoUrl,
        generationDate: reportData.generationDate,
        startDate: reportData.startDate,
        endDate: reportData.endDate
    };

    return template(data);
}

// Ruta para generar el PDF
app.post('/generar-pdf2', async (req, res) => {
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
        const pdfBuffer = await page.pdf(
            {
                format: 'A4',
                printBackground: true,
                //path: 'tickets.pdf',
            }
        );

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

// Ruta para generar el PDF
app.post('/generar-pdf', async (req, res) => {
    try {
        const { tickets, generationDate, startDate, endDate, logoUrl } = req.body;
        //console.log(req.body);

        // Generar el HTML con la información recibida
        const html = await generarHtml2(tickets, {
            generationDate,
            startDate,
            endDate,
            logoUrl
        });


        // Iniciar Puppeteer
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true
        });
        const page = await browser.newPage();

        // Cargar el HTML generado en la página
        await page.setContent(html, { waitUntil: 'domcontentloaded' });

        // Generar el PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            //path: 'tickets.pdf',
            margin: {
                top: '1in',
                right: '1in',
                bottom: '1in',
                left: '1in'
            },
        });

        // Cerrar el navegador
        await browser.close();

        // Configurar las cabeceras para permitir CORS
        res.status(200).set({
            'Access-Control-Allow-Origin': '*',  // Permitir todas las fuentes
            'Access-Control-Allow-Credentials': true,
            'Content-Type': 'application/pdf',
        }).end(pdfBuffer);

    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).send('Error al generar el PDF');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log('http://localhost:3000');
});