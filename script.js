console.log('Javascript initializing......');

async function getSongs() {

    let a = await fetch("http://127.0.0.1:3000/Songs/")
    let response = await a.text();
    console.log(a);
    console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    console.log();

    let songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if (element.href.endsWith(".mp3")) {
            songs.push(element.href)
        }
    }

    return songs

}

async function main() {
    let songs = await getSongs()
    console.log(songs);

    let SongUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    for (const song of songs) {

        let songName = decodeURIComponent(song)
            .split("\\")
            .pop()
            .replace(".mp3", "")

        SongUL.innerHTML += `<li>${songName}</li>`;
    }
    var audio = new Audio(songs[0]);
    // audio.play();

    audio.addEventListener("loadeddata", () => {
        console.log(audio.duration, audio.currentSrc, audio.currentTime);

    })

}

main()






