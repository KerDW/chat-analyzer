const express = require('express');
const WhatsappExtractor = require('../extractors/whatsapp-extractor');

const app = express();
const port = 3000;

app.get('/', (req, res) => res.sendFile(__dirname+'/html/index.html'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

app.get('/extract', (req, res) => {
    if (req.query.file) {
        const file = `${__dirname}/html/upload/${req.query.file}`;
        const we = new WhatsappExtractor(file);
        const result = we.extract();

        res.send((req.query.info) ? result[req.query.info] : result);
    }
});


app.get('/view', (req, res) => {
    if (req.query.file) {
        const file = `${__dirname}/html/upload/${req.query.file}`;
        // TODO check if file exists
        res.sendFile(file);
    }
});