const express = require('express');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const fse = require('fs-extra');
const chalk = require('chalk');
const localIpAddress = require("local-ip-address")

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

// UKR

app.get('/present-ukr-d', (req, res) => {
    res.render('present-ukr-darktheme')
});


app.get('/create-ukr', (req, res) => {
    res.render('create-ukr')
});

app.get('/present-ukr', (req, res) => {
    res.render('present-ukr')
});

app.post('/create-ukr', (req, res) => {
    const form = new formidable.IncomingForm({
        multiples: true,
        maxFileSize: 2 * 1024 * 1024 * 1024, // 2 GB limit
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error parsing the form' });
        }

        // Create directory if it doesn't exist
        const storagePath = path.join(__dirname, 'public', 'storage-ukr');
        if (!fs.existsSync(storagePath)) {
            fs.mkdirSync(storagePath);
        }

        // Create directory for JSON file if it doesn't exist
        const dbPath = path.join(__dirname, 'db-ukr');
        if (!fs.existsSync(dbPath)) {
            fs.mkdirSync(dbPath);
        }

        fse.emptyDirSync(dbPath);
        fse.emptyDirSync(storagePath);

        const jsonData = [];

        // Iterate over the fields and handle each set of inputs
        for (let i = 1; fields[`name_${i}`] !== undefined; i++) {
            const name = fields[`name_${i}`];
            const mute = fields[`mute_${i}`];
            const loop = fields[`loop_${i}`];
            const ctrl = fields[`ctrl_${i}`];
            const file = files[`file_${i}`];

            if (file) {
                const newFilePath = path.join(storagePath, file[0].originalFilename);

                // Move the file to the storage directory
                fs.renameSync(file[0].filepath, newFilePath);

                // Add information to the JSON data
                jsonData.push({
                    name,
                    mute,
                    loop,
                    ctrl,
                    file: newFilePath,
                });
            }
        }

        jsonData.unshift({ lastUpdate: Date.now() })

        // Create JSON file
        const jsonFilePath = path.join(dbPath, `layout.json`);
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));

        // console.log('Fields:', fields);
        // console.log('Files:', files);
        var d = new Date(Date.now());
        console.log(chalk.yellowBright(d.toString().split('GMT')[0], `UKR Page created`));
        res.json(jsonData);
    });
});

app.get('/layout-ukr', (req, res) => {
    const filePath = path.join(__dirname, 'db-ukr', 'layout.json');

    // Read the file asynchronously
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        try {
            // Parse the file content as JSON
            const jsonData = JSON.parse(data);

            // Send the parsed JSON as the response
            res.json(jsonData);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            res.status(500).send('Internal Server Error');
        }
    });
});

// ISR

app.get('/create-isr', (req, res) => {
    res.render('create-isr')
});

app.get('/present-isr', (req, res) => {
    res.render('present-isr')
});

app.post('/create-isr', (req, res) => {
    const form = new formidable.IncomingForm({
        multiples: true,
        maxFileSize: 2 * 1024 * 1024 * 1024, // 2 GB limit
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error parsing the form' });
        }

        // Create directory if it doesn't exist
        const storagePath = path.join(__dirname, 'public', 'storage-isr');
        if (!fs.existsSync(storagePath)) {
            fs.mkdirSync(storagePath);
        }

        // Create directory for JSON file if it doesn't exist
        const dbPath = path.join(__dirname, 'db-isr');
        if (!fs.existsSync(dbPath)) {
            fs.mkdirSync(dbPath);
        }

        fse.emptyDirSync(dbPath);
        fse.emptyDirSync(storagePath);

        const jsonData = [];

        // Iterate over the fields and handle each set of inputs
        for (let i = 1; fields[`name_${i}`] !== undefined; i++) {
            const name = fields[`name_${i}`];
            const mute = fields[`mute_${i}`];
            const loop = fields[`loop_${i}`];
            const ctrl = fields[`ctrl_${i}`];
            const file = files[`file_${i}`];

            if (file) {
                const newFilePath = path.join(storagePath, file[0].originalFilename);

                // Move the file to the storage directory
                fs.renameSync(file[0].filepath, newFilePath);

                // Add information to the JSON data
                jsonData.push({
                    name,
                    mute,
                    loop,
                    ctrl,
                    file: newFilePath,
                });
            }
        }

        jsonData.unshift({ lastUpdate: Date.now() })

        // Create JSON file
        const jsonFilePath = path.join(dbPath, `layout.json`);
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));

        // console.log('Fields:', fields);
        // console.log('Files:', files);
        var d = new Date(Date.now());
        console.log(chalk.yellowBright(d.toString().split('GMT')[0], `ISR Page created`));
        res.json(jsonData);
    });
});

app.get('/layout-isr', (req, res) => {
    const filePath = path.join(__dirname, 'db-isr', 'layout.json');

    // Read the file asynchronously
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        try {
            // Parse the file content as JSON
            const jsonData = JSON.parse(data);

            // Send the parsed JSON as the response
            res.json(jsonData);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            res.status(500).send('Internal Server Error');
        }
    });
});

app.listen(port, () => {
    var d = new Date(Date.now());
    console.log(d.toString().split('GMT')[0].trim(), `Lagezentrum running on ${localIpAddress()}:${port}`);
    console.log(chalk.yellowBright(`
    ██    ██ ██   ██ ██████  
    ██    ██ ██  ██  ██   ██ 
    ██    ██ █████   ██████  
    ██    ██ ██  ██  ██   ██ 
     ██████  ██   ██ ██   ██ 
                             `));
    console.log(chalk.yellowBright(`- "http://${localIpAddress()}:${port}/create-ukr"`));
    console.log(chalk.yellowBright(`- "http://${localIpAddress()}:${port}/present-ukr"`));
    console.log(chalk.blueBright(`
    ██ ███████ ██████  
    ██ ██      ██   ██ 
    ██ ███████ ██████  
    ██      ██ ██   ██ 
    ██ ███████ ██   ██ 
                       `));
    console.log(chalk.blueBright(`- "http://${localIpAddress()}:${port}/create-isr"`));
    console.log(chalk.blueBright(`- "http://${localIpAddress()}:${port}/present-isr"`));
});