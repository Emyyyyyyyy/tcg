const boutonCharger = document.getElementById("charger");
const boutonTelecharger = document.getElementById("telecharger");
const inputCSV = document.getElementById("csvFile");
const renderZone = document.getElementById("carte-render");
let listeCartes = [];

boutonCharger.addEventListener("click", () => inputCSV.click());

inputCSV.addEventListener("change", (e) => {
    Papa.parse(e.target.files[0], {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            listeCartes = results.data;
            if(listeCartes.length > 0) afficherCarte(listeCartes[0], listeCartes.length);
        }
    });
});

function afficherCarte(carte, total) {
    // Calcul de l'ID formaté (ex: 001/050)
    const idAffiche = `${String(carte.ID).padStart(3, '0')}/${String(total).padStart(3, '0')}`;
    
    // Logique Type / Sous-type
    let typeDisplay = `<span class="type-principal">${carte.Type}</span>`;
    if (carte.Sous_Type && carte.Sous_Type.trim() !== "") {
        typeDisplay += ` — <i>${carte.Sous_Type}</i>`;
    }
    
    // Titre de personnage
    const titreDisplay = (carte.Titre && carte.Titre.trim() !== "") 
        ? `<div class="titre-personnage">${carte.Titre}</div>` 
        : "";
    
    // Logique effets
    let effetsHTML = "";
    if (carte.Texte_Eveil && carte.Texte_Eveil.trim() !== "") {
        effetsHTML += `<div class="effet-box eveil-bg"><strong>Éveil (${carte.Eveil_Cout})</strong>${carte.Texte_Eveil}</div>`;
    }
    if (carte.Texte_Repli && carte.Texte_Repli.trim() !== "") {
        effetsHTML += `<div class="effet-box repli-bg"><strong>Repli</strong>${carte.Texte_Repli}</div>`;
    }

    // Rendu de la carte : on utilise l'ID pour le nom de l'image
    renderZone.innerHTML = `
        <img src="assets/${carte.ID}.jpg" class="illustration-fond">
        <img src="cadre.png" class="calque-bordure">
        <div class="calque-texte">
            <div class="type-carte">${typeDisplay}</div>
            <div class="titre-carte">${carte.Nom}</div>
            ${titreDisplay}
            <div class="stats-carte">
                <span class="stat-atk">${carte.Attaque}</span> 
                <span class="stat-def">${carte.Defense}</span>
            </div>
            <div class="id-carte">${idAffiche}</div>
            <div class="credit-artiste">${carte.Illustrateur || ""}</div>
            <div class="effets-wrapper">${effetsHTML}</div>
        </div>`;
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