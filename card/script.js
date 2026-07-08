const boutonCharger = document.getElementById("charger");
const boutonTelecharger = document.getElementById("telecharger");
const inputCSV = document.getElementById("csvFile");
const renderZone = document.getElementById("carte-render");

// Initialisation : Désactiver le bouton de téléchargement
boutonTelecharger.disabled = true;
boutonTelecharger.style.opacity = "0.5";
boutonTelecharger.style.cursor = "not-allowed";

boutonCharger.addEventListener("click", () => {
    inputCSV.click();
});

inputCSV.addEventListener("change", (e) => {
    if (!e.target.files[0]) return;
    
    Papa.parse(e.target.files[0], {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            genererToutesLesCartes(results.data);
            
            // Une fois le CSV chargé, on active le bouton
            boutonTelecharger.disabled = false;
            boutonTelecharger.style.opacity = "1";
            boutonTelecharger.style.cursor = "pointer";
        }
    });
});

function genererToutesLesCartes(cartes) {
    renderZone.innerHTML = "";
    cartes.forEach((carte) => {
        const carteContainer = document.createElement("div");
        carteContainer.className = "carte-item";
        carteContainer.innerHTML = construireHTMLCarte(carte, cartes.length);
        renderZone.appendChild(carteContainer);
    });
}

function construireHTMLCarte(carte, total) {
    const idAffiche = `${String(carte.ID).padStart(3, '0')}/${String(total).padStart(3, '0')}`;
    const classeDisplay = `<div class="classe-carte">${carte.Classe || ""}</div>`;
    
    let typeDisplay = "";
    if (carte.Type && carte.Type.trim() !== "") {
        typeDisplay = `<span class="type-principal">${carte.Type}</span>`;
        if (carte.Sous_Type && carte.Sous_Type.trim() !== "") typeDisplay += ` — <i>${carte.Sous_Type}</i>`;
    }

    const titreDisplay = (carte.Titre && carte.Titre.trim() !== "") ? `<div class="titre-personnage">${carte.Titre}</div>` : "";
    
    let effetsHTML = "";
    
    // Bloc Éveil sans le mot "Éveil", avec hexagone
    if (carte.Texte_Eveil && carte.Texte_Eveil.trim() !== "") {
        effetsHTML += `
            <div class="effet-box eveil-bg">
                <div class="hexagone">${carte.Eveil_Cout}</div>
                <div class="effet-texte">${carte.Texte_Eveil}</div>
            </div>`;
    }
    
    // Bloc Repli (si tu veux garder le mot Repli, sinon on l'enlève aussi)
	if (carte.Texte_Repli && carte.Texte_Repli.trim() !== "") {
    	effetsHTML += `
        	<div class="effet-box repli-bg">
        	    <div class="effet-texte">${carte.Texte_Repli}</div>
        	</div>`;
	}

    return `
        <img src="assets/${carte.ID}.jpg" class="illustration-fond" onerror="this.onerror=null; this.src='assets/${carte.ID}.png';">
        <img src="cadre.png" class="calque-bordure">
        <div class="calque-texte">
            ${classeDisplay}
            <div class="type-carte">${typeDisplay}</div>
            <div class="nom-carte">${carte.Nom || ""}</div>
            ${titreDisplay}
            <div class="stats-carte">
                <span class="stat-atk">${carte.Attaque || "0"}</span> 
                <span class="stat-def">${carte.Defense || "0"}</span>
            </div>
            <div class="id-carte">${idAffiche}</div>
            <div class="credit-artiste">${carte.Illustrateur || ""}</div>
            <div class="effets-wrapper">${effetsHTML}</div>
        </div>`;
}

boutonTelecharger.addEventListener("click", () => {
    // Vérification de sécurité supplémentaire
    if (boutonTelecharger.disabled) return;

    const items = document.querySelectorAll(".carte-item");
    
    items.forEach((item) => {
        const idTexte = item.querySelector(".id-carte").innerText; // ex: "001/050"
        const idPropre = idTexte.split('/')[0]; // On garde "001"
        
        html2canvas(item, { useCORS: true, scale: 1, width: 372, height: 520 }).then(canvas => {
            const link = document.createElement("a");
            link.download = `carte_${idPropre}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        });
    });
});