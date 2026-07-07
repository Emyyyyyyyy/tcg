const boutonCharger = document.getElementById("charger");
const boutonTelecharger = document.getElementById("telecharger"); // Ajoute un bouton dans ton HTML
const inputJSON = document.getElementById("jsonFile");
const renderZone = document.getElementById("carte-render");

boutonCharger.addEventListener("click", () => inputJSON.click());

inputJSON.addEventListener("change", (e) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        const cartes = JSON.parse(event.target.result);
        afficherCarte(cartes[0]);
    };
    reader.readAsText(e.target.files[0]);
});

function afficherCarte(carte) {
    renderZone.innerHTML = `
        <div id="contenu-carte">
            <img src="assets/${carte.id}.jpg">
            <div class="infos">
                <h3>${carte.nom}</h3>
                <p>Attaque: ${carte.attaque} | Défense: ${carte.defense}</p>
            </div>
            ${carte.eveil ? `<div class="eveil-box"><strong>Éveil (${carte.eveilCost})</strong><br>${carte.eveilText}</div>` : ''}
        </div>
    `;
}

// C'est ici que la magie opère
boutonTelecharger.addEventListener("click", () => {
    html2canvas(renderZone).then(canvas => {
        const link = document.createElement("a");
        link.download = "ma-carte.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
});