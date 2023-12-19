// Handle Menu Pos
var menuPos = true;
function handleMenuPos(selection) {

    if (selection === undefined) {
        menuPos = !menuPos
    } else {
        menuPos = selection
    }


    gsap.to("#theMenu",
        {
            top: menuPos ? 760 : 1000,
            opacity: menuPos ? 1 : 1,
            duration: 1,
            ease: "power2.inOut"

        });

    gsap.to("#listTitles",
        {
            top: menuPos ? 90 : -22,
            scale: menuPos ? 1 : .8,
            duration: 1,
            ease: "power2.inOut"

        });

    gsap.to("#bottom-dark-blur",
        {
            opacity: menuPos ? 1 : .5,
            duration: 1,
            ease: "power2.inOut"

        });

    gsap.to("#left-dark-blur",
        {
            top: menuPos ? -500 : -1800,
            duration: 1,
            ease: "power2.inOut"

        });

    gsap.to("#menuPosIcon",
        {
            rotation: menuPos ? 0 : -540,
            duration: 1,
            ease: "power2.inOut"
        });

    gsap.to('#menuToggle',
        {
            top: menuPos ? 0 : 240,
            duration: 1,
            ease: "power2.inOut"
        });

    // gsap.to('#video',
    //     {
    //         opacity: menuPos ? .8 : 1,
    //         duration: 1,
    //         ease: "power2.inOut"
    //     })

}
setTimeout(() => {
    gsap.fromTo("#theMenu",
        {
            top: 1000,
            opacity: 0
        },
        {
            top: 760,
            opacity: 1,
            duration: 2,
            delay: .2,
            ease: "power2.inOut"

        });

    gsap.fromTo("#videoTitleToggle",
        {
            opacity: 0
        },
        {
            opacity: 1,
            duration: 2,
            delay: .2,
            ease: "power2.inOut"
        });


    gsap.fromTo("#menuToggle",
        {
            opacity: 0,
            top: 240
        },
        {
            top: 0,
            opacity: 1,
            duration: 2,
            delay: .2,
            ease: "power2.inOut"
        });
}, 100)


// Handle Scroll
var scrollPos = true;
function handleScrollPos() {

    gsap.to("#theMenu",
        {
            left: 0,
            duration: 1,
            ease: "power2.inOut"
        });
}


// Handle Select
var selectedElement = "b_0"
var menuLeft = 0;
function handleSelect(newID) {

    if (newID !== selectedElement) {

        // TO HOME
        if (newID === "b_0") {
            gsap.fromTo("#mainTitle",
                { scale: 1.5, opacity: 0 },
                {
                    duration: 2,
                    scale: 1,
                    opacity: 1,
                    ease: "power2.out"
                });

            gsap.fromTo("#video",
                { scale: 1.25 },
                {
                    duration: 2,
                    scale: 1,
                    ease: "power2.inOut"
                });

            // TO VIDEO

        } else {
            gsap.fromTo("#mainTitle",
                { opacity: 1 },
                {
                    duration: 0,
                    opacity: 0,
                    ease: "power2.inOut"
                });

        }

        gsap.fromTo("#video",
            { opacity: 0 },
            {
                duration: 1,
                opacity: 1,
                ease: "power2.inOut"
            });

        gsap.to(`#${newID}`,
            {
                duration: .8,
                width: 360,
                ease: "power2.inOut"
            });

        gsap.to(`#${selectedElement}`,
            {
                duration: .8,
                width: 120,
                ease: "power2.inOut"
            });

        gsap.to("#theMenu",
            {
                left: newID !== 'b_0'
                    ? -(parseInt(newID.split('_')[1]) - 1) * 160 + 8 * parseInt(newID.split('_')[1]) - 8
                    : -(parseInt(newID.split('_')[1])) * 160 + 8 * parseInt(newID.split('_')[1]),
                duration: 1,
                ease: "power2.inOut"
            });


        selectedElement = newID;

    }

    if (menuPos) {

        setTimeout(() => {
            handleMenuPos()
        }, 500)
    }
}
setTimeout(() => {
    gsap.fromTo("#video",
        { scale: 1.25, opacity: 0 },
        {
            duration: 2,
            scale: 1,
            opacity: 1,
            ease: "power2.inOut"
        });

    gsap.fromTo("#mainTitle",
        { scale: 1.5, opacity: 0 },
        {
            duration: 2,
            scale: 1,
            opacity: 1,
            ease: "power2.out"
        });
}, 100);


