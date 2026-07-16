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
            // On envoie UNIQUEMENT la première ligne du CSV (la carte 1)
            genererLaCarte(results.data[0]);
            
            boutonTelecharger.disabled = false;
            boutonTelecharger.style.opacity = "1";
            boutonTelecharger.style.cursor = "pointer";
        }
    });
});

// Affiche une seule carte, sans aucune boucle
function genererLaCarte(carte) {
    if (!carte) return; // Sécurité si le CSV est vide
    
    renderZone.innerHTML = ""; // On nettoie la zone
    
    const carteContainer = document.createElement("div");
    carteContainer.className = "carte-item";
    carteContainer.innerHTML = construireHTMLCarte(carte);
    
    renderZone.appendChild(carteContainer);
}

// Construit uniquement la balise de l'image d'illustration
function construireHTMLCarte(carte) {
return `<img src="${carte.Illustration}" crossorigin="anonymous" class="illustration-fond" style="width: 100%; height: 100%; object-fit: cover;">`;}

// Télécharge uniquement cette carte unique
boutonTelecharger.addEventListener("click", () => {
    if (boutonTelecharger.disabled) return;

    // On cible la seule carte présente à l'écran
    const item = document.querySelector(".carte-item");
    if (!item) return;

    html2canvas(item, { 
        useCORS: true, 
        scale: 1, 
        width: 372, 
        height: 520,
        backgroundColor: null
    }).then(canvas => {
        const link = document.createElement("a");
        link.download = `illustration__one_unique.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
});
