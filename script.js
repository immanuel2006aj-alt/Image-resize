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
  let quality = document.getElementById("quality").value / 100;
  const targetKB = document.getElementById("targetSize").value;
  const format = document.getElementById("format").value;

  for (let file of files) {
    let img = await loadImage(file);
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");

    canvas.width = img.width * resize;
    canvas.height = img.height * resize;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    let blob = await compress(canvas, format, quality, targetKB);

    download(blob, file.name);
  }
}

function loadImage(file) {
  return new Promise(res => {
    const img = new Image();
    img.onload = () => res(img);
    img.src = URL.createObjectURL(file);
  });
}

function compress(canvas, format, quality, targetKB) {
  return new Promise(resolve => {

    function attempt(q) {
      canvas.toBlob(blob => {
        let sizeKB = blob.size / 1024;

        if (targetKB && sizeKB > targetKB && q > 0.1) {
          attempt(q - 0.05);
        } else {
          resolve(blob);
        }
      }, format, q);
    }

    attempt(quality);
  });
}

function download(blob, name) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "optimized_" + name;
  link.click();
}

function toggleDark() {
  document.body.classList.toggle("dark");
                  }
