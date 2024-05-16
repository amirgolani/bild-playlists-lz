const endPoint = document.getElementById("endPoint");
const playlist = endPoint.getAttribute("name");

const videoPlayer = document.getElementById("videoPlayer");
const videoBg = document.getElementById("video-bg");
const video = document.getElementById("video");
const bg = video.getAttribute("src");
const vidType = video.getAttribute("type");

const imageDisplay = document.getElementById("imageDisplay");
const backImage = document.getElementById("backImage");
const frontImage = document.getElementById("frontImage");
const mainImage = document.getElementById("mainImage");

const webDisplay = document.getElementById("webDisplay");
const webIframe = document.getElementById("webIframe");

const bottomDarkBlur = document.getElementById("bottom-dark-blur");
const layoutBuildUp = document.getElementById("layoutBuildUp");
const theMenu = document.getElementById("theMenu");
const paintCanvas = document.getElementById("paintCanvas");
const videoTitleToggle = document.getElementById("videoTitleToggle");
const playingTitle = document.getElementById("playing-title");
const playlistsIcon = document.getElementById("playlists-icon");
const menuToggleIcon = document.getElementById("menuToggle");
const seek = document.getElementById("seek");
const playIcon = document.getElementById("play-icon");
const seekSlider = document.getElementById("seekslider");
const zoomIcon = document.getElementById("zoom-icon");
const menuPosIcon = document.getElementById("menuPosIcon");
const homeIcon = document.getElementById("home-icon");
const artIcon = document.getElementById("art-icon");
const drawBlue = document.getElementById('blue-circle')
const drawRed = document.getElementById('red-circle')
const drawGreen = document.getElementById('green-circle')
const drawYellow = document.getElementById('yellow-circle')
const drawWhite = document.getElementById('black-circle')
const drawBlack = document.getElementById('white-circle')
const eraseSquare = document.getElementById("erase-square");

var drawOnScreen = false;
var play = true;
var menuPos = true;
var scrollPos = true;
var selectedElement = "b_0"
var menuLeft = 0;
var zoomed = false


