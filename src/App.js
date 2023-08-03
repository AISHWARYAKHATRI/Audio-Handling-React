import React from "react";
import { useRef, useState } from "react";
import audio from "./audio.mp3";
// Helper function to convert Base64 to Blob
function base64ToBlob(base64Data) {
  const byteCharacters = atob(base64Data.split(",")[1]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: "audio/mpeg" });
}

function App() {
  const inputRef = useRef();

  const handleAudioFile = (e) => {
    const file = e.target.files[0];
    var reader = new FileReader();
    reader.addEventListener(
      "load",
      function () {
        console.log(inputRef.current);
        inputRef.current.src = reader.result;
        const audioData = reader.result;
        const formData = new FormData();
        formData.append("audioFile", base64ToBlob(audioData), file.name);
        fetch("http://localhost:3001/upload-audio", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Response from the backend:", data);
            // If needed, handle the response from the backend here
          })
          .catch((error) => {
            console.error("Error sending audio data to the backend:", error);
            // Handle errors here
          });
      },
      false
    );

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef();

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const currentTime = audioRef.current.currentTime;
    const duration = audioRef.current.duration;
    setProgress((currentTime / duration) * 100);
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value * audioRef.current.duration) / 100;
    audioRef.current.currentTime = seekTime;
    setProgress(e.target.value);
  };

  return (
    <>
      <div className="App">
        <input type="file" onChange={(e) => handleAudioFile(e)} />
        <audio controls src="" ref={inputRef}></audio>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: "70%" }}>
            <audio
              ref={audioRef}
              src={audio}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            />
            <div style={{ width: "100%", height: "20px", background: "#ccc" }}>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>
          <button onClick={handlePlayPause} style={{ marginLeft: "10px" }}>
            {isPlaying ? (
              <i class="fa-solid fa-pause" style={{ color: "#ffffff" }}></i>
            ) : (
              <i class="fa-thin fa-play" style={{ color: "#ffffff" }}></i>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