// Create Layout
var listLength = 0;
function getLayout() {

    fetch(document.getElementById('endPoint').getAttribute('name')).then((response) => response.json()).then((json) => {

        var layout = ''; // Initialize layout variabl        listLength = json.length;
        for (l = 1; l < json.length; l++) {
            var filenameArr = json[l].file.split('storage-ukr')[1].substring(1);
            const { type, title, time, start, end, loop, mute, ctrl, info, name } = json[l];

            layout += ` 
            <div onclick="handleTitles('${type}', '${title}', '${time}'); handleSelect(this.id); 
            playVideo('/assets/storage-ukr/${filenameArr}${addVidRange(start, end)}', '${loop ? 'loop' : 'notloop'}', '${mute ? 'muted' : 'unmuted'}', '${ctrl ? 'withPlayButtons' : 'noPlayButtons'}', '${info.resolution ? '1' : '0'}', '${info.fps}');" 
                class="card-in-menu"    
                id="b_${l}" 
                style="background-image: linear-gradient(180deg, rgba(0, 0, 0, 0) -50%, black 150%), 
                url(/assets/storage-ukr/${replaceFileExtension(filenameArr)});">
                <div id="listTitles" class="title-in-menu">
                    ${name}
                </div>
            </div>`

        }

        document.getElementById('theMenu').innerHTML += layout;

        // drag the menu


        // Select the movable div
        const movableDiv = document.getElementById('theMenu');

        // Initialize touch-related variables
        let isDragging = false;
        let startX = 0;
        let initialLeft = 0;

        // Add touch event listeners
        movableDiv.addEventListener('touchstart', (event) => {
            isDragging = true;
            startX = event.touches[0].clientX;
            initialLeft = parseFloat(window.getComputedStyle(movableDiv).left);
        });

        movableDiv.addEventListener('touchmove', (event) => {
            if (isDragging) {
                const touchX = event.touches[0].clientX;
                const moveX = touchX - startX;
                const newLeft = clamp(initialLeft + moveX, -listLength * 168 + 360, 0);

                // Update the left property using GSAP for smooth animation
                gsap.to(movableDiv, { left: newLeft });
            }
        });

        movableDiv.addEventListener('touchend', () => {
            isDragging = false;
        });

        movableDiv.addEventListener('touchcancel', () => {
            isDragging = false;
        });

    });

}
function handleTitles(icon, title, time) {
    document.getElementById('video-icon').style.backgroundImage = `url(/assets/gp/${icon}.png)`;
    document.getElementById('video-title').textContent = title;
    document.getElementById('video-timestamp').textContent = time;
}
getLayout();


// handle plays
function playVideo(path, loop, volume = "muted", PlayButtons = "withPlayButtons", reqBG, fps) {
    var video = document.getElementById("video");
    var videoBg = document.getElementById("video-bg")
    var seek = document.getElementById("seek");

    frameTime = parseInt(fps)

    video.setAttribute('src', path)
    video.setAttribute('type', `video/${getFileExtension(path)}`)

    if (reqBG === '0') {
        videoBg.setAttribute('src', path)
        videoBg.setAttribute('type', `video/${getFileExtension(path)}`)
    }

    if (reqBG === '1') {
        videoBg.setAttribute('src', '')
        videoBg.setAttribute('type', '')
    }



    if (PlayButtons == "withPlayButtons") {
        gsap.to('#seek', {
            opacity: 1,
            delay: .4
        })
        // document.getElementById("pause-icon").hidden = false
    } else {
        gsap.to('#seek', {
            opacity: 0,
            duration: .4
        })
        // document.getElementById("pause-icon").hidden = true
    }



    if (loop == "loop" || loop == "true") {
        video.loop = true;
        videoBg.loop = true;
    } else {
        video.loop = false;
        videoBg.loop = false
    }

    if (volume == "muted") {
        video.muted = true;
        video.volume = 0;
        videoBg.muted = true;
        videoBg.volume = 0;
    } else {
        video.muted = false;
        video.volume = 1;
        videoBg.muted = true;
        videoBg.volume = 0;
    }
}

