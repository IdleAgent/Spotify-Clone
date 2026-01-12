console.log("Welcome to Spotify");

let audio = new Audio();
let currentTrack = null;

function convertToMinutesSeconds(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

async function getsongs() {
    let response = await fetch("songs/songs.json");
    let data = await response.json();
    let songs = data.songs.map(song => `songs/${song}`);
    return songs;
}

function playMusic(track) {
    if (audio.src.includes(track)) {
        if (audio.paused) {
            audio.play();
            play.src = "pause.svg";
        } else {
            audio.pause();
            play.src = "play.svg";
        }
    } else {
        audio.src = "songs/" + track;
        audio.play();
        currentTrack = "songs/" + track;
        play.src = "pause.svg";
        document.querySelector(".songinfo").innerHTML = track;
        audio.addEventListener("loadedmetadata", () => {
            document.querySelector(".songtime").innerHTML =
                `00:00 / ${convertToMinutesSeconds(Math.floor(audio.duration))}`;
        });
        if (audio.readyState >= 1) {
            document.querySelector(".songtime").innerHTML =
                `00:00 / ${convertToMinutesSeconds(Math.floor(audio.duration))}`;
        }
    }
}

async function main() {
    let songs = await getsongs();
    console.log("Loaded songs:", songs);

    if (songs.length > 0) {
        audio.src = songs[0];
        currentTrack = songs[0];
        console.log("Ready to play:", songs[0]);
    }

    document.querySelector(".songinfo").innerText = currentTrack.split("/").pop();

    audio.addEventListener("loadedmetadata", () => {
        document.querySelector(".songtime").innerHTML =
            `00:00 / ${convertToMinutesSeconds(Math.floor(audio.duration))}`;
    });

    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        let fileName = song.split("/").pop();
        songUL.innerHTML += `
        <li>
            <img src="music.svg" alt="music note" width="20" height="20">
            <span>${fileName}</span>
        </li>`;
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            let track = e.querySelector("span").innerText.trim();
            console.log("Playing:", track);
            playMusic(track);
        });
    });

    play.addEventListener("click", () => {
        if (audio.paused) {
            audio.play();
            play.src = "pause.svg";
        } else {
            audio.pause();
            play.src = "play.svg";
        }
    });

    audio.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${convertToMinutesSeconds(Math.floor(audio.currentTime))} / ${convertToMinutesSeconds(Math.floor(audio.duration))}`;
        document.querySelector(".circle").style.left =
            (audio.currentTime / audio.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const seekbar = document.querySelector(".seekbar");
        const rect = seekbar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * audio.duration;
    });

    const circle = document.querySelector(".circle");
    let isDragging = false;
    circle.addEventListener("mousedown", () => (isDragging = true));
    window.addEventListener("mouseup", () => (isDragging = false));
    window.addEventListener("mousemove", (e) => {
        if (isDragging) {
            const seekbar = document.querySelector(".seekbar");
            const rect = seekbar.getBoundingClientRect();
            const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
            circle.style.left = percent * 100 + "%";
            audio.currentTime = percent * audio.duration;
        }
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    document.getElementById("previous").addEventListener("click", () => {
        console.log("Previous clicked");
        let currentIndex = songs.findIndex(song => song.includes(currentTrack));
        if (currentIndex > 0) {
            playMusic(songs[currentIndex - 1].split("/").pop());
        } else {
            playMusic(songs[songs.length - 1].split("/").pop());
        }
    });

    document.getElementById("next").addEventListener("click", () => {
        console.log("Next clicked");
        let currentIndex = songs.findIndex(song => song.includes(currentTrack));
        if (currentIndex < songs.length - 1) {
            playMusic(songs[currentIndex + 1].split("/").pop());
        } else {
            playMusic(songs[0].split("/").pop());
        }
    });

    document.querySelector(".range input").addEventListener("input", (e) => {
        const volume = e.target.value;
        audio.volume = volume;
        console.log("Volume:", volume);
    });
}


document.querySelectorAll(".card .play").forEach((btn, index) => {
    btn.addEventListener("click", () => {
        if (index < songs.length) {
            let track = songs[index].split("/").pop();
            console.log("Playing from card:", track);
            playMusic(track);
        }
    });
});

main();