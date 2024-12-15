const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear el cuerpo de las solicitudes JSON
app.use(bodyParser.json());

// Ruta principal
app.get('/', (req, res) => {
    res.send('¡Hola! Esta es tu API en funcionamiento.');
});

// Ruta para obtener datos de data.json
app.get('/api/data', (req, res) => {
    const dataPath = path.join(__dirname, 'data.json');

    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer el archivo de datos.');
        }

        res.json(JSON.parse(data));
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