var playButton = document.getElementById('play-icon');
var video = document.getElementById('video'), frameTime = 1 / 25;
var videoBg = document.getElementById('video-bg'), frameTime = 1 / 25;
var seekslider = document.getElementById("seekslider");

video.addEventListener("pause", (event) => {
    playButton.classList.replace('pause-icon', 'play-icon');
});

video.addEventListener("play", (event) => {
    playButton.classList.replace('play-icon', 'pause-icon');
});

seekslider.addEventListener("input", vidSeek, false);
video.addEventListener("timeupdate", seektimeupdate, false);
video.ontimeupdate = function () { timecodeUpdate() };

var play = true;
let isTimeDragging = false;

function pauseVideo() {
    video.pause();
}
function ctrlPlayVideo() {
    video.play();
    videoBg.play();
}
function handlePlays() {
    play = !play;
    if (play) {
        video.play();
        videoBg.play();
    } else {
        video.pause();
        videoBg.pause();

    }
}
function framePlus() {
    video.currentTime = Math.min(video.duration, video.currentTime + frameTime);
}
function frameMinus() {
    video.currentTime = Math.max(0, video.currentTime - frameTime);
}
function vidSeek() {
    // pauseVideo();
    var seekto = video.duration * (seekslider.value / 1500);
    video.currentTime = seekto;
    videoBg.currentTime = seekto;
}
function seektimeupdate() {
    var nt = video.currentTime * (1500 / video.duration);
    seekslider.value = nt;
}
function timecodeUpdate() {
    // Display the current position of the video in a <p> element with id="demo"
    document.getElementById("timecode").innerHTML = formatSecondsAsTime(video.currentTime);
}
function formatSecondsAsTime(secs, format) {
    var hr = Math.floor(secs / 3600);
    var min = Math.floor((secs - (hr * 3600)) / 60);
    var sec = Math.floor(secs - (hr * 3600) - (min * 60));
    if (min < 10) {
        min = "0" + min;
    }
    if (sec < 10) {
        sec = "0" + sec;
    }

    return min + ':' + sec;


}


// Handle draw
var canvas = document.getElementById('paintCanvas');
var context = canvas.getContext('2d');
var painting = false;
var drawOnScreen = false;
var isBlinking = false;
var drawColor = "#080808"
function manageColors(color) {
    drawColor = color;
}
function manageDraws() {
    if (!drawOnScreen) {
        canvas.hidden = false;
        startPainting()
    } else {
        stopPainting();
        clearCanvas();
    }

    drawOnScreen = !drawOnScreen;
    // canvas.hidden = !drawOnScreen


    gsap.to('#art-icon',
        {
            opacity: drawOnScreen ? 1 : .5,
            duration: 0.5
        });
    gsap.to('#blue-circle',
        {
            scale: drawOnScreen ? 1 : 0,
            delay: !drawOnScreen ? 0.15 : 0,
            duration: .6,
            ease: !drawOnScreen ? 'power4.in' : 'power4.out'
        });
    gsap.to('#red-circle',
        {
            scale: drawOnScreen ? 1 : 0,
            delay: !drawOnScreen ? 0.1 : 0.05,
            duration: .6,
            ease: !drawOnScreen ? 'power4.in' : 'power4.out'
        });
    gsap.to('#black-circle',
        {
            scale: drawOnScreen ? 1 : 0,
            delay: !drawOnScreen ? 0.05 : 0.1,
            duration: .6,
            ease: !drawOnScreen ? 'power4.in' : 'power4.out'
        });
    gsap.to('#white-circle',
        {
            scale: drawOnScreen ? 1 : 0,
            delay: !drawOnScreen ? 0 : 0.15,
            duration: .6,
            ease: !drawOnScreen ? 'power4.in' : 'power4.out'
        });

}
function startPainting() {
    canvas.addEventListener('touchstart', function (e) {
        startPosition(e.touches);
    });
    canvas.addEventListener('touchend', endPosition);
    canvas.addEventListener('touchmove', function (e) {
        e.preventDefault();
        draw(e.touches);
    });
    gsap.to('#paintCanvas',
        {
            opacity: drawOnScreen ? 0 : 1,
            duration: .5
        })
}
function stopPainting() {
    canvas.removeEventListener('touchstart', function (e) {
        startPosition(e.touches);
    });
    canvas.removeEventListener('touchend', endPosition);
    canvas.removeEventListener('touchmove', function (e) {
        e.preventDefault();
        draw(e.touches);
    });
}
function clearCanvas() {
    gsap.to('#paintCanvas',
        {
            opacity: drawOnScreen ? 0 : 1,
            duration: .5,
            onComplete: function () { canvas.hidden = true; context.clearRect(0, 0, canvas.width, canvas.height) }
        })
}
function startPosition(touches) {
    painting = true;
    draw(touches);
}
function endPosition() {
    painting = false;
    context.beginPath();
}
function draw(touches) {
    if (!painting) return;

    context.lineWidth = 5;
    context.lineCap = 'round';
    context.lineJoin = 'round'
    context.strokeStyle = drawColor;

    for (var i = 0; i < touches.length; i++) {
        context.lineTo(touches[i].clientX - canvas.offsetLeft, touches[i].clientY - canvas.offsetTop);
        context.stroke();
        context.beginPath();
        context.moveTo(touches[i].clientX - canvas.offsetLeft, touches[i].clientY - canvas.offsetTop);
    }
}

