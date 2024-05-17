const express = require('express');
const fsm = require('fs').promises;
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const fse = require('fs-extra');
const chalk = require('chalk');
const localIpAddress = require("local-ip-address")
const ffmpeg = require('fluent-ffmpeg');
const short = require('short-uuid');
const { eventNames } = require('process');
const geoJson = require('world-geojson') // or `import geoJson from 'world-geojson'`

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
app.get('/play', (req, res) => {
    const { gp, title, subline, playlist, size } = req.query;

    const commonData = {
        vidType: 'video/mp4',
        title: title || '',
        sub: subline || '',
        playlist,
        size: generateInlineCSS(size),
    };

    switch (gp) {
        case 'lz-ukr':
            res.render('player', {
                ...commonData,
                bg: '/assets/gp/BGUKR.webm'
            });
            break;
        case 'lz-isr':
            res.render('player', {
                ...commonData,
                bg: '/assets/gp/BGISR.webm'
            });
            break;
        case 'bild':
            res.render('player', {
                ...commonData,
                bg: '/assets/gp/LOOP_TOUCH.mp4',
                vidType: 'video/mp4'
            });
            break;
        default:
            res.redirect('/playlists');
            break;
    }
});

app.get('/playlists', (req, res) => {
    res.render('playlists')
});

app.get('/create', (req, res) => {
    const { gp } = req.query;

    if (gp === 'ukr') {
        return res.render('create-ukr')
    }

    return res.render('create')

});

app.post('/playlist', (req, res) => {

    const { title, subline, gp } = req.query
    const form = new formidable.IncomingForm({
        multiples: true,
        allowEmptyFiles: true,
        minFileSize: 0,
        maxFileSize: 2 * 1024 * 1024 * 1024, // 2 GB limit
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.log(err.message)
            return res.status(500).json({ error: 'Error parsing the form' });
        }

        // console.log(files)

        var newFolder = short.generate().slice(0, 8);

        // Create directory for JSON file if it doesn't exist
        const dbPath = path.join(__dirname, 'public', 'playlists', newFolder);
        if (!fs.existsSync(dbPath)) {
            fs.mkdirSync(dbPath);
        }

        // Create directory if it doesn't exist
        const storagePath = path.join(__dirname, 'public', 'playlists', newFolder, 'storage');
        if (!fs.existsSync(storagePath)) {
            fs.mkdirSync(storagePath);
        }

        const jsonData = [];
        try {
            // Iterate over the fields and handle each set of inputs
            for (let i = 1; fields[`name_${i}`] !== undefined; i++) {


                const name = fields[`name_${i}`];
                const mute = fields[`mute_${i}`];
                const loop = fields[`loop_${i}`];
                const ctrl = fields[`ctrl_${i}`];
                const title = fields[`title_${i}`];
                const time = fields[`time_${i}`];
                const type = fields[`type_${i}`];
                const start = fields[`start_${i}`];
                const end = fields[`end_${i}`];
                const file = files[`file_${i}`];
                const thumbnail = files[`thumb_${i}`]
                const link = fields[`link_${i}`];

                if (file) {

                    const newFilePath = path.join(storagePath, file[0].originalFilename);

                    // Move the file to the storage directory
                    // fs.renameSync(file[0].filepath, newFilePath);
                    await moveFileAsync(file[0].filepath, newFilePath);



                    if (file[0].mimetype.split('/')[0] === 'video') {

                        const videoInfo = await getVideoInfo(newFilePath)

                        var newThumbPath = '';

                        if (thumbnail[0].size > 0) {
                            newThumbPath = path.join(storagePath, thumbnail[0].originalFilename);
                            // Move the file to the storage directory
                            fs.renameSync(thumbnail[0].filepath, newThumbPath);
                        } else {
                            await createThumbnail(newFilePath, storagePath, replaceFileExtension(file[0].originalFilename, '.jpg'));

                        }

                        // Add information to the JSON data
                        jsonData.push({
                            name,
                            mute,
                            loop,
                            ctrl,
                            title,
                            time,
                            type,
                            start,
                            end,
                            file: file[0].originalFilename,
                            thumb: thumbnail[0].size > 0 ? thumbnail[0].originalFilename : replaceFileExtension(file[0].originalFilename, '.jpg'),
                            info: videoInfo,
                            mime: file[0].mimetype
                        });
                    }

                    if (file[0].mimetype.split('/')[0] === 'image') {

                        // Add information to the JSON data
                        jsonData.push({
                            name,
                            mute,
                            loop,
                            ctrl,
                            title,
                            time,
                            type,
                            start,
                            end,
                            file: file[0].originalFilename,
                            mime: file[0].mimetype,
                        });
                    }
                }

                if (!file) {
                    jsonData.push({
                        name,
                        title,
                        time,
                        type,
                        mime: "web/url",
                        link
                    });
                }

            }
        } catch (err) {
            console.log(err.message)
        }

        jsonData.unshift({
            lastUpdate: Date.now(),
            url: `/play?gp=${gp}&playlist=${newFolder}&title=${title}`,
            gp: gp,
            title: title,
            subline: subline
        })


        // Create JSON file
        const jsonFilePath = path.join(dbPath, `layout.json`);
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));


        var d = new Date(Date.now());
        console.log(chalk.yellowBright(d.toString().split('GMT')[0], `playlist`, newFolder, 'created'));
        return res.json({ url: `/play?gp=${gp}&playlist=${newFolder}&title=${title}` });
    });
});

