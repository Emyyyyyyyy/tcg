const boutonCharger = document.getElementById("charger");
const boutonTelecharger = document.getElementById("telecharger");
const inputCSV = document.getElementById("csvFile");
const renderZone = document.getElementById("carte-render");

boutonTelecharger.disabled = true;
boutonTelecharger.style.opacity = "0.5";
boutonTelecharger.style.cursor = "not-allowed";

boutonCharger.addEventListener("click", () => inputCSV.click());

inputCSV.addEventListener("change", (e) => {
    if (!e.target.files[0]) return;
    Papa.parse(e.target.files[0], {
        header: true,
        skipEmptyLines: true,
        encoding: "ISO-8859-1",
        complete: function(results) {
            genererImages(results.data);
            boutonTelecharger.disabled = false;
            boutonTelecharger.style.opacity = "1";
            boutonTelecharger.style.cursor = "pointer";
        }
    });
});

function genererImages(cartes) {
    renderZone.innerHTML = "";
    cartes.forEach((carte, index) => {
        const carteContainer = document.createElement("div");
        carteContainer.className = "carte-item";
        
        // On stocke l'ID discrètement dans la balise pour s'en servir lors du téléchargement
        carteContainer.dataset.id = carte.ID || index;
        
        // On injecte UNIQUEMENT l'image
        carteContainer.innerHTML = `
            <img src="${carte.Illustration}" crossorigin="anonymous" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='default.jpg';">
        `;
        
        renderZone.appendChild(carteContainer);
    });
}

// Export Image
boutonTelecharger.addEventListener("click", () => {
    if (boutonTelecharger.disabled) return;
    
    document.querySelectorAll(".carte-item").forEach((item) => {
        // On récupère l'ID qu'on a caché dans le dataset
        const idPropre = item.dataset.id;
        
        html2canvas(item, { useCORS: true, scale: 1, width: 372, height: 520 }).then(canvas => {
            const link = document.createElement("a");
            link.download = `image_${idPropre}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        });
    });
});
