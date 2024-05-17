const express = require('express');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const localIpAddress = require("local-ip-address")
const geoJson = require('world-geojson') // or `import geoJson from 'world-geojson'`
const core = require('./routes/core');
const utilities = require('./routes/utilities');

const app = express();
const port = 4000;

app.use(express.json());

app.set('view engine', 'ejs');
app.use('/assets', express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
    var d = new Date(Date.now());
    console.log(chalk.yellowBright(d.toString().split('GMT')[0], req.method, req.path))
    next()
});

// Routes
app.use('/', core);
app.use('/utl', utilities);

app.listen(port, () => {
    var d = new Date(Date.now());
    console.log(d.toString().split('GMT')[0].trim(), `Lagezentrum running on ${localIpAddress()}:${port}`);
})