app.delete('/playlist', async (req, res) => {

    if (!req.query.playlist) {
        return res.send('Missing Playlist Name')
    }

    const folderToDelete = path.join(__dirname, 'public', 'playlists', req.query.playlist);

    try {
        await fse.remove(folderToDelete);
        console.log(`Folder ${folderToDelete} and its contents have been deleted successfully.`);
        return res.status(200).send()
    } catch (err) {
        console.error(`Error deleting ${folderToDelete}:`, err);
        return res.status(500).send()
    }
})

app.get('/layout', (req, res) => {
    const playlist = req.query.playlist;
    const filePath = path.join(__dirname, 'public', 'playlists', playlist, 'layout.json');

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
            // console.log(jsonData)
            // Send the parsed JSON as the response
            res.json(jsonData);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            res.status(500).send('Internal Server Error');
        }
    });
});

app.get('/layouts', (req, res) => {
    // Example usage
    const directoryPath = path.join(__dirname, 'public', 'playlists');
    getFoldersWithLayout(directoryPath)
        .then((result) => {
            // console.log(result);
            res.json(result);
        })
        .catch((error) => {
            console.error('Error:', error.message);
        });
});

app.get('/chart', (req, res) => {

    const { type, swap, colors, animate, data, categories, title, subline, size, min, labels, ticks } = req.query;

    var options = {};

    if (type === 'radialBar') {
        options = {
            colors: colors ? colors.split(',') : ['#ffffff'],
            chart: {
                type: type ? type : 'bar',
                height: 520,
                width: 1280,
                fontFamily: 'Gotham',
                toolbar: {
                    tools: {
                        download: false,
                        selection: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true | '<img src="/static/icons/reset.png" width="20">',
                        customIcons: []
                    },
                    show: true
                },
                animations: {
                    enabled: animate ? animate === 'true' ? true : false : true,
                    easing: 'easeinout',
                    speed: 600
                }
            },
            plotOptions: {
                radialBar: {
                    hollow: {
                        margin: 5,
                        size: "60%",
                    },
                    track: {
                        background: '#f2f2f2',
                        opacity: .2,
                    },
                    dataLabels: {
                        showOn: "always",
                        name: {
                            offsetY: -40,
                            show: true,
                            color: "#ffffff",
                            fontSize: "22px"
                        },
                        value: {
                            color: "#ffffff",
                            fontSize: "72px",
                            fontWeight: 800,
                            show: true
                        }
                    }
                }
            },
            series: [
                data
            ],
            labels: [categories],


        };
    } else {
        options = {
            colors: colors ? colors.split(',') : ['#ffffff'],
            chart: {
                type: type ? type : 'bar',
                height: 520,
                width: 1280,
                fontFamily: 'Gotham',
                toolbar: {
                    tools: {
                        download: false,
                        selection: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true | '<img src="/static/icons/reset.png" width="20">',
                        customIcons: []
                    },
                    show: true
                },
                animations: {
                    enabled: animate ? animate === 'true' ? true : false : true,
                    easing: 'easeinout',
                    speed: 600,
                    animateGradually: {
                        enabled: false,
                        delay: 100
                    },
                    dynamicAnimation: {
                        enabled: true,
                        speed: 350
                    },

                }
            },
            xaxis: {
                categories: categories.split(','),
                tickAmount: ticks ? parseInt(ticks) : undefined,
                labels: {
                    style: {
                        colors: '#ffffff',
                        fontSize: '16px',
                        fontWeight: 800,
                    }
                },
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#ffffff',
                        fontSize: '16px'
                    }
                },
                min: min ? parseInt(min) : undefined
            },
            series: [{
                data: data.split(',')
            }],
            stroke: {
                show: type === 'line' || type === 'area' ? true : false,
                lineCap: 'round',
                curve: 'smooth',
                width: 6,
                dashArray: 0,
            },
            plotOptions: {
                bar: {
                    borderRadius: 0,
                    horizontal: swap === 'true' ? true : false,
                    dataLabels: {
                        position: 'top'
                    },
                    distributed: true,
                    columnWidth: '70%',
                },
            },
            dataLabels: {
                enabled: labels ? labels === 'true' ? true : false : true,
                textAnchor: 'middle',
                style: {
                    fontSize: '18px',
                    fontWeight: 500,
                    colors: ['#000000']
                },
                background: {
                    enabled: true,
                    // padding: 8,
                    borderRadius: 2,
                    borderWidth: 1,
                    borderColor: '#000000',
                    opacity: 1,
                },
                offsetY: swap === 'true' ? 0 : type === 'bar' ? -16 : 0,
                offsetX: swap === 'true' ? type === 'bar' ? -10 : 0 : 0
            },
            legend: {
                show: false
            },
            fill: {
                opacity: 1,
                gradient: {
                    enabled: true,
                    opacityFrom: .05,
                    opacityTo: .6
                }
            },
            tooltip: {
                enabled: false
            }
        };
    }


    res.render('chart',
        {
            chart: JSON.stringify(options),
            title: title ? title : '',
            sub: subline ? subline : '',

        })
})

app.get('/insa', (req, res) => {

    const { party, type, swap, colors, animate, title, subline, size, min, labels, ticks } = req.query;

    var options = {};

    options = {
        colors: partyQueryToColors(party),
        chart: {
            type: type ? type : 'bar',
            height: 520,
            width: 1280,
            fontFamily: 'Gotham',
            toolbar: {
                tools: {
                    download: false,
                    selection: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true | '<img src="/static/icons/reset.png" width="20">',
                    customIcons: []
                },
                show: true
            },
            animations: {
                enabled: animate ? animate === 'true' ? true : false : true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: false,
                    delay: 100
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                },

            }
        },
        xaxis: {
            categories: "datetime",
            tickAmount: ticks ? parseInt(ticks) : undefined,
            labels: {
                style: {
                    colors: '#ffffff',
                    fontSize: '16px',
                    fontWeight: 800,
                }
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#ffffff',
                    fontSize: '16px'
                }
            },
            min: min ? parseInt(min) : undefined
        },
        series: partyQueryToData(party),
        stroke: {
            show: type === 'line' || type === 'area' ? true : false,
            lineCap: 'round',
            curve: 'smooth',
            width: 6,
            dashArray: 0,
        },
        plotOptions: {
            bar: {
                borderRadius: 0,
                horizontal: swap === 'true' ? true : false,
                dataLabels: {
                    position: 'top'
                },
                distributed: true,
                columnWidth: '70%',
            },
        },
        dataLabels: {
            enabled: labels ? labels === 'true' ? true : false : true,
            textAnchor: 'middle',
            style: {
                fontSize: '18px',
                fontWeight: 500,
                colors: ['#000000']
            },
            background: {
                enabled: true,
                // padding: 8,
                borderRadius: 2,
                borderWidth: 1,
                borderColor: '#000000',
                opacity: 1,
            },
            offsetY: swap === 'true' ? 0 : type === 'bar' ? -16 : 0,
            offsetX: swap === 'true' ? type === 'bar' ? -10 : 0 : 0
        },
        legend: {
            show: false
        },
        fill: {
            opacity: 1,
            gradient: {
                enabled: true,
                opacityFrom: .05,
                opacityTo: .6
            }
        },
        tooltip: {
            enabled: false
        }
    };
    res.render('chart',
        {
            chart: options,
            title: title ? title : '',
            sub: subline ? subline : '',
            size: size ? size / 100 : '1',
            width: size ? `${parseInt(size) / 100 * 1920}px` : '1920px',
            height: size ? `${parseInt(size) / 100 * 1080}px` : '1080px'
        })
})

