// Handle Menu Pos

var menuPos = true;
function handleMenuPos(selection) {

    if (selection === undefined) {
        menuPos = !menuPos
    } else {
        menuPos = selection
    }

    console.log(menuPos)

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
function handleScrollPos(selection) {

    console.log(selection)

    if (selection === undefined) {
        scrollPos = !scrollPos
    } else {
        scrollPos = selection
    }

    console.log(scrollPos)

    gsap.to("#move-icon",
        {
            rotation: scrollPos ? -90 : 90,
            duration: 1,
            ease: "power2.inOut"
        });

    gsap.to("#theMenu",
        {
            left: scrollPos ? 0 : -960,
            duration: 1,
            ease: "power2.inOut"
        });

}


// Handle Select

var selectedElement = "b_0"
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

function getLayout() {

    var layout = `<div id="theMenu" class="menu-container">
            <div 
                onclick="handleTitles('gallery', 'Lagezentrum', 'Julian Röpke'); handleSelect(this.id); playVideo('/assets/gp/BGUKR.webm', 'loop', 'muted', 'noPlayButtons');" 
                id="b_0"
                class="card-in-menu"
                style="width: 360px;
                    background-image: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgb(0,0,0,1) 100%), url(/assets/gp/HOMEUKR.jpg);
                    ">

                    <div id="listTitles" class="title-in-menu">
                        <i class="fa-solid fa-house"></i>
                    </div>

                </div>
                `;

    fetch('/layout-ukr').then((response) => response.json()).then((json) => {

        for (l = 1; l < json.length; l++) {
            var filenameArr = json[l].file.split('storage-ukr')[1].substring(1);
            console.log(`${filenameArr}`)
            layout += ` 
            <div onclick="handleTitles('${json[l].type}', '${json[l].title}', '${json[l].time}'); handleSelect(this.id); playVideo('/assets/storage-ukr/${filenameArr}', '${json[l].loop ? 'loop' : 'notloop'}', '${json[l].mute ? 'muted' : 'unmuted'}', '${json[l].ctrl ? 'withPlayButtons' : 'noPlayButtons'}');" 
                class="card-in-menu"    
                id="b_${l}" 
                style="background-image: linear-gradient(180deg, rgba(0, 0, 0, 0) -50%, black 150%), url(/assets/storage-ukr/${replaceFileExtension(filenameArr)});">

                <div id="listTitles" class="title-in-menu">
                    ${json[l].name}
                </div>
            </div>`

        }

        document.getElementById('layoutBuildUp').innerHTML = layout;

        // drag the menu


        // Select the movable div
        const movableDiv = document.getElementById('theMenu');

        // Initialize variables
        let startX = 0;
        let cumulativeDistance = 0;

        // Add touchstart event listener
        movableDiv.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        // Add touchmove event listener
        movableDiv.addEventListener('touchmove', (e) => {
            // Calculate the distance moved
            const distance = e.touches[0].clientX - startX;

            // Log the cumulative horizontal distance
            cumulativeDistance += distance;
            console.log('Cumulative Distance:', cumulativeDistance);

            // Use GSAP to move the div horizontally
            gsap.to(movableDiv, { x: cumulativeDistance * 2, duration: 0.2 });

            // Update the starting position for the next move event
            startX = e.touches[0].clientX;
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

function playVideo(path, loop, volume = "muted", PlayButtons = "withPlayButtons") {
    var video = document.getElementById("video");
    var videoBg = document.getElementById("video-bg")
    var seek = document.getElementById("seek");

    if (PlayButtons == "withPlayButtons") {
        seek.hidden = false;
        document.getElementById("play-icon").hidden = false
        // document.getElementById("pause-icon").hidden = false
        console.log("withPlay");
    } else {
        seek.hidden = true;
        document.getElementById("play-icon").hidden = true
        // document.getElementById("pause-icon").hidden = true
    }


    console.log(video);
    video.setAttribute('src', path)
    videoBg.setAttribute('src', path)

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
        console.log("Sem Audio");
        videoBg.muted = true;
        videoBg.volume = 0;
    } else {
        video.muted = false;
        video.volume = 1;
        console.log("Com Audio");
        videoBg.muted = true;
        videoBg.volume = 0;
    }
}
var playButton = document.getElementById('play-icon');
var video = document.getElementById('video'), frameTime = 1 / 25;
var videoBg = document.getElementById('video-bg'), frameTime = 1 / 25;
var seekslider = document.getElementById("seekslider");

seekslider.addEventListener("change", vidSeek, false);
video.addEventListener("timeupdate", seektimeupdate, false);
video.ontimeupdate = function () { timecodeUpdate() };

var play = true;

function pauseVideo() {
    video.pause();
    console.log("pause");
}
function ctrlPlayVideo() {
    video.play();
    videoBg.play();
    console.log("play");
}
function handlePlays() {
    play = !play;
    if (play) {
        video.play();
        videoBg.play();
        playButton.classList.replace('play-icon', 'pause-icon');
    } else {
        video.pause();
        videoBg.pause();
        playButton.classList.replace('pause-icon', 'play-icon');

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


// Handle draw

var canvas = document.getElementById('paintCanvas');
var context = canvas.getContext('2d');
var painting = false;
var drawOnScreen = false;
var isBlinking = false;
function manageDraws() {
    if (!drawOnScreen) {
        drawOnScreen = !drawOnScreen;
        gsap.to('#art-icon', { opacity: 1, duration: 0.5 });
        console.log("on")
        startPainting()
        canvas.hidden = false;
    } else {
        drawOnScreen = !drawOnScreen;
        gsap.to('#art-icon', { opacity: .5, duration: 0.5 });

        stopPainting();
        clearCanvas();
        canvas.hidden = true;
    }

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
    context.clearRect(0, 0, canvas.width, canvas.height);
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
    context.strokeStyle = '#000';

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
        default:
        // Do nothing for other keys
    }
}

// Adding the event listener to the document
document.addEventListener("keydown", handleArrowKeyPress);

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