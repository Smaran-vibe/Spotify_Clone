console.log('Javascript initializing......');
let currentsong = new Audio()

let play = document.querySelector("#play");
let previous = document.querySelector("#previous");
let next = document.querySelector("#next");

let songs = []

async function getSongs() {

    let a = await fetch("http://127.0.0.1:3000/Songs/")
    let response = await a.text();
    console.log(a);
    console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    console.log();

    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if (element.href.endsWith(".mp3")) {
            let fileName = decodeURIComponent(element.href).split("\\").pop();
            songs.push(fileName);
        }
    }

    return songs

}

const playMusic = (track, pause = false) => {
    console.log("Playing:", track); // check what comes in
    currentsong.src = "/Songs/" + track;
    console.log("Full path:", "/Songs/" + track);
    if (!pause) {

        currentsong.play()
            .then(() => {
                console.log("Playing!");
                play.src = "pause.svg";
                document.querySelector(".songinfo").innerHTML = track
                document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
            })
            .catch(err => console.log("Error:", err));
    } else {
        document.querySelector(".songinfo").innerHTML = track;
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
    songs = await getSongs();
    console.log("Songs array:", songs);
    playMusic(songs[0], true)

    let SongUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];

    for (const song of songs) {
        let songName = song.replace(".mp3", "");
        let li = document.createElement("li");
        li.dataset.song = song;
        li.innerHTML = `
            <img src="music.svg" alt="">
            <div class="info">
                <div>${songName}</div>
                <div>Roronoa</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img src="play.svg" alt="">
            </div>`


        li.addEventListener("click", () => {
            console.log("Clicked:", song);
            playMusic(song);
        });

        SongUL.appendChild(li);

        // Attach an event listener to previous next and play 
    }
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "play.svg"
        }
    })
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
            volumeIcon.src = "mute.svg";
        }
        else {
            volumeIcon.src = "volume.svg";
        }

    })

}

// add an eventlistener to previous and next 

previous.addEventListener("click", () => {
    console.log("previous clicked");

    let currentSongFile = decodeURIComponent(currentsong.src.split("/").pop());
    console.log("Current song:", currentSongFile);

    let index = songs.indexOf(currentSongFile);
    console.log("Index:", index);

    if (index > 0) {
        playMusic(songs[index - 1]);
    }
})

next.addEventListener("click", () => {
    console.log("next clicked");

    let currentSongFile = decodeURIComponent(currentsong.src.split("/").pop());
    console.log("Current song:", currentSongFile);

    let index = songs.indexOf(currentSongFile);
    console.log("Index:", index);

    if (index < songs.length - 1) {
        playMusic(songs[index + 1]);
    }
})

let volumeIcon = document.querySelector(".vol-icon");

volumeIcon.addEventListener("click", () => {
    if (currentsong.volume > 0) {

        currentsong.volume = 0;

        document.querySelector(".range input").value = 0

        volumeIcon.src = "mute.svg"
    }
    else {
        currentsong.volume = 1;

        document.querySelector(".range input").value = 100;

        volumeIcon.src = "volume.svg"
    }
})





main()