// Function to handle arrow key press
function handleArrowKeyPress(event) {
    // Check which arrow key is pressed based on the key code
    switch (event.keyCode) {
        case 37: // Left arrow key
            console.log("Left arrow key pressed!");
            handleScrollPos(true)
            break;
        case 38: // Up arrow key
            console.log("Up arrow key pressed!");
            handleMenuPos(true)
            break;
        case 39: // Right arrow key
            console.log("Right arrow key pressed!");
            handleScrollPos(false)
            break;
        case 40: // Down arrow key
            console.log("Down arrow key pressed!");
            handleMenuPos(false)
            break;
        case 32: // Down arrow key
            console.log("Space arrow key pressed!");
            handlePlays()
            break;
        default:
        // Do nothing for other keys
    }
}

// Adding the event listener to the document
document.addEventListener("keydown", handleArrowKeyPress);


// Additional functions
function replaceFileExtension(fileName) {
    // Find the last occurrence of a dot (.) in the file name
    const dotIndex = fileName.lastIndexOf('.');

    // Check if a dot is found and it's not the first character of the file name
    if (dotIndex !== -1 && dotIndex !== 0) {
        // Extract the file name without the extension
        const baseName = fileName.substring(0, dotIndex);

        // Concatenate the base name with the new extension ".jpg"
        const newFileName = baseName + '.jpg';

        return newFileName;
    } else {
        // If no dot is found or it's the first character, simply append ".jpg" to the file name
        return fileName + '.jpg';
    }
}

function getVideoFrameRate(videoElement) {
    if (!(videoElement instanceof HTMLVideoElement)) {
        console.error('Provided element is not a video tag');
        return null;
    }

    // Check if metadata is loaded
    if (!videoElement.videoWidth || !videoElement.videoHeight) {
        console.error('Video metadata not loaded');
        return null;
    }

    // Get the total number of frames and the duration
    const totalFrames = videoElement.webkitDecodedFrameCount;
    const duration = videoElement.duration;

    // Calculate the frame rate
    const frameRate = totalFrames / duration;

    return frameRate;
}

function getFileExtension(fileName) {
    // Split the file name by dot (.)
    const parts = fileName.split('.');

    // If there is more than one part, consider the last part as the extension
    if (parts.length > 1) {
        return parts[parts.length - 1].toLowerCase();
    } else {
        // If there is only one part or no parts, the file has no extension
        return '';
    }
}

function clamp(value, min, max) {
    if (value < min) { return min } else if (value > max) { return max } else { return value }
}

function addVidRange(startTime, endTime) {

    let timeRange = '';
    if (parseInt(startTime) !== undefined && parseInt(endTime) !== undefined) {
        timeRange = `#t=${startTime},${endTime}`;
    } else if (parseInt(startTime) !== undefined) {
        timeRange = `#t=${startTime}`;
    } else if (parseInt(endTime) !== undefined) {
        timeRange = `#t=0,${endTime}`;
    }

    return timeRange
}