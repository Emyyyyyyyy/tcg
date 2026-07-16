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

function afficherCarte(carte, total) {
    const hasEveil = carte.eveilText && carte.eveilText.trim() !== "";
    const hasRepli = carte.repliText && carte.repliText.trim() !== "";
    const idAffiche = `${String(carte.id).padStart(3, '0')}/${String(total).padStart(3, '0')}`;
    
    // Logique type/sous-type conditionnelle
    let typeDisplay = `<span class="type-principal">${carte.type}</span>`;
    if (carte.sousType && carte.sousType.trim() !== "") {
        typeDisplay += ` — <i>${carte.sousType}</i>`;
    }

    // Logique titre conditionnelle
    const titreDisplay = (carte.titre && carte.titre.trim() !== "") 
        ? `<div class="titre-personnage">${carte.titre}</div>` 
        : "";

    let effetsHTML = "";
    if (hasEveil && hasRepli) {
        effetsHTML = `<div class="effets-wrapper">
                        <div class="effet-box eveil-bg"><strong>Éveil (${carte.eveilCost})</strong>${carte.eveilText}</div>
                        <div class="effet-box repli-bg"><strong>Repli</strong>${carte.repliText}</div>
                      </div>`;
    } else if (hasEveil) {
        effetsHTML = `<div class="effets-wrapper"><div class="effet-box eveil-bg" style="flex:2"><strong>Éveil (${carte.eveilCost})</strong>${carte.eveilText}</div></div>`;
    } else if (hasRepli) {
        effetsHTML = `<div class="effets-wrapper"><div class="effet-box repli-bg" style="flex:2"><strong>Repli</strong>${carte.repliText}</div></div>`;
    }

    renderZone.innerHTML = `
        <img src="assets/${carte.id}.jpg" class="illustration-fond">
        <img src="cadre.png" class="calque-bordure">
        <div class="calque-texte">
            <div class="type-carte">${typeDisplay}</div>
            <div class="titre-carte">${carte.nom}</div>
            ${titreDisplay}
            <div class="stats-carte">
                <span class="stat-atk">${carte.attaque}</span> 
                <span class="stat-def">${carte.defense}</span>
            </div>
            <div class="id-carte">${idAffiche}</div>
            <div class="credit-artiste">${carte.illu || ""}</div>
            ${effetsHTML}
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
        link.download = `carte_${error_Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
});
