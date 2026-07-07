const boutonCharger = document.getElementById("charger");
const boutonTelecharger = document.getElementById("telecharger");
const inputJSON = document.getElementById("jsonFile");
const inputImage = document.getElementById("imageFile");

const carteRender = document.getElementById("carte-render");
const carteImage = document.getElementById("carte-image");
const txtNom = document.getElementById("txt-nom");
const txtStats = document.getElementById("txt-stats");
const boxEveil = document.getElementById("box-eveil");
const txtEveilTitre = document.getElementById("txt-eveil-titre");
const txtEveilDesc = document.getElementById("txt-eveil-desc");

let carteData = null;

// Chargement du JSON
boutonCharger.addEventListener("click", () => {
    inputJSON.value = "";
    inputJSON.click();
});

inputJSON.addEventListener("change", (e) => {
    const fichier = e.target.files[0];
    if (!fichier) return;

    const lecteur = new FileReader();
    lecteur.onload = function(event) {
        try {
            const donnees = JSON.parse(event.target.result);
            if (donnees.length > 0) {
                carteData = donnees[0];
                inputImage.value = "";
                inputImage.click();
            }
        } catch(err) {
            alert("Erreur JSON");
        }
    };
    lecteur.readAsText(fichier);
});

// Chargement de l'image en données brutes pour éviter le blocage local
inputImage.addEventListener("change", (e) => {
    const fichier = e.target.files[0];
    if (!fichier) return;

    const lecteur = new FileReader();
    lecteur.onload = function(event) {
        carteImage.src = event.target.result;
        
        txtNom.innerText = carteData.nom;
        txtStats.innerText = `Attaque : ${carteData.attaque} | Défense : ${carteData.defense}`;
        
        if (carteData.eveil) {
            txtEveilTitre.innerText = `Éveil (${carteData.eveilCost}) :`;
            txtEveilDesc.innerText = carteData.eveilText;
            boxEveil.style.display = "flex";
        } else {
            boxEveil.style.display = "none";
        }
        
        carteRender.style.display = "block";
        boutonTelecharger.style.display = "inline-block";
    };
    lecteur.readAsDataURL(fichier);
});

// Téléchargement via html2canvas
boutonTelecharger.addEventListener("click", () => {
    html2canvas(carteRender, {
        scale: 2,
        logging: false,
        useCORS: true
    }).then(canvas => {
        const lien = document.createElement("a");
        lien.download = "carte_" + (carteData.id || "export") + ".png";
        lien.href = canvas.toDataURL("image/png");
        lien.click();
    });
});