let gradient = "Ñ@#W$9876543210?!abc;:+=-,._ ".split("").reverse().join("");

function colorToChar(x) {
  const index = 0 + (x * (gradient.length - 1)) / 255;
  return gradient.charAt(Math.floor(index));
}

let screenWidth = document.body.clientWidth;
const fontSize =
  parseFloat(
    window.getComputedStyle(document.body).getPropertyValue("font-size")
  ) / 1.33333;
console.log(fontSize);

const draw = (img) => {
  const renderBox = document.getElementById("render-box");
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
  console.log("drawing");
  renderBox.innerHTML = imgStr;
};

const handleFileChange = (event) => {
  const files = event.target.files;
  if (!files.length) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      draw(img);
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(files[0]);
};

const input = document.getElementById("file-input");
input.addEventListener("change", handleFileChange);

async function playvid() {
  const video = await getVideoElement();
  const drawingLoop = async (timestamp, frame) => {
    const bitmap = await createImageBitmap(video);
    draw(bitmap);

    if (!video.ended) {
      video.requestVideoFrameCallback(drawingLoop);
    }
  };
  // the last call to rVFC may happen before .ended is set but never resolve
  video.requestVideoFrameCallback(drawingLoop);
}

async function getVideoElement() {
  const video = document.createElement("video");
  let vidWidth = 1000;
  if (vidWidth > 1200) vidWidth = 1200;
  video.width = vidWidth;
  video.height = vidWidth;
  video.crossOrigin = "anonymous";
  video.src = "./vid.mp4";
  video.playsInline = true;
  // document.body.append(video);
  video.play();
  return video;
}

const button = document.getElementById("playvid");
button.addEventListener("click", playvid);
