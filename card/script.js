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
            genererToutesLesCartes(results.data);
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

// Vérification stricte : ignore null, vide, "-" et "none"
const estTexteValide = (txt) => {
    if (!txt) return false;
    const str = txt.toString().trim().toLowerCase();
    return str !== "" && str !== "-" && str !== "none";
};

// Stylisation des mots-clés
function styliserMotsCles(texte) {
    if (!texte) return "";
    const motsCles = {
        "apparition": "capsule-apparition",
        "synchronisation": "capsule-synchronisation",
        "rangement": "capsule-rangement",
        "pouvoir unique": "capsule-pouvoir-unique",
        "précision": "capsule-precision"
    };

    let texteFormate = texte;
    for (const [mot, classeCss] of Object.entries(motsCles)) {
        const regex = new RegExp(`(${mot})`, "gi");
        texteFormate = texteFormate.replace(regex, `<span class="capsule-mot ${classeCss}">$1</span>`);
    }
    return texteFormate;
}

// Construction HTML de la carte
function construireHTMLCarte(carte, total) {
    // 1. GÉNÉRATION DE L'IDENTIFIANT // On prend l'ID, on le convertit en chaîne, et on le complète par des zéros à gauche (ex: 1 devient 001)
    const idAffiche =  "PROXY : " + `${String(carte.ID).padStart(3, '0')}/${String(total).padStart(3, '0')}`;
    
    // On récupère le type en minuscule pour pouvoir faire des comparaisons (sort vs personnage)
    const typeCarte = (carte.Type || "").toLowerCase();
    
    // 2. GESTION DE L'ICÔNE DE CLASSE
    // Nettoyage de l'espace, puis création de la balise image si le nom de classe existe
    const classeNom = (carte.Classe || "").trim();
    let classeDisplay = classeNom !== "" ? `<img src="classe/${classeNom}.png" class="classe-icone">` : "";

    // Initialisation des variables qui vont stocker les portions HTML dynamiques
    let htmlStats = "";
    let effetsHTML = "";

    // 3. LOGIQUE CONDITIONNELLE SELON LE TYPE DE CARTE
    // Si la carte est un "sort"
    if (typeCarte === "sort") {
        // Construction du bloc coût spécifique aux sorts
        htmlStats = `
            <div class="cout-sort-box">
                <img src="UI/fond-sort.png" class="cout-sort-icone">
                <span class="cout-sort-chiffre">${carte.Eveil_Cout || "0"}</span>
            </div>`;
        // Ajout des effets de texte si le texte d'éveil est valide (via estTexteValide)
        effetsHTML = estTexteValide(carte.Texte_Eveil) ? `
            <div class="effets-wrapper">
                <div class="sort-bg">
                    <div class="effet-texte">${styliserMotsCles(carte.Texte_Eveil)}</div>
                </div>
            </div>` : "";
    } 
    // Sinon, si c'est un "personnage"
    else if (typeCarte === "personnage") {
        // Construction du bloc ATK / DEF
        htmlStats = `
            <div class="perso-box-atk">
                <img src="UI/fond-atk.png" class="perso-icone-atk">
                <span class="perso-chiffre-atk">${carte.Attaque || "0"}</span>
            </div>
            <div class="perso-box-def">
                <img src="UI/fond-def.png" class="perso-icone-def">
                <span class="perso-chiffre-def">${carte.Defense || "0"}</span>
            </div>`;

        // Assemblage des effets (Eveil + Repli)
        let zonesEffets = "";
        // Si le texte d'éveil est valide, on crée sa boîte dédiée
        if (estTexteValide(carte.Texte_Eveil)) {
            zonesEffets += `
                <div class="perso-eveil-box">
                    <div class="eveil-cout-container">
                        <img src="UI/icon-eveil.png" class="effet-icone-bg">
                        <span class="eveil-cout-chiffre">${carte.Eveil_Cout || "0"}</span>
                    </div>
                    <div class="effet-texte">${styliserMotsCles(carte.Texte_Eveil)}</div>
                </div>`;
        }
        // Si le texte de repli est valide, on crée sa boîte dédiée
        if (estTexteValide(carte.Texte_Repli)) {
            zonesEffets += `
                <div class="perso-repli-box">
                    <img src="UI/icon-repli.png" class="effet-icone">
                    <div class="effet-texte">${styliserMotsCles(carte.Texte_Repli)}</div>
                </div>`;
        }

        // On enveloppe les zones créées dans le wrapper principal si au moins une zone existe
        if (zonesEffets !== "") {
            effetsHTML = `<div class="effets-wrapper"><div class="perso-bg">${zonesEffets}</div></div>`;
        }
    }
    // Sinon, si c'est un "dofus"

else if (typeCarte === "dofus") {
        htmlStats = ""; 

        // On affiche uniquement le texte, sans les conteneurs d'icônes
        let zonesEffets = `
            <div class="dofus-box-1">
                <div class="effet-texte">${styliserMotsCles(carte.Texte_Eveil) || ""}</div>
            </div>
            <div class="dofus-box-2">
                <div class="effet-texte">${styliserMotsCles(carte.Texte_Repli) || ""}</div>
            </div>`;

        effetsHTML = `<div class="effets-wrapper"><div class="perso-bg">${zonesEffets}</div></div>`;
    }


    // 4. ASSEMBLAGE FINAL DU HTML DE LA CARTE
    // Utilisation d'un template string pour injecter toutes les variables créées précédemment
    return `
        <img src="${carte.Illustration}" class="illustration-fond">
        <img src="UI/cadre.png" class="calque-bordure">
        <div class="calque-texte">
            <div class="classe-carte">${classeDisplay}</div>
		<div class="type-carte">${carte.Type || ""}${estTexteValide(carte.Sous_Type) ? ` - ${carte.Sous_Type}` : ""}</div>
            <div class="nom-carte">${carte.Nom || ""}</div>           
            ${(carte.Titre) ? `<div class="titre-personnage">${carte.Titre}</div>` : ""}
            
            ${htmlStats}
            
            <div class="id-carte">${idAffiche}</div>
            <div class="credit-artiste">${carte.Illustrateur || ""}</div>
            
            ${effetsHTML}
        </div>`;
}

// Export Image
boutonTelecharger.addEventListener("click", () => {
    if (boutonTelecharger.disabled) return;

    document.querySelectorAll(".carte-item").forEach((item) => {
        // 1. On récupère l'ID via le dataset (plus besoin de chercher .id-carte dans le HTML)
        // Si jamais l'ID est introuvable, on met un timestamp par sécurité
        const idPropre = item.dataset.id ? item.dataset.id.trim() : Date.now();

        // 2. On lance la capture
        html2canvas(item, { 
            useCORS: true, 
            scale: 1, 
            width: 372, 
            height: 520,
            backgroundColor: null // On garde le fond transparent de ton ancienne méthode si tu préfères !
        }).then(canvas => {
            const link = document.createElement("a");
            link.download = `proxy-carte_${idPropre}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        }).catch(err => {
            console.error("Erreur html2canvas sur la carte " + idPropre, err);
        });
    });
});
