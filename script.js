const workspace = document.getElementById("workspace");
let selectedElement = null;

// ====== Drag & Drop ======
function allowDrop(event) { event.preventDefault(); }

document.querySelectorAll(".component").forEach(comp => {
  comp.addEventListener("dragstart", e => {
    e.dataTransfer.setData("component-type", comp.dataset.type);
  });
});

function drop(event) {
  event.preventDefault();
  const type = event.dataTransfer.getData("component-type");
  createElement(type, event.offsetX, event.offsetY);
}

// ====== Criação de Elementos ======
function createElement(type, x, y) {
  const placeholder = document.querySelector(".placeholder");
  if (placeholder) placeholder.remove();

  const el = document.createElement("div");
  el.classList.add("draggable-element");
  el.style.left = x + "px";
  el.style.top = y + "px";

  switch (type) {
    case "button": el.innerHTML = `<button>Botão</button>`; break;
    case "text": el.innerHTML = `<p contenteditable="true">Texto editável</p>`; break;
    case "image": el.innerHTML = `<img src="https://via.placeholder.com/120" width="120">`; break;
    case "input": el.innerHTML = `<input type="text" placeholder="Digite...">`; break;
    case "card": el.innerHTML = `<div style="padding:10px;background:#eee;border-radius:8px;"><h4>Título</h4><p>Descrição</p></div>`; break;
    case "container": el.innerHTML = `<div style="padding:15px;background:#f5f6fa;border:1px dashed #aaa;"><strong>Container</strong></div>`; break;
  }

  el.addEventListener("mousedown", startDrag);
  el.addEventListener("click", () => selectElement(el));
  workspace.appendChild(el);
}

// ====== Seleção e Propriedades ======
function selectElement(el) {
  if (selectedElement) selectedElement.classList.remove("selected");
  selectedElement = el;
  el.classList.add("selected");
  updatePropertiesPanel(el);
}

function updatePropertiesPanel(el) {
  const panel = document.getElementById("propsContent");
  panel.innerHTML = `
    <label>Cor de fundo:</label>
    <input type="color" id="bgColor" value="${rgbToHex(window.getComputedStyle(el).backgroundColor)}">

    <label>Tamanho:</label>
    <input type="number" id="width" value="${parseInt(el.offsetWidth)}">

    <label>Altura:</label>
    <input type="number" id="height" value="${parseInt(el.offsetHeight)}">
  `;

  document.getElementById("bgColor").oninput = e => el.style.background = e.target.value;
  document.getElementById("width").oninput = e => el.style.width = e.target.value + "px";
  document.getElementById("height").oninput = e => el.style.height = e.target.value + "px";
}

function rgbToHex(rgb) {
  const match = rgb.match(/\d+/g);
  if (!match) return "#ffffff";
  return "#" + match.map(x => (+x).toString(16).padStart(2, "0")).join("");
}

// ====== Movimento ======
let offsetX, offsetY;
function startDrag(e) {
  if (!e.target.closest(".draggable-element")) return;
  const el = e.target.closest(".draggable-element");
  offsetX = e.offsetX;
  offsetY = e.offsetY;

  function moveAt(ev) {
    el.style.left = ev.pageX - workspace.offsetLeft - offsetX + "px";
    el.style.top = ev.pageY - workspace.offsetTop - offsetY + "px";
  }

  document.addEventListener("mousemove", moveAt);
  document.addEventListener("mouseup", () => {
    document.removeEventListener("mousemove", moveAt);
  }, { once: true });
}

// ====== Funções de Sistema ======
document.getElementById("saveBtn").onclick = () => {
  const elements = [...workspace.querySelectorAll(".draggable-element")].map(el => ({
    html: el.innerHTML,
    style: el.style.cssText
  }));
  const blob = new Blob([JSON.stringify(elements, null, 2)], { type: "application/json" });
  downloadFile(blob, "layout.json");
};

document.getElementById("exportBtn").onclick = () => {
  const content = workspace.innerHTML;
  const blob = new Blob([content], { type: "text/html" });
  downloadFile(blob, "layout.html");
};

document.getElementById("clearBtn").onclick = () => {
  if (confirm("Deseja realmente limpar o projeto?")) {
    workspace.innerHTML = '<p class="placeholder">Arraste os componentes aqui</p>';
  }
};

function downloadFile(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}
