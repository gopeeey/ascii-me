let gradient = "Ñ@#W$9876543210?!abc;:+=-,._ ".split("").reverse().join("");

function colorToChar(x) {
  const index = 0 + (x * (gradient.length - 1)) / 255;
  return gradient.charAt(Math.floor(index));
}

const handleFileChange = (event) => {
  const files = event.target.files;
  if (!files.length) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const renderBox = document.getElementById("render-box");
      renderBox.innerHTML = "";
      renderBox.style.width = `${Math.round(img.width / 4) * 6}px`;
      renderBox.style.height = `${Math.round(img.height / 4) * 6}px`;
      renderBox.style.display = "flex";
      renderBox.style.flexWrap = "wrap";
      renderBox.style.backgroundColor = "black";
      renderBox.style.color = "white";
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 0; i < canvas.height; i += 4) {
        for (let j = 0; j < canvas.width; j += 4) {
          const imgData = ctx.getImageData(j, i, 4, 4).data;
          const index = 0;
          const r = imgData[index + 0];
          const g = imgData[index + 1];
          const b = imgData[index + 2];
          const a = imgData[index + 3];
          const brightness = r * 0.2126 + g * 0.587 + b * 0.114;
          const char = colorToChar(brightness);
          const dot = document.createElement("div");
          dot.innerHTML = char;
          dot.style.width = "6px";
          dot.style.height = "6px";
          // dot.style.margin = "1px";
          renderBox.appendChild(dot);
        }
      }
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(files[0]);
};

const input = document.getElementById("file-input");
input.addEventListener("change", handleFileChange);
