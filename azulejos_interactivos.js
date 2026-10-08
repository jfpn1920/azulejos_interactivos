// ===== CONFIGURACIÓN =====
const CLAVE = "azulejosInteractivos"; // clave con la que se guarda en localStorage
// Cada paleta tiene 5 colores; el clic avanza de uno en uno y al final vuelve al primero
const PALETAS = {
    mediterraneo: ["#ffffff", "#2fb4c9", "#f2b632", "#e8664a", "#17306b"],
    atardecer: ["#fff4e0", "#ffb48a", "#f0647c", "#9b4a9e", "#3b2a6e"],
    bosque: ["#f2f7ee", "#b9d98a", "#5fa55a", "#2e7d5b", "#1c4a3a"]
};
const NCOLORES = 5; // cantidad de colores de cada paleta
// "azulejos" guarda el número de color (0 a 4) de cada azulejo, de izquierda a derecha y de arriba abajo
const ORIGINAL = { lado: 4, paleta: "mediterraneo", azulejos: [], clics: 0 };
let estado = { ...ORIGINAL }; // copia de los valores originales
const $ = (id) => document.getElementById(id); // atajo para buscar elementos por id
// ===== LOCALSTORAGE =====
// Guarda el estado completo como texto JSON
function guardar() { localStorage.setItem(CLAVE, JSON.stringify(estado)); }
// Recupera lo guardado (si existe) y corrige cualquier dato que no sea válido
function cargar() {
    const g = localStorage.getItem(CLAVE);
    if (g) estado = { ...ORIGINAL, ...JSON.parse(g) };
    if (!PALETAS[estado.paleta]) estado.paleta = ORIGINAL.paleta;
    if (![3, 4, 5, 6].includes(estado.lado)) estado.lado = ORIGINAL.lado;
    if (!Array.isArray(estado.azulejos)) estado.azulejos = [];
}
// ===== TABLERO =====
// Asegura que haya un número de color por cada azulejo (lado × lado)
function ajustar() {
    const total = estado.lado * estado.lado;
    if (estado.azulejos.length !== total) estado.azulejos = new Array(total).fill(0);
}
// Crea un botón por cada azulejo y le dice a CSS cuántas columnas usar
function construir() {
    const tablero = $("tablero");
    tablero.innerHTML = "";
    tablero.style.setProperty("--lado", estado.lado);
    estado.azulejos.forEach((_, i) => {
        const boton = document.createElement("button");
        boton.className = "azulejo"; boton.dataset.indice = i; // el índice dice cuál azulejo es
        tablero.appendChild(boton);
    });
}
// Pinta cada azulejo con su color, la leyenda y las estadísticas (sin recrear los botones)
function colorear() {
    const colores = PALETAS[estado.paleta];
    [...$("tablero").children].forEach((boton, i) => {
        const c = estado.azulejos[i];
        boton.style.setProperty("--color", colores[c]);
        boton.setAttribute("aria-label", "Azulejo " + (i + 1) + ", color " + (c + 1) + " de " + NCOLORES);
    });
    $("leyenda").innerHTML = "";
    colores.forEach((color) => {
        const muestra = document.createElement("span");
        muestra.style.background = color;
        $("leyenda").appendChild(muestra);
    });
    $("s-clics").textContent = estado.clics;
    $("s-color").textContent = estado.azulejos.filter((c) => c !== 0).length + " de " + estado.azulejos.length;
}
// ===== ACCIONES =====
// Clic en un azulejo: pasa al siguiente color
function cambiarColor(e) {
    const boton = e.target.closest(".azulejo");
    if (!boton) return; // si el clic no fue sobre un azulejo, no hace nada
    const i = Number(boton.dataset.indice);
    estado.azulejos[i] = (estado.azulejos[i] + 1) % NCOLORES;
    estado.clics++;
    guardar(); colorear();
}
// Nuevo tamaño: se crea un tablero en blanco
function cambiarLado() {
    estado.lado = Number($("campo-lado").value);
    estado.azulejos = [];
    ajustar(); construir(); colorear(); guardar();
}
// Nueva paleta: los azulejos conservan su número de color, solo cambia el tono
function cambiarPaleta() { estado.paleta = $("campo-paleta").value; colorear(); guardar(); }
// Pinta cada azulejo con un color al azar
function azar() {
    estado.azulejos = estado.azulejos.map(() => Math.floor(Math.random() * NCOLORES));
    guardar(); colorear();
}
// Deja todo en blanco y el contador en cero
function reiniciar() {
    estado.azulejos = estado.azulejos.map(() => 0);
    estado.clics = 0;
    guardar(); colorear();
}
// ===== EVENTOS =====
// Un solo "escucha" en el tablero sirve para todos los azulejos
$("tablero").addEventListener("click", cambiarColor);
$("campo-lado").addEventListener("change", cambiarLado);
$("campo-paleta").addEventListener("change", cambiarPaleta);
$("btn-azar").addEventListener("click", azar);
$("btn-reiniciar").addEventListener("click", reiniciar);
// ===== ARRANQUE =====
// Al cargar la página se recupera lo guardado y se muestra de nuevo
cargar();
ajustar();
$("campo-lado").value = estado.lado;
$("campo-paleta").value = estado.paleta;
construir();
colorear();