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
            <img src="${carte.Illustration}" class="illustration-fond" onerror="this.src='default.jpg';">
        `;
        
        renderZone.appendChild(carteContainer);
    });
}

boutonTelecharger.addEventListener("click", () => {
    html2canvas(renderZone, { 
        useCORS: true, 
        scale: 1, 
        width: 372, 
        height: 520,
        backgroundColor: null 
    }).then(canvas => {
        const link = document.createElement("a");
        link.download = `carte_${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
});

});
