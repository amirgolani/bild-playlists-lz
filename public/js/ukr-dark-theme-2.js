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
                height: 100,
                ease: "power2.inOut"
            });

        gsap.to(`#${selectedElement}`,
            {
                duration: .8,
                height: 26,
                ease: "power2.inOut"
            });

        selectedElement = newID;

    }
}

// GSAP animation

setTimeout(() => {
    gsap.fromTo("#theMenu",
        {
            left: -500,
        },
        {
            left: 0,
            duration: 1,
            delay: .2,
            ease: "power1.inOut"

        });

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


// Create Buttons

function getLayout() {

    var layout = `<div id="theMenu" class="menu-container">
            <div onclick="handleSelect(this.id); playVideo('/assets/gp/BGUKR.webm', 'loop', 'muted', 'noPlayButtons'); unhighlight();" id="b_0" 
            style="align-self: stretch; 
                height: 100px; 
                padding: 10px; 
                background-image: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgb(0,0,0,1) 100%), url(/assets/gp/HOMEUKR.jpg);
                background-size: cover;
                background-position: center;
                border-radius: 10px; 
                border: 1px #e5e5e5 solid; 
                border-left: 4px #e5e5e5 solid;
                border-right: 4px #e5e5e5 solid;
                justify-content: center; 
                align-items: center; 
                gap: 10px; 
                display: inline-flex">
                <div style="text-align: center; 
                    color: white; 
                    font-size: 20px; 
                    font-family: Gotham; 
                    font-weight: 400; 
                    line-height: 20px; 
                    word-wrap: break-word">
                    <i class="fa-solid fa-house"></i>
                    </div>
            </div>
            `;

    fetch('/layout-ukr').then((response) => response.json()).then((json) => {

        for (l = 1; l < json.length; l++) {
            var filenameArr = json[l].file.split('storage-ukr')[1].substring(1);
            console.log(`${filenameArr}`)
            layout += ` 
            <div onclick="handleSelect(this.id); playVideo('/assets/storage-ukr/${filenameArr}', '${json[l].loop ? 'loop' : 'notloop'}', '${json[l].mute ? 'muted' : 'unmuted'}', '${json[l].ctrl ? 'withPlayButtons' : 'noPlayButtons'}'); highlight();" id="b_${l}" 
            style="align-self: stretch; 
                height: 26px; 
                padding: 10px; 
                background-image: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, black 125%), url(/assets/storage-ukr/${filenameArr.split('.')[0]}.jpg);
                background-size: cover;
                background-position: center;
                border-radius: 10px; 
                border: 1px #e5e5e5 solid; 
                border-left: 4px #e5e5e5 solid;
                border-right: 4px #e5e5e5 solid;
                justify-content: center; 
                align-items: center; 
                gap: 10px; 
                display: inline-flex">
                <div style="text-align: center; 
                    color: white; 
                    font-size: 18px; 
                    font-family: Gotham; 
                    font-weight: 500; 
                    line-height: 20px; 
                    text-transform: uppercase;
                    word-wrap: break-word">
                    ${json[l].name}
                    </div>
            </div>`

        }

        document.getElementById('layoutBuildUp').innerHTML = layout

    });

}

getLayout()


// Player Controls

// Highlightet Button *//
function highlight(e) {
    // var videos = document.getElementsByClassName("video");
    // for (const video of videos) {
    //     video.classList.remove("active");
    // }
    // e = e || window.event;
    // e.srcElement.classList.add("active");
    // console.log(e.srcElement);
}

// Unhighlightet Button *//
function unhighlight(e) {
    var videos = document.getElementsByClassName("video");
    for (const video of videos) {
        video.classList.remove("active");
    }
}

// Audio optional part *//
function playVideo(path, loop, volume = "muted", PlayButtons = "withPlayButtons") {
    var video = document.getElementById("video");
    var seek = document.getElementById("seek");

    if (PlayButtons == "withPlayButtons") {
        seek.hidden = false;
        console.log("withPlay");
    } else {
        seek.hidden = true;
    }


    console.log(video);
    video.setAttribute('src', path)

    if (loop == "loop" || loop == "true")
        video.loop = true;
    else {
        video.loop = false;
    }

    if (volume == "muted") {
        video.muted = true;
        video.volume = 0;
        console.log("Sem Audio");
    } else {
        video.muted = false;
        video.volume = 1;
        console.log("Com Audio");
    }
}

var seekslider;
var video = document.getElementById('video'), frameTime = 1 / 25;
seekslider = document.getElementById("seekslider");
// Add event listeners
seekslider.addEventListener("change", vidSeek, false);
video.addEventListener("timeupdate", seektimeupdate, false);
video.ontimeupdate = function () { timecodeUpdate() };
function pauseVideo() {
    video.pause();
    console.log("pause");
}
function ctrlPlayVideo() {
    video.play();
    console.log("play");
}
function framePlus() {
    video.currentTime = Math.min(video.duration, video.currentTime + frameTime);
}
function frameMinus() {
    video.currentTime = Math.max(0, video.currentTime - frameTime);
}

function vidSeek() {
    pauseVideo();
    var seekto = video.duration * (seekslider.value / 1500);
    video.currentTime = seekto;
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