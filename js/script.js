console.log('Javascript initializing......');
let currentsong = new Audio()

let play = document.querySelector("#play");
let previous = document.querySelector("#previous");
let next = document.querySelector("#next");

let songs = []

let currentFolder = "";

async function getSongs(folder) {

    let a = await fetch(`http://127.0.0.1:3000/Songs/${folder}/`)
    let response = await a.text();
    console.log("Raw response:", response);
    console.log("Status:", a.status);

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    console.log();

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if (
            element.href.endsWith(".mp3") ||
            element.href.endsWith(".m4a") ||
            element.href.endsWith(".wav") ||
            element.href.endsWith(".ogg") ||
            element.href.endsWith(".flac")
        ) {
            let fileName = decodeURIComponent(element.href).split("\\").pop();
            songs.push(fileName);
        }
    }


    return songs

}

async function getPlaylists() {
    let a = await fetch(`http://127.0.0.1:3000/Songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    let folders = []
    for (let i = 0; i < as.length; i++) {
        const element = as[i];

        let linkText = (element.innerText || element.textContent).trim();

        console.log("Link found:", linkText);


        if (
            linkText !== "" &&
            linkText !== "../" &&
            !linkText.includes(".mp3") &&
            !linkText.includes(".m4a") &&
            !linkText.includes(".wav") &&
            !linkText.includes(".ogg") &&
            !linkText.includes(".flac") &&
            !linkText.includes(".json") &&
            !linkText.includes(".jpg") &&
            !linkText.includes(".webp")
        ) {
            folders.push(linkText);
        }
    }

    console.log("Final folders:", folders);
    return folders;
}

const playMusic = (track, folder, pause = false) => {
    currentsong.pause();
    currentsong.src = `/Songs/${folder}/${track}`;

    if (!pause) {
        currentsong.play()
            .then(() => {
                play.setAttribute("src", "img/pause.svg");
                document.querySelector(".songinfo").innerHTML = track.replace(/\.(mp3|m4a|wav|ogg|flac)$/i, "");
                document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
            })
            .catch(err => console.log("Error:", err));
    } else {
        document.querySelector(".songinfo").innerHTML = track.replace(/\.(mp3|m4a|wav|ogg|flac)$/i, "");
        document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    }
}

function formatTime(seconds) {

    if (isNaN(seconds)) return "00:00"

    let mins = Math.floor(seconds / 60)
    let secs = Math.floor(seconds % 60)

    mins = String(mins).padStart(2, "0");
    secs = String(secs).padStart(2, "0");

    return `${mins}:${secs}`;
}

async function main() {

    let playlists = await getPlaylists();
    console.log("Playlists found:", playlists);

    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    for (const playlist of playlists) {


        let infoRes = await fetch(`/Songs/${playlist}/info.json`);
        let info = await infoRes.json();

        let card = document.createElement("div");
        card.className = "card";
        card.dataset.folder = playlist;

        card.innerHTML = `
            <div class="play-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black">
                    <circle cx="12" cy="12" r="12" fill="#3BE276" />
                    <path d="M9 7.5V16.5L17 12L9 7.5Z" fill="black" />
                </svg>
            </div>
            <img src="/Songs/${playlist}/cover.jpg" alt="${info.title}"
                 onerror="this.src='default-cover.jpg'">
            <h2>${info.title}</h2>
            <p>${info.description}</p>
        `
        card.addEventListener("click", async () => {
            currentFolder = playlist;
            songs = await getSongs(playlist);
            console.log("Playlist:", songs);

            let SongUL = document.querySelector(".songlist")
                .getElementsByTagName("ul")[0];
            SongUL.innerHTML = "";

            for (const song of songs) {
                let songName = song.replace(".mp3", "");
                let li = document.createElement("li");
                li.dataset.song = song;
                li.innerHTML = `
                    <img src="img/music.svg" alt="">
                    <div class="info">
                        <div>${songName}</div>
                        <div>${info.title}</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img src="img/play.svg" alt="">
                    </div>`

                li.addEventListener("click", () => {
                    playMusic(song, playlist);
                });

                SongUL.appendChild(li);
            }
            playMusic(songs[0], playlist);
        });

        cardContainer.appendChild(card);
    }


    play.addEventListener("click", () => {
        console.log("Play Clicked");
        console.log("Paused", currentsong.paused);
        console.log("Current src:", currentsong.src);

        if (currentsong.paused) {
            currentsong.play()
                .then(() => {
                    console.log("Trying to play...");
                    play.setAttribute("src", "img/pause.svg");
                })
                .catch(err => console.log("Error:", err));
        } else {
            console.log("Trying to pause...");
            currentsong.pause()
            console.log("After pause, paused?", currentsong.paused);
            play.setAttribute("src", "img/play.svg");
        }
    })

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`
        document.querySelector(".circle").style.left =
            (currentsong.currentTime / currentsong.duration) * 100 + "%"
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })

    document.querySelector(".hamburger").addEventListener("click", e => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", e => {
        document.querySelector(".left").style.left = "-120%"
    })

    document.querySelector(".range input").addEventListener("input", (e) => {
        currentsong.volume = e.target.value / 100;
        if (currentsong.volume == 0) {
            volumeIcon.src = "img/mute.svg";
        } else {
            volumeIcon.src = "img/volume.svg";
        }
    })
}


// Listen for time update event 
currentsong.addEventListener("timeupdate", () => {

    document.querySelector(".songtime").innerHTML =
        `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`
    document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
})

// Add an eventListener to seekbar 

document.querySelector(".seekbar").addEventListener("click", e => {

    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = ((currentsong.duration) * percent) / 100


})

// Add an eventListener to hamburger 

document.querySelector(".hamburger").addEventListener("click", e => {

    document.querySelector(".left").style.left = "0"


})
// Add an eventlistener to close button

document.querySelector(".close").addEventListener("click", e => {
    document.querySelector(".left").style.left = "-120%"
})

// add an event listener to volume
document.querySelector(".range input").addEventListener("input", (e) => {

    currentsong.volume = e.target.value / 100;

    if (currentsong.volume == 0) {
        volumeIcon.src = "img/mute.svg";
    }
    else {
        volumeIcon.src = "img/volume.svg";
        currentsong.volume = .10;
    }

})



// add an eventlistener to previous and next 

previous.addEventListener("click", () => {
    console.log("previous clicked");

    let currentSongFile = decodeURIComponent(currentsong.src.split("/").pop());
    console.log("Current song:", currentSongFile);

    let index = songs.indexOf(currentSongFile);
    console.log("Index:", index);

    if (index > 0) {
        playMusic(songs[index - 1], currentFolder);
    }
})

next.addEventListener("click", () => {
    console.log("next clicked");

    let currentSongFile = decodeURIComponent(currentsong.src.split("/").pop());
    console.log("Current song:", currentSongFile);

    let index = songs.indexOf(currentSongFile);
    console.log("Index:", index);

    if (index < songs.length - 1) {
        playMusic(songs[index + 1], currentFolder);
    }
})

let volumeIcon = document.querySelector(".vol-icon");

volumeIcon.addEventListener("click", () => {
    if (currentsong.volume > 0) {

        currentsong.volume = 0;

        document.querySelector(".range input").value = 0

        volumeIcon.src = "img/mute.svg"
    }
    else {
        currentsong.volume = 1;

        document.querySelector(".range input").value = 100;

        volumeIcon.src = "img/volume.svg"
    }
})


main()