app.get('/map', (req, res) => {

    if (!req.query.lat || !req.query.lng || !req.query.zoom || !req.query.cities) {
        return res.redirect('/map?lat=47.5&lng=35&zoom=7&cities=30')
        // return res.status(400).send('missing query: try /map?lat=47.5&lng=35&zoom=7&cities=30')
    }

    console.log(req.query)
    return res.render('maps', {
        specs: req.query
    })

})

app.get('/geojson', async (req, res) => {
    // const filePath = path.join(__dirname, 'db', 'ukrBorders.geojson');
    const results = await geoJson.forCountry(req.query.value);
    return res.json(results)
})

app.get('/ua-cities', async (req, res) => {
    const filePath = path.join(__dirname, 'db', 'uaCities.json');

    // Read the file asynchronously
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        try {
            // Parse the file content as JSON
            const cities = JSON.parse(data);
            // Send the parsed JSON as the response
            return res.json(cities)

        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            res.status(500).send('Internal Server Error');
        }
    });
})

app.listen(port, () => {
    var d = new Date(Date.now());
    console.log(d.toString().split('GMT')[0].trim(), `Lagezentrum running on ${localIpAddress()}:${port}`);
})


// Additional Functions

// Function to create a thumbnail using ffmpeg
async function createThumbnail(inputPath, outputPath, filename) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .screenshots({
                timestamps: ['95%'],
                filename: filename,
                folder: outputPath,
                // size: '960x540',
            });
    });
}
function getVideoInfo(videoPath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                reject(err);
                return;
            }

            const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');

            if (!videoStream) {
                reject(new Error('No video stream found in the file.'));
                return;
            }

            const framerateParts = videoStream.r_frame_rate.split('/');
            const numerator = parseInt(framerateParts[1], 10);
            const denominator = parseInt(framerateParts[0], 10);
            const durationOfOneFrame = numerator / denominator;

            const videoInfo = {
                resolution: videoStream.width / videoStream.height === 16 / 9 ? true : false,
                framerate: durationOfOneFrame,
            };

            resolve(videoInfo);
        });
    });
}
function replaceFileExtension(fileName, ext) {
    // Find the last occurrence of a dot (.) in the file name
    const dotIndex = fileName.lastIndexOf('.');

    // Check if a dot is found and it's not the first character of the file name
    if (dotIndex !== -1 && dotIndex !== 0) {
        // Extract the file name without the extension
        const baseName = fileName.substring(0, dotIndex);

        // Concatenate the base name with the new extension ".jpg"
        const newFileName = baseName + ext;

        return newFileName;
    } else {
        // If no dot is found or it's the first character, simply append ".jpg" to the file name
        return fileName + ext;
    }
}
async function getFoldersWithLayout(directoryPath) {
    try {
        // Read the contents of the directory
        const files = await fsm.readdir(directoryPath);

        // Filter out only directories
        const directories = await Promise.all(
            files.map(async (file) => {
                const fullPath = path.join(directoryPath, file);
                const stat = await fsm.stat(fullPath);

                return { name: file, path: fullPath, isDirectory: stat.isDirectory(), ctime: stat.ctime };
            })
        );

        // Filter out only directories and sort them by creation time
        const sortedDirectories = directories
            .filter((dir) => dir.isDirectory)
            .sort((a, b) => b.ctime.getTime() - a.ctime.getTime());

        // Attach layout.json content to each directory
        const directoriesWithLayout = await Promise.all(
            sortedDirectories.map(async (dir) => {
                try {
                    const layoutPath = path.join(dir.path, 'layout.json');
                    const layoutContent = await fsm.readFile(layoutPath, 'utf8');
                    dir.layout = JSON.parse(layoutContent);
                } catch (error) {
                    // Handle errors if layout.json is not found or invalid JSON
                    dir.layout = null;
                }

                return dir;
            })
        );

        return directoriesWithLayout;
    } catch (error) {
        // Handle errors while reading the directory or files
        console.error('Error:', error.message);
        return [];
    }
}
function partyQueryToData(parties) {

    const partiesArray = partyQueryToArray(parties)

    const filePath = path.join(__dirname, '/db/insa.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    const data = jsonData.reverse();

    if (partiesArray.length > 1) {
        const multiArray = [];
        for (i = 0; i < partiesArray.length; i++) {

            const single = data.map((entry) => {
                return {
                    x: entry["Date"],
                    y: entry[`${partiesArray[i]}`],
                };
            });

            multiArray.push({ data: single })
        }
        return multiArray
    } else {
        const multiArray = [];
        const singleP = data.map(entry => {
            return {
                x: entry["Date"],
                y: entry[`${partiesArray[0]}`],
            };
        });
        multiArray.push({ data: singleP })

        return multiArray
    }
}
function partyQueryToColors(parties) {

    const partiesArray = partyQueryToArray(parties)

    const filePath = path.join(__dirname, '/db/partiesColors.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    console.log(jsonData[0][`${partiesArray[0]}`])


    const colorsArray = [];
    for (i = 0; i < partiesArray.length; i++) {
        colorsArray.push(jsonData[0][`${partiesArray[i]}`])
    };
    return colorsArray
}
function partyQueryToArray(inputString) {
    if (inputString.includes(',')) {
        // If the string contains a comma, split it into an array
        return inputString.split(',');
    } else {
        // If there is no comma, create an array with the input string as the only element
        return [inputString];
    }
}

function moveFileAsync(source, destination) {

    return new Promise((resolve, reject) => {
        fs.rename(source, destination, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

}


function listImages(folderPath) {
    console.log(folderPath)
    const files = fs.readdirSync(folderPath);

    const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ext === '.png' || ext === '.jpg' || ext === '.jpeg';
    });

    const imagePaths = imageFiles.map(file => path.join(folderPath, file));
    return imagePaths;
}
function generateInlineCSS(size) {
    const parsedSize = size ? parseInt(size) : 100;

    const width = size ? `${parsedSize / 100 * 1920}px` : `1920px`;
    const height = size ? `${parsedSize / 100 * 1080}px` : `1080px`;

    return `scale:${size ? size / 100 : 1};width:${width};height:${height};`;
}