// Start
setTimeout(() => {
    gsap.fromTo(theMenu,
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

    gsap.fromTo(videoTitleToggle,
        {
            opacity: 0
        },
        {
            opacity: 1,
            duration: 1,
            delay: 1,
            ease: "power2.inOut"
        });

    gsap.fromTo(menuToggleIcon,
        {
            top: 240
        },
        {
            top: 0,
            duration: 2,
            delay: .2,
            ease: "power2.inOut"
        });
    gsap.fromTo(video,
        { scale: 1.25, opacity: 0 },
        {
            scale: 1,
            opacity: 1,
            duration: 2,
            ease: "power2.inOut"
        });
}, 100)

getLayout();

// Handle Menu Pos
function handleMenuPreview(selection, gesture) {

    if (drawOnScreen) {
        manageDraws()
    }

    if (selection === undefined) {
        menuPos = !menuPos
    } else {
        menuPos = selection
    }

    gsap.to(theMenu,
        {
            top: menuPos ? 760 : 996,
            duration: !gesture ? 1 : gesture,
            ease: "power2.inOut"

        });

    gsap.to("#listTitles",
        {
            top: menuPos ? 90 : -5,
            duration: !gesture ? 1 : gesture,
            ease: "power2.inOut"

        });

    gsap.to(bottomDarkBlur,
        {
            opacity: menuPos ? 1 : .5,
            duration: !gesture ? 1 : gesture,
            ease: "power2.inOut"

        });

    gsap.to(menuPosIcon,
        {
            rotation: menuPos ? 0 : -540,
            duration: !gesture ? 1 : gesture,
            ease: "power2.inOut"
        });

    gsap.to(menuToggleIcon,
        {
            top: menuPos ? 0 : 236,
            duration: !gesture ? 1 : gesture,
            ease: "power2.inOut"
        });

}

// Handle Select
function handleSelect(newSelection) {

    if (newSelection !== selectedElement) {

        // TO HOME
        if (newSelection === "b_0") {

            gsap.fromTo(videoTitleToggle,
                {
                    opacity: 0,
                    onStart: function () { videoTitleToggle.hidden = false }

                },
                {
                    opacity: 1,
                    duration: 2,
                    delay: .2,
                    ease: "power2.inOut",

                });

            gsap.fromTo(video,
                { scale: 1.25 },
                {
                    duration: 2,
                    scale: 1,
                    ease: "power2.inOut"
                });

            drawOnScreen = true;
            manageDraws();

            setTimeout(() => { handleMenuPreview(true) }, 500)

        } else {
            gsap.set(videoTitleToggle,
                {
                    onStart: function () { videoTitleToggle.hidden = true },
                    opacity: 0,
                });

            handleMenuPreview(false)
        }

        gsap.to(playlistsIcon,
            {
                onStart: newSelection === "b_0" ? function () { playlistsIcon.hidden = false } : function () { },
                opacity: newSelection === "b_0" ? .6 : 0,
                ease: "power2.out",
                onComplete: newSelection !== "b_0" ? function () { playlistsIcon.hidden = true } : function () { }

            })

        gsap.fromTo(video,
            { opacity: 0 },
            {
                duration: 1,
                opacity: 1,
                ease: "power2.inOut"
            });

        gsap.to(`#${newSelection}`,
            {
                duration: .8,
                width: 360,
                ease: "power2.inOut"
            });

        gsap.to(`#${selectedElement}`,
            {
                duration: .8,
                width: 140,
                ease: "power2.inOut"
            });

        const index = parseInt(newSelection.split('_')[1]);

        gsap.to(theMenu,
            {
                left: newSelection !== 'b_0'
                    ? -(index - 1) * 160 - 14 * (index - 1) + 240
                    : 240,
                duration: 1,
                ease: "power2.inOut"
            });

        gsap.to(menuToggleIcon,
            {
                opacity: newSelection !== 'b_0'
                    ? 1
                    : 0,
                duration: 1,
                ease: "power2.inOut"
            })

        previewAllCards()

        play = true;
        selectedElement = newSelection;

    }

}

// Create Layout
function getLayout() {

    fetch(`/layout?playlist=${playlist}`)
        .then((response) => response.json())
        .then((json) => {
            var layout = '';

            for (l = 1; l < json.length; l++) {

                const { type, title, time, start, end, loop, mute, ctrl, info, name, mime, file, thumb, link } = json[l];

                if (mime.split('/')[0] === 'video') {

                    layout += ` 
                        <div onclick="handleSelect(this.id); setImage(''); setUrl('');
                        playVideo('/assets/playlists/${playlist}/storage/${file}${start || end ? addVidRange(start, end) : ''}', '${loop ? 'loop' : 'notloop'}', '${mute ? 'muted' : 'unmuted'}', '${ctrl ? 'withPlayButtons' : 'noPlayButtons'}', '${info.resolution ? '1' : '0'}', '${info.fps}');" 
                            class="card-in-menu"    
                            id="b_${l}" 
                            style="background-image: linear-gradient(180deg, rgba(0, 0, 0, 0) -50%, black 150%), 
                            url(/assets/playlists/${playlist}/storage/${thumb});">
                            <div id="listTitles" class="title-in-menu">
                                ${name}
                            </div>
                        </div>`
                }

                if (mime.split('/')[0] === 'image') {
                    layout += ` 
                        <div onclick="handleSelect(this.id); setImage('/assets/playlists/${playlist}/storage/${file}')
                        playVideo('', 'notloop', 'muted', 'noPlayButtons', '0', ''); setUrl('')" 
                            class="card-in-menu" 
                            id="b_${l}" 
                            style="background-image: linear-gradient(180deg, rgba(0, 0, 0, 0) -50%, black 150%), 
                            url(/assets/playlists/${playlist}/storage/${file});">
                            <div id="listTitles" class="title-in-menu">
                                ${name}
                            </div>
                        </div>`
                }

                if (mime.split('/')[0] === 'web') {
                    layout += ` 
                    <div onclick="handleSelect(this.id); setImage('');
                    playVideo('', 'notloop', 'muted', 'noPlayButtons', '0', ''); setUrl('${link}')" 
                        class="card-in-menu"    
                        id="b_${l}" 
                        style="background-image: linear-gradient(180deg, rgba(0, 0, 0, 0) -50%, black 150%), 
                        url(/assets/gp/WEBTHUMB.jpg);">
                        <div id="listTitles" class="title-in-menu">
                            ${name}
                        </div>
                    </div>`
                }
            }
            theMenu.innerHTML += layout;
        });
}

// Initialize touch-related variables
let isDragging = false;
let startX = 0;
let startY = 0;
let initialLeft = 0;

// Add touch event listeners
theMenu.addEventListener('touchstart', (event) => {
    isDragging = true;
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
    initialLeft = parseFloat(window.getComputedStyle(theMenu).left);
});

theMenu.addEventListener('touchmove', (event) => {
    if (isDragging) {
        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;
        const moveX = 2 * (touchX - startX);
        const moveY = touchY - startY;

        if (Math.abs(moveX) > Math.abs(moveY)) {
            // Horizontal movement
            const newLeft = Math.min(Math.max(initialLeft + moveX, (240 - (theMenu.children.length) * 170) + 160), 240);
            gsap.set(theMenu,
                {
                    left: newLeft,
                    onComplete: function () {
                        // Update the menu items opacity based on their position
                        var children = theMenu.children;
                        for (var i = 0; i < children.length; i++) {
                            var child = children[i];
                            var childPos = child.getBoundingClientRect();
                            gsap.to(child, {
                                opacity: childPos.left < 230 && menuPos ? .2 : 1,
                                // duration: .4,
                                ease: 'linear'
                            });
                        }
                    }
                });
        } else {
            // Vertical movement
            if (moveY < 0) {
                // Moving up
                handleMenuPreview(true, .6);
            } else {
                // Moving down
                // handleMenuPreview(false, .6);
            }
        }
    }
});

theMenu.addEventListener('touchend', () => {
    isDragging = false;
});

theMenu.addEventListener('touchcancel', () => {
    isDragging = false;
});

// Reset Scroll
function resetScrollPos() {
    previewAllCards()
    gsap.to(theMenu,
        {
            left: 240,
            duration: .6,
            ease: "power2.inOut"
        });
}



// handle plays
function playVideo(path, loop, volume = "muted", PlayButtons = "withPlayButtons", reqBG, fps) {

    if (path === video.getAttribute('src')) {
        return
    }


    var frameTime = parseInt(fps)

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

    if (PlayButtons === "withPlayButtons") {
        gsap.to(seekslider,
            {
                value: 0,
                duration: 0.25,
                ease: 'linear'
            }
        );
        gsap.fromTo(seek,
            {
                opacity: 0
            },
            {
                onStart: function () { seek.hidden = false },
                opacity: 1,
                delay: .4,

            })
    } else {
        gsap.to('#seek', {
            opacity: 0,
            duration: .4,
            onComplete: function () { seek.hidden = true },
        })
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

video.addEventListener("pause", (event) => {
    playIcon.classList.replace('pause-icon', 'play-icon');
});

video.addEventListener("play", (event) => {
    playIcon.classList.replace('play-icon', 'pause-icon');
});

seekSlider.addEventListener("input", vidSeek, false);
// seekSlider.addEventListener("change", vidSeek, false);
video.addEventListener("timeupdate", seektimeupdate, false);
// video.ontimeupdate = function () { timecodeUpdate() };

let isTimeDragging = false;

function pauseVideo() {
    video.pause();
    videoBg.pause();
    play = false;

}
function ctrlPlayVideo() {
    video.play();
    videoBg.play();
    play = true;
    if (selectedElement !== "b_0") {
        handleMenuPreview(false)

    }

}
function handlePlays() {
    play = !play;
    if (play) {
        ctrlPlayVideo()
    } else {
        pauseVideo()
    }
}
function framePlus() {
    video.currentTime = Math.min(video.duration, video.currentTime + frameTime);
}
function frameMinus() {
    video.currentTime = Math.max(0, video.currentTime - frameTime);
}
function vidSeek() {
    pauseVideo();

    var seekto = video.duration * (seekSlider.value / 1500);

    video.currentTime = seekto;
    videoBg.currentTime = seekto;
    // gsap.to(video,
    //     {
    //         currentTime: seekto,
    //         // duration: .2,
    //         ease: 'power2.out'
    //     }
    // )
    // gsap.to(videoBg,
    //     {
    //         currentTime: seekto,
    //         // duration: .2,
    //         ease: 'power2.out'
    //     }
    // )
    // ctrlPlayVideo();
    // pauseVideo();
}
function seektimeupdate() {
    var nt = video.currentTime * (1500 / video.duration);

    gsap.set(seekslider,
        {
            value: nt,
            // duration: 0.25,
            // ease: 'linear'
        }
    );
}
function timecodeUpdate() {
    // Display the current position of the video in a <p> element with id="demo"
    // document.getElementById("timecode").innerHTML = formatSecondsAsTime(video.currentTime);
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


// Handle Images

function setImage(img) {

    if (img === '') {

        gsap.to(zoomIcon,
            {
                onStart: img === '' ? function () { } : function () { zoomIcon.hidden = false },
                opacity: img === '' ? 0 : .6,
                ease: 'power1.inOut',
                duration: .6,
                onComplete: img === '' ? function () { zoomIcon.hidden = true } : function () { },
            })

        return imageDisplay.hidden = true;
    } else {
        imageDisplay.hidden = false;
    }

    // frontImage.style.backgroundImage = `url(${img})`;
    mainImage.setAttribute('src', img)
    backImage.style.backgroundImage = `url(${img})`;

    gsap.fromTo(backImage,
        {
            x: 0,
            y: 0,
            opacity: 0,
            scale: 1.1
        },
        {
            x: 0,
            y: 0,
            opacity: .3,
            scale: 1,
            ease: 'power1.inOut',
            duration: 1
        })

    gsap.fromTo(frontImage,
        {
            x: 0,
            y: 0,
            opacity: 0,
            scale: .9
        },
        {
            x: 0,
            y: 0,
            opacity: 1,
            scale: .78,
            ease: 'power1.inOut',
            duration: 1
        })

    zoomed = false

    gsap.to(zoomIcon,
        {
            onStart: img === '' ? function () { } : function () { zoomIcon.hidden = false },
            opacity: img === '' ? 0 : .6,
            ease: 'power1.inOut',
            duration: .6,
            onComplete: img === '' ? function () { zoomIcon.hidden = true } : function () { },
        })
}

function setUrl(url) {

    if (url === '') {
        webDisplay.hidden = true;
        webIframe.setAttribute('src', '');
        return
    }

    webDisplay.hidden = false;
    webIframe.setAttribute('src', url);
    webIframe.hidden = false;

    gsap.fromTo('#webDisplay',
        { opacity: 0 },
        {
            opacity: 1,
            duration: 1,
            ease: 'power2.inOut'
        })

}

function toggleZoom() {
    zoomed = !zoomed
    gsap.to(frontImage,
        {
            scale: zoomed ? 1.5 : .78,
            x: 0,
            y: 0,
            ease: 'power1.inOut',
            duration: .6
        })
}

// Image Dragging

// Use Draggable to make the element movable
const draggableImage = new Draggable(frontImage, {
    type: 'x,y', // Allow movement along the x and y axes
    edgeResistance: .8, // Resistance when dragging towards the edges
    bounds: 'body', // Restrict movement within the body of the document
});

// Example GSAP animation on drag start
draggableImage.addEventListener('dragstart', () => {
    gsap.set(frontImage, { zIndex: 0 });
});

draggableImage.addEventListener('dragend', () => {
    gsap.set(frontImage, { zIndex: 0 });
});


// Handle draw
var context = paintCanvas.getContext('2d');
var painting = false;
var isBlinking = false;
var drawColor = "#080808"
var eraseMode = false;

function manageColors(color) {
    eraseMode = false;
    drawColor = color;
}
function manageDraws() {

    if (selectedElement === 'b_0') {
        return
    }



    if (!drawOnScreen) {
        paintCanvas.hidden = false;
        startPainting()
    } else {
        stopPainting();
        clearCanvas();
    }

    drawOnScreen = !drawOnScreen;
    // paintCanvas.hidden = !drawOnScreen


    gsap.to('#art-icon',
        {
            opacity: drawOnScreen ? 1 : .3,
            duration: .6
        });
    gsap.to('#blue-circle',
        {
            onStart: drawOnScreen ? function () { drawBlue.hidden = false } : function () { },
            scale: drawOnScreen ? 1 : 0,
            delay: !drawOnScreen ? 0.25 : 0,
            duration: .6,
            ease: !drawOnScreen ? 'power4.in' : 'power4.out',
            onComplete: drawOnScreen ? function () { } : function () { drawBlue.hidden = true }
        });
    gsap.to('#red-circle',
        {
            onStart: drawOnScreen ? function () { drawRed.hidden = false } : function () { },
            scale: drawOnScreen ? 1 : 0,
            delay: !drawOnScreen ? 0.2 : 0.05,
            duration: .6,
            ease: !drawOnScreen ? 'power4.in' : 'power4.out',
            onComplete: drawOnScreen ? function () { } : function () { drawRed.hidden = true }
        });
    gsap.to('#green-circle',
        {
            onStart: drawOnScreen ? function () { drawGreen.hidden = false } : function () { },
            scale: drawOnScreen ? 1 : 0,
            delay: !drawOnScreen ? 0.15 : 0.1,
            duration: .6,
            ease: !drawOnScreen ? 'power4.in' : 'power4.out',
            onComplete: drawOnScreen ? function () { } : function () { drawGreen.hidden = true }
        });
    gsap.to('#yellow-circle',
        {
            onStart: drawOnScreen ? function () { drawYellow.hidden = false } : function () { },
            scale: drawOnScreen ? 1 : 0,
            delay: !drawOnScreen ? 0.1 : 0.15,
            duration: .6,
            ease: !drawOnScreen ? 'power4.in' : 'power4.out',
            onComplete: drawOnScreen ? function () { } : function () { drawYellow.hidden = true }
        });
    gsap.to('#black-circle',
        {
            onStart: drawOnScreen ? function () { drawBlack.hidden = false } : function () { },
            scale: drawOnScreen ? 1 : 0,
            delay: !drawOnScreen ? 0.05 : 0.2,
            duration: .6,
            ease: !drawOnScreen ? 'power4.in' : 'power4.out',
            onComplete: drawOnScreen ? function () { } : function () { drawBlack.hidden = true }
        });
    gsap.to('#white-circle',
        {
            onStart: drawOnScreen ? function () { drawWhite.hidden = false } : function () { },
            scale: drawOnScreen ? 1 : 0,
            delay: !drawOnScreen ? 0 : 0.25,
            duration: .6,
            ease: !drawOnScreen ? 'power4.in' : 'power4.out',
            onComplete: drawOnScreen ? function () { } : function () { drawWhite.hidden = true }
        });
    gsap.to('#erase-square',
        {
            onStart: drawOnScreen ? function () { eraseSquare.hidden = false } : function () { },
            scale: drawOnScreen ? 1 : 0,
            delay: !drawOnScreen ? 0 : 0.25,
            duration: .6,
            ease: !drawOnScreen ? 'power4.in' : 'power4.out',
            onComplete: drawOnScreen ? function () { } : function () { eraseSquare.hidden = true }
        });

}
function startPainting() {
    paintCanvas.addEventListener('touchstart', function (e) {
        startPosition(e.touches);
    });
    paintCanvas.addEventListener('touchend', endPosition);
    paintCanvas.addEventListener('touchmove', function (e) {
        e.preventDefault();
        erase(e); // Call the erase function alongside drawing
        draw(e.touches);
    });
    gsap.to('#paintCanvas',
        {
            opacity: drawOnScreen ? 0 : 1,
            duration: .6
        })
}
function stopPainting() {
    paintCanvas.removeEventListener('touchstart', function (e) {
        startPosition(e.touches);
    });
    paintCanvas.removeEventListener('touchend', endPosition);
    paintCanvas.removeEventListener('touchmove', function (e) {
        e.preventDefault();
        draw(e.touches);
    });
}
function clearCanvas() {
    gsap.to('#paintCanvas',
        {
            opacity: drawOnScreen ? 0 : 1,
            duration: .6,
            onComplete: function () { paintCanvas.hidden = true; context.clearRect(0, 0, paintCanvas.width, paintCanvas.height) }
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
    if (!painting || eraseMode) return; // Skip drawing if in erase mode

    context.lineWidth = 5;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = drawColor;

    for (var i = 0; i < touches.length; i++) {
        context.lineTo(touches[i].clientX - paintCanvas.offsetLeft, touches[i].clientY - paintCanvas.offsetTop);
        context.stroke();
        context.beginPath();
        context.moveTo(touches[i].clientX - paintCanvas.offsetLeft, touches[i].clientY - paintCanvas.offsetTop);
    }
}
function toggleEraseMode(bool) {
    eraseMode = bool;
}
function erase(event) {
    if (eraseMode) {
        var posX = event.touches[0].clientX - paintCanvas.offsetLeft;
        var posY = event.touches[0].clientY - paintCanvas.offsetTop;

        // Set the width and height of the eraser
        var eraseWidth = 40;
        var eraseHeight = 40;

        // Clear a rectangular area on the canvas
        context.clearRect(posX - eraseWidth / 2, posY - eraseHeight / 2, eraseWidth, eraseHeight);
    }
}

// Function to handle arrow key press
function handleArrowKeyPress(event) {
    // Check which arrow key is pressed based on the key code
    switch (event.keyCode) {
        case 37: // Left arrow key
            console.log("Left arrow key pressed!");
            resetScrollPos(true)
            break;
        case 38: // Up arrow key
            console.log("Up arrow key pressed!");
            handleMenuPreview(true)
            break;
        case 39: // Right arrow key
            console.log("Right arrow key pressed!");
            resetScrollPos(false)
            break;
        case 40: // Down arrow key
            console.log("Down arrow key pressed!");
            handleMenuPreview(false)
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

    if (startTime[0].length > 0 && endTime[0].length > 0) {
        timeRange = `#t=${startTime[0]},${endTime[0]}`;
    } else if (startTime[0].length > 0) {
        timeRange = `#t=${startTime[0]}`;
    } else if (endTime[0].length > 0) {
        timeRange = `#t=0,${endTime[0]}`;
    }

    return timeRange
}

function getLastPartOfPath(filePath) {
    // Split the path using the path separator (e.g., "/" or "\")
    const pathParts = filePath.split(/[\/\\]/);

    // Get the last part of the path
    const lastPart = pathParts[pathParts.length - 1];

    return lastPart;
}

function previewAllCards() {
    var children = theMenu.children;

    // Now you can iterate over the children array or access individual elements
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        gsap.to(child, {
            opacity: 1,
            duration: .4,
            ease: 'power2.out'
        })
    }
}

document.addEventListener('contextmenu', function (event) {
    // Prevent default context menu behavior
    event.preventDefault();
});