


// Handle Menu Pos

var menuPos = true;
var scrollPos = true;

function handleMenuPos() {

    menuPos = !menuPos;

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
            top: menuPos ? 150 : 56,
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
            bottom: menuPos ? 300 : 60,
            rotation: menuPos ? 0 : -540,
            duration: 1,
            ease: "power2.inOut"
        });

    gsap.to("#play-icon",
        {
            bottom: menuPos ? 300 : 60,
            duration: 1,
            ease: "power2.inOut"
        });

    gsap.to("#pause-icon",
        {
            bottom: menuPos ? 300 : 60,
            duration: 1,
            ease: "power2.inOut"
        });

    gsap.to("#seekslider",
        {
            bottom: menuPos ? 320 : 80,
            duration: 1,
            ease: "power2.inOut"
        });

    gsap.to("#art-icon",
        {
            bottom: menuPos ? 440 : 200,
            duration: 1,
            ease: "power2.inOut"
        });

    gsap.to("#move-icon",
        {
            bottom: menuPos ? 370 : 130,
            duration: 1,
            ease: "power2.inOut"
        });

}

function handleScrollPos() {

    scrollPos = !scrollPos;

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

setTimeout(() => {
    gsap.fromTo("#video-title",
        {
            opacity: 0
        },
        {
            opacity: 1,
            duration: 2,
            delay: .2,
            ease: "power2.inOut"

        });

    gsap.fromTo("#video-icon",
        {
            opacity: 0
        },
        {
            opacity: 1,
            duration: 2,
            delay: .2,
            ease: "power2.inOut"

        });

    gsap.fromTo("#video-timestamp",
        {
            opacity: 0
        },
        {
            opacity: 1,
            duration: 2,
            delay: .2,
            ease: "power2.inOut"

        });

    gsap.fromTo("#menuPosIcon",
        {
            bottom: 60,
            opacity: 0
        },
        {
            bottom: 300,
            opacity: 1,
            duration: 2,
            delay: .2,
            ease: "power2.inOut"

        });

    gsap.fromTo("#play-icon",
        {
            bottom: 60,
            opacity: 0
        },
        {
            bottom: 300,
            opacity: 1,
            duration: 2,
            delay: .2,
            ease: "power2.inOut"

        });

    gsap.fromTo("#pause-icon",
        {
            bottom: 60,
            opacity: 0
        },
        {
            bottom: 300,
            opacity: 1,
            duration: 2,
            delay: .2,
            ease: "power2.inOut"

        });

    gsap.fromTo("#art-icon",
        {
            bottom: 200,
            opacity: 0
        },
        {
            bottom: 440,
            opacity: .5,
            duration: 2,
            delay: .2,
            ease: "power2.inOut"

        });

    gsap.fromTo("#move-icon",
        {
            bottom: 130,
            opacity: 0
        },
        {
            bottom: 370,
            opacity: 1,
            duration: 2,
            delay: .2,
            ease: "power2.inOut"

        });
}, 100)


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
                width: 160,
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

// GSAP animation

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
            <div 
                onclick="handleTitles('gallery', 'Lagezentrum', 'Julian Röpke'); handleSelect(this.id); playVideo('/assets/gp/BGUKR.webm', 'loop', 'muted', 'noPlayButtons'); unhighlight();" 
                id="b_0"
                style="align-self: stretch; 
                width: 360px;
                    padding: 10px; 
                    background-image: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgb(0,0,0,1) 100%), url(/assets/gp/HOMEUKR.jpg);
                    background-size: cover;
                    background-position: center;
                    justify-content: center; 
                    gap: 10px; 
                    box-shadow: 12px 12px 100px black; 
                    border-radius: 10px; 
                    border: 2px #cccccc solid;
                    display: inline-flex">

                    <div id="listTitles" style="text-align: center; 
                        position: absolute;
                        top: 150px;
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
            <div onclick="handleTitles('${json[l].type}', '${json[l].title}', '${json[l].time}'); handleSelect(this.id); playVideo('/assets/storage-ukr/${filenameArr}', '${json[l].loop ? 'loop' : 'notloop'}', '${json[l].mute ? 'muted' : 'unmuted'}', '${json[l].ctrl ? 'withPlayButtons' : 'noPlayButtons'}'); highlight();" 
                id="b_${l}" 
                style="align-self: stretch; 
                width: 160px;
                padding: 10px; 
                background-image: linear-gradient(180deg, rgba(0, 0, 0, 0) -50%, black 150%), url(/assets/storage-ukr/${filenameArr.split('.')[0]}.jpg);
                background-size: cover;
                background-position: center;
                justify-content: center; 
                box-shadow: 12px 12px 100px black; 
                border-radius: 10px; 
                border: 2px #cccccc solid;
                display: inline-flex">

                    <div id="listTitles" style="text-align: center; 
                        position: absolute;
                        top: 150px;
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

        document.getElementById('layoutBuildUp').innerHTML = layout;

    });

}

function handleTitles(icon, title, time) {
    document.getElementById('video-icon').style.backgroundImage = `url(/assets/gp/${icon}.png)`;
    document.getElementById('video-title').textContent = title;
    document.getElementById('video-timestamp').textContent = time;
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
        document.getElementById("play-icon").hidden = false
        document.getElementById("pause-icon").hidden = false
        console.log("withPlay");
    } else {
        seek.hidden = true;
        document.getElementById("play-icon").hidden = true
        document.getElementById("pause-icon").hidden = true
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


// Blink on draw
