const fs = require('fs');
const fsm = require('fs').promises;


const chart = async (req, res) => {
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
}

const ukMap = async (req, res) => {
    if (!req.query.lat || !req.query.lng || !req.query.zoom || !req.query.cities) {
        return res.redirect('/map?lat=47.5&lng=35&zoom=7&cities=30')
        // return res.status(400).send('missing query: try /map?lat=47.5&lng=35&zoom=7&cities=30')
    }

    console.log(req.query)
    return res.render('maps', {
        specs: req.query
    })
}

const uaCities = async (req, res) => {
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
}

const insa = async (req, res) => {
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
}

const geojson = async (req, res) => {
    // const filePath = path.join(__dirname, 'db', 'ukrBorders.geojson');
    const results = await geoJson.forCountry(req.query.value);
    return res.json(results)
}

module.exports = { chart, ukMap, uaCities, insa, geojson }


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
