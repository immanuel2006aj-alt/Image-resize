const upload = document.getElementById("upload");
const previewContainer = document.getElementById("previewContainer");
const dropZone = document.getElementById("dropZone");

let files = [];

dropZone.onclick = () => upload.click();

upload.onchange = (e) => {
  files = [...e.target.files];
  showPreviews();
};

dropZone.ondrop = (e) => {
  e.preventDefault();
  files = [...e.dataTransfer.files];
  showPreviews();
};

dropZone.ondragover = (e) => e.preventDefault();

function showPreviews() {
  previewContainer.innerHTML = "";

  files.forEach(file => {
    const div = document.createElement("div");
    div.className = "preview";

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.style.width = "100%";

    const info = document.createElement("p");
    info.innerText = `Original: ${(file.size/1024).toFixed(1)} KB`;

    div.appendChild(img);
    div.appendChild(info);
    previewContainer.appendChild(div);
  });
}

async function processAll() {
  const resize = document.getElementById("resize").value / 100;
  const format = document.getElementById("format").value;

  const minKB = parseInt(document.getElementById("minSize").value);
  const maxKB = parseInt(document.getElementById("maxSize").value);

  const resultContainer = document.getElementById("resultContainer");
  resultContainer.innerHTML = "";

  for (let file of files) {

    let img = await loadImage(file);

    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");

    canvas.width = img.width * resize;
    canvas.height = img.height * resize;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    let blob = await compressToRange(canvas, format, minKB, maxKB);

    showResult(blob);
  }
}
function compressToRange(canvas, format, minKB, maxKB) {
  return new Promise(resolve => {

    let q = 0.9;

    function tryCompress() {
      canvas.toBlob(blob => {

        let size = blob.size / 1024;

        if (size > maxKB && q > 0.1) {
          q -= 0.05;
          tryCompress();
        } else if (size < minKB && q < 1) {
          q += 0.05;
          tryCompress();
        } else {
          resolve(blob);
        }

      }, format, q);
    }

    tryCompress();
  });
            }
function showResult(blob) {
  const container = document.getElementById("resultContainer");

  const div = document.createElement("div");
  div.className = "result-card";

  const img = document.createElement("img");
  img.src = URL.createObjectURL(blob);

  const size = document.createElement("p");
  size.innerText = `Final Size: ${(blob.size/1024).toFixed(1)} KB`;

  const btn = document.createElement("button");
  btn.innerText = "Download Image";
  btn.className = "download-btn";

  btn.onclick = () => {
    const link = document.createElement("a");
    link.href = img.src;
    link.download = "optimized.jpg";
    link.click();
  };

  div.appendChild(img);
  div.appendChild(size);
  div.appendChild(btn);

  container.appendChild(div);
}
