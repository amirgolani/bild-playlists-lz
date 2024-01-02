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

app.get('/present', (req, res) => {

    const { gp, title, subline, playlist, size } = req.query;

    switch (gp) {
        case 'lz-ukr': // Left arrow key
            res.render('present-vid-player',
                {
                    bg: '/assets/gp/BGUKR.webm',
                    vidType: 'video/webm',
                    headline: '/assets/gp/titles-ukr.png',
                    thumbnail: '/assets/gp/HOMEUKR.jpg',
                    icon: 'gallery',
                    title: title,
                    sub: subline,
                    endpoint: playlist,
                    size: size ? size / 100 : '1',
                    width: size ? `${parseInt(size) / 100 * 1920}px` : '1920px',
                    height: size ? `${parseInt(size) / 100 * 1080}px` : '1080px'
                })
            break;
        case 'lz-isr': // Up arrow key
            res.render('present-vid-player',
                {
                    bg: '/assets/gp/BGISR.webm',
                    vidType: 'video/webm',
                    headline: '/assets/gp/titles-isr.png',
                    thumbnail: '/assets/gp/HOMEISR.jpg',
                    icon: 'gallery',
                    title: title,
                    sub: subline,
                    endpoint: playlist,
                    size: size ? size / 100 : '1',
                    width: size ? `${parseInt(size) / 100 * 1920}px` : '1920px',
                    height: size ? `${parseInt(size) / 100 * 1080}px` : '1080px'
                })
            break;
        case 'bild': // Up arrow key
            res.render('present-vid-player',
                {
                    bg: '/assets/gp/BGBILD.webm',
                    vidType: 'video/webm',
                    headline: '',
                    thumbnail: '/assets/gp/HOMEBILD.jpg',
                    icon: 'gallery',
                    title: title,
                    sub: subline,
                    endpoint: playlist,
                    size: size ? size / 100 : '1',
                    width: size ? `${parseInt(size) / 100 * 1920}px` : '1920px',
                    height: size ? `${parseInt(size) / 100 * 1080}px` : '1080px',
                })
            break;
        default: res.redirect('/playlists')
        // Do nothing for other keys
    }
});

app.get('/playlists', (req, res) => {

    res.render('present-playlists')

});

app.get('/create', (req, res) => {
    const { gp } = req.query;

    if (gp === 'ukr') {
        return res.render('create-ukr')
    }

    return res.render('create')

});

app.post('/create-playlist', (req, res) => {

    const { title, subline, gp } = req.query
    const form = new formidable.IncomingForm({
        multiples: true,
        maxFileSize: 2 * 1024 * 1024 * 1024, // 2 GB limit
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error parsing the form' });
        }

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
            // const link = files[`link_${i}`];

            if (file) {

                const newFilePath = path.join(storagePath, file[0].originalFilename);

                // Move the file to the storage directory
                fs.renameSync(file[0].filepath, newFilePath);

                if (file[0].mimetype.split('/')[0] === 'video') {

                    const videoInfo = await getVideoInfo(newFilePath)

                    await createThumbnail(newFilePath, storagePath, replaceFileExtension(file[0].originalFilename, '.jpg'));

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
                        file: newFilePath,
                        thumb: replaceFileExtension(newFilePath, '.jpg'),
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
                        file: newFilePath,
                        mime: file[0].mimetype,
                    });
                }
            }

            // if (!file) {
            //     jsonData.push({
            //         name,
            //         title,
            //         time,
            //         type,
            //         mime: file[0].mimetype
            //     });
            // }


        }

        jsonData.unshift({
            lastUpdate: Date.now(),
            url: `/present?gp=${gp}&playlist=${newFolder}&title=${title}&subline=${subline}`,
            gp: gp,
            title: title,
            subline: subline
        })

        // Create JSON file
        const jsonFilePath = path.join(dbPath, `layout.json`);
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));

        var d = new Date(Date.now());
        console.log(chalk.yellowBright(d.toString().split('GMT')[0], `playlist`, newFolder, 'created'));
        res.json({ url: `/present?gp=${gp}&playlist=${newFolder}&title=${title}&subline=${subline}` });
    });
});

app.get('/layout', (req, res) => {
    const playlist = req.query.playlist;
    const filePath = path.join(__dirname, 'public', 'playlists', playlist, 'layout.json');

    console.log(req.query.playlist)

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
                size: '960x540',
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

function trimTo(inputString, trim) {
    // Check if the input string is not empty and has at least 6 characters
    if (inputString && inputString.length >= trim) {
        // Use the slice method to extract the first 6 characters
        return inputString.slice(0, trim);
    } else {
        // If the string is empty or has fewer than 6 characters, return the original string
        return inputString;
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




