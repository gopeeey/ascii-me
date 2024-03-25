// import * as html2canvas from "./html2canvas.js";

let gradient = "Ñ@#W$9876543210?!abc;:+=-,._ ".split("").reverse().join("");
let currentCamStream = null;
let currentCamVideo = null;
const renderBox = document.getElementById("render-box");
const cameraOptions = document.getElementById("camOptions");

function endCamStream() {
  if (!currentCamStream) return;
  currentCamStream.getTracks().forEach((track) => track.stop());
  currentCamStream = null;
  currentCamVideo = null;
  const shutter = document.getElementById("shutter");
  if (shutter) document.body.removeChild(shutter);
  cameraOptions.innerHTML = "";
  cameraOptions.value = "";
}

function colorToChar(x) {
  const index = 0 + (x * (gradient.length - 1)) / 255;
  return gradient.charAt(Math.floor(index));
}

let screenWidth = document.body.clientWidth;
const fontSize =
  parseFloat(
    window.getComputedStyle(document.body).getPropertyValue("font-size")
  ) / 1.33333;

const draw = (img) => {
  renderBox.innerHTML = "";
  renderBox.style.backgroundColor = "black";
  renderBox.style.color = "white";
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (img.width > screenWidth) {
    let val = Math.ceil((screenWidth * (12 - fontSize)) / 6);
    if (val < screenWidth) val = screenWidth;
    canvas.width = val;
    canvas.height = img.height * (val / img.width);
  } else {
    canvas.width = img.width;
    canvas.height = img.height;
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let imgStr = "";
  const pxGroupSize = screenWidth > 1500 ? 5 : 6;
  for (let i = 0; i < canvas.height; i += pxGroupSize) {
    for (let j = 0; j < canvas.width; j += pxGroupSize) {
      const index = (i * canvas.width + j) * 4;
      const r = imgData[index + 0];
      const g = imgData[index + 1];
      const b = imgData[index + 2];
      const brightness = r * 0.2126 + g * 0.587 + b * 0.114;
      let char = colorToChar(brightness);
      if (char === " ") char = "&nbsp";
      imgStr += char;
    }
    imgStr += "<br>";
  }
  renderBox.innerHTML = imgStr;
};

const handleFileChange = (event) => {
  endCamStream();
  removeDownloadButton();
  const files = event.target.files;
  if (!files.length) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      draw(img);
      addDownloadButton();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(files[0]);
};

const input = document.getElementById("file-input");
input.addEventListener("change", handleFileChange);

async function drawVideo(video) {
  const drawingLoop = async () => {
    const bitmap = await createImageBitmap(video);
    draw(bitmap);

    if (!video.ended) {
      video.requestVideoFrameCallback(drawingLoop);
    }
  };
  // the last call to rVFC may happen before .ended is set but never resolve
  video.requestVideoFrameCallback(drawingLoop);
}
async function playvid() {
  endCamStream();
  const video = document.createElement("video");
  let vidWidth = 1000;
  if (vidWidth > 1200) vidWidth = 1200;
  video.width = vidWidth;
  video.height = vidWidth;
  video.crossOrigin = "anonymous";
  video.src = "./vid.mp4";
  video.playsInline = true;
  video.play();
  drawVideo(video);
}

let constraints = {};
async function startCamera(camConstraints) {
  endCamStream();
  if (!navigator.mediaDevices) return alert("MediaDevices not supported");
  try {
    currentCamStream = await navigator.mediaDevices.getUserMedia({
      video: camConstraints,
    });
    currentCamVideo = document.createElement("video");
    currentCamVideo.srcObject = currentCamStream;
    currentCamVideo.playsInline = true;
    currentCamVideo.setAttribute("id", "cameraStream");
    currentCamVideo.play();
    drawVideo(currentCamVideo);
    const shutter = document.createElement("button");
    shutter.innerHTML = "Take a photo";
    shutter.setAttribute("id", "shutter");
    shutter.addEventListener("click", takeSnapshot);
    document.body.appendChild(shutter);
    await getCameraSelection();
  } catch (err) {
    console.log(err);
    alert("Sorry an error occurred");
  }
}

async function getCameraSelection() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter((device) => device.kind === "videoinput");
  const options = videoDevices.map((videoDevice) => {
    return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
  });
  cameraOptions.innerHTML = options.join("");
  if (constraints.deviceId) cameraOptions.value = constraints.deviceId.exact;
}

async function takeSnapshot() {
  if (!currentCamVideo) return;
  const bitmap = await createImageBitmap(currentCamVideo);
  bitmap;
  endCamStream();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  draw(bitmap);
  addDownloadButton();
}

async function downloadImage() {
  const canvas = await html2canvas(renderBox);
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = "ascii_me";
  link.href = dataUrl;
  link.click();
}

function addDownloadButton() {
  const download = document.createElement("button");
  download.innerHTML = "Download";
  download.setAttribute("id", "download");
  download.addEventListener("click", downloadImage);
  document.body.appendChild(download);
}

async function removeDownloadButton() {
  const download = document.getElementById("download");
  if (download) document.body.removeChild(download);
}

cameraOptions.addEventListener("change", (e) => {
  constraints = {
    deviceId: {
      exact: e.target.value,
    },
  };
  startCamera(constraints);
});

// const button = document.getElementById("playvid");
// button.addEventListener("click", playvid);
const cameraButton = document.getElementById("startCamera");
cameraButton.addEventListener("click", async () => {
  removeDownloadButton();
  await startCamera(constraints);
});
