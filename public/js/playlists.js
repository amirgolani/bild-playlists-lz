fetch('/layouts').then(async response => {
    if (response.ok) {
        // Success: Show an alert or perform any other success action
        var playlists = await response.json()
        console.log(playlists)

        var playlistsHTML = '';

        for (i = 0; i < playlists.length; i++) {
            playlistsHTML +=
                `
                      <div class="playlist" id="pl_${i}">
                          <div style="color: white; font-size: 36px; font-family: Gotham; font-weight: normal; line-height: 26px;">
                              <div onclick="goToPage('${playlists[i].layout[0].url}', 'pl_${i}')">${playlists[i].layout[0].title}</div> 
                              <div style="color: white; font-size: 14px; font-family: Gotham; font-weight: light; line-height: 28px;">
                              ${convertToLocaleDateTime(playlists[i].ctime)}
                              </div>
                              <div style="color: #494949; font-size: 14px; font-family: Gotham; font-weight: light; line-height: 28px; margin-top: 5px;">
                                  <span onclick="deletePlaylist('${playlists[i].name}')" style="color: white; font-size: 14px; font-weight: bold; background-color: #aa0000; padding: 3px; padding-left: 5px; padding-right: 5px; border-radius: 4px; margin-right: 5px;">X</span>${playlists[i].name}
                                  </div>
                              </div>
                              <div style="flex-direction: row; gap: 2px; display: flex;">
                              ${playlists[i].layout.map((item, index) => {
                    if (item.thumb || item.file) {
                        return `<div style="width: 36px; background-color: red; height: 100px; border-radius: 6px; 
                                  background-image: url(/assets/playlists/${playlists[i].name}/storage/${!item.thumb ? item.file : item.thumb});
                                  background-size: cover;
                                  background-position: center;"></div>`}
                }).join(',')}
                              </div>
                          </div>
                          `
        }

        document.getElementById('playlist-container').innerHTML += playlistsHTML;

        for (b = 0; b < playlists.length; b++) {
            gsap.fromTo(`#pl_${b}`, {
                opacity: 0,
                scale: .95
            }, {
                opacity: 1,
                scale: 1,
                duration: 1,
                delay: b / 5,
                ease: 'power1.out'
            })
        }
    }
})

function goToPage(url, playlist) {
    document.getElementById(playlist).style.background = '#aa0000';
    window.location.assign(url)
}

function convertToLocaleDateTime(timeString) {
    // Create a new Date object from the provided time string
    const utcDate = new Date(timeString);

    // Get the local date and time
    const localDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);

    // Format the local date and time as a string
    const formattedDate = localDate.toLocaleString();

    return formattedDate;
}

function deletePlaylist(playlist) {
    // Show confirmation dialog
    if (confirm("Are you sure you want to delete this playlist?")) {
        fetch(`/playlist?playlist=${playlist}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    // If the response is successful, refresh the page
                    location.reload();
                } else {
                    // If there's an error, do nothing
                }
            })
            .catch(error => {
                // If there's an error, log it
                console.log(error);
            });
    }
}