const boutonImages = document.getElementById("chargerImages");
const boutonCharger = document.getElementById("charger");
const boutonTelecharger = document.getElementById("telecharger");
const inputCSV = document.getElementById("csvFile");
const zoneCartes = document.getElementById("zoneCartes");
const message = document.getElementById("messageEtape");

let dossierImages = null;
let exportsCartes = [];

// Dictionnaire des mots-clés et leurs couleurs
const dictionnaireCapsules = {
    "apparition": "rgba(155, 89, 182, 0.8)",      // Violet
    "précision": "rgba(46, 204, 113, 0.8)",       // Vert
    "continu": "rgba(60, 60, 60, 0.8)",        // Gris
    "overkill": "rgba(192, 57, 43, 0.8)",         // Rouge Sang
    "synchronisation": "rgba(255, 255, 255, 0.1)", // Transparent
    "pouvoir unique": "rgba(255, 255, 255, 0.1)",  // Transparent
    "résonance": "rgba(44, 62, 80, 0.8)",         // Bleu Marine
    "rangement": "rgba(0, 0, 0, 0.8)"             // Noir
};

// Fonction pour transformer le texte en capsules ET mettre en gras
function transformerEnCapsules(texte) {
    if (!texte) return "";
    let texteTransforme = texte;
    
    // 1. GESTION DES CAPSULES (Identique à avant)
    const cles = Object.keys(dictionnaireCapsules).sort((a, b) => b.length - a.length);
    for (const motCle of cles) {
        const regex = new RegExp(`\\b${motCle}(\\s[\\d/X]+)?\\b`, 'gi');
        texteTransforme = texteTransforme.replace(regex, (match) => {
            return `<span class="capsule" style="background-color: ${dictionnaireCapsules[motCle.toLowerCase()]}">${match}</span>`;
        });
    }

    // 2. GESTION DU GRAS AUTOMATIQUE (Nouveau)
    const motsCibles = "\\d+|wakfu|eliacube|défenseur|quartiers?|main|défausse|condamn(?:er|ez|é(?:e?s?)?)|atq|def|inspecte(?:er|ez|é(?:e?s?)?)|révéle(?:er|ez|é(?:e?s?)?)";
    const regexGras = new RegExp(`(<[^>]+>)|(?<![\\p{L}\\p{N}])(${motsCibles})(?![\\p{L}\\p{N}])`, 'giu');

    texteTransforme = texteTransforme.replace(regexGras, (match, tag, mot) => {
        if (tag) return tag; // Si c'est du HTML (ex: une capsule ou un <br>), on n'y touche pas
        return `<strong>${mot}</strong>`; // Sinon, on enveloppe le mot trouvé dans une balise forte
    });

    return texteTransforme;
}

const configCouleurs = {
    "emeraude": { eveil: "rgba(141, 195, 81, 0.85)", repli: "rgba(24, 144, 81, 0.8)" },
    "turquoise": { eveil: "rgba(135, 206, 235, 0.85)", repli: "rgba(20, 35, 75, 0.8)" }, 
    "ocre": { eveil: "rgba(255, 167, 38, 0.85)", repli: "rgba(150, 60, 10, 0.8)" },     
    "pourpre": { eveil: "rgba(229, 115, 115, 0.85)", repli: "rgba(100, 15, 15, 0.8)" } 
};

boutonImages.onclick = async () => {
    try {
        dossierImages = await window.showDirectoryPicker();
        message.textContent = "Dossier chargé. Étape 2 : Charger le CSV.";
        boutonCharger.disabled = false;
    } catch (e) { console.error("Accès dossier refusé", e); }
};

boutonCharger.onclick = () => inputCSV.click();

inputCSV.onchange = (e) => {

    message.textContent = "Création des proxys en cours...";

    Papa.parse(e.target.files[0], {
        header: true, delimiter: ";", skipEmptyLines: true,
        complete: async (res) => {
            zoneCartes.innerHTML = "";
            exportsCartes = [];
            for (const data of res.data) await genererCarte(data);
            boutonTelecharger.disabled = false;
            message.textContent = "Génération terminée. " + exportsCartes.length + " cartes prêtes.";
        }
    });
};

async function genererCarte(data) {
    const imgUrl = await trouverFichier(data.Nom?.trim());
    const conteneur = document.createElement("div");
    conteneur.className = "carte-container";
    
    const type = data.Type ? data.Type.trim().toLowerCase() : "";
    const div = document.createElement("div");
    div.className = `carte carte-${type}`;
    div.dataset.id = data.ID;
    
    let styleCouleurEveil = "";
    let styleCouleurRepli = "";
    if (type === "dofus") {
        const classeNom = data.Classe ? data.Classe.trim().toLowerCase() : "neutre";
        const couleurs = configCouleurs[classeNom] || { eveil: "rgba(46,68,114,.85)", repli: "rgba(46,68,114,.85)" };
        styleCouleurEveil = `style="background-color: ${couleurs.eveil} !important;"`;
        styleCouleurRepli = `style="background-color: ${couleurs.repli} !important;"`;
    }

    const cadreUrl = await trouverFichier("cadre");
    const classeUrl = await trouverFichier(data.Classe?.trim());
    const fondSortUrl = await trouverFichier("fond-sort");
    const sousType = (data.Sous_Type && data.Sous_Type.toLowerCase() !== "none") ? ` - ${data.Sous_Type}` : "";

    // NOUVEAU : On vérifie si la carte personnage n'a pas de texte (ou juste des "-")
    const pasDeTextePerso = (!data.Texte_Eveil || data.Texte_Eveil === "-") && (!data.Texte_Repli || data.Texte_Repli === "-");
    const classeStats = pasDeTextePerso ? "calque-stats sans-box" : "calque-stats";

    div.innerHTML = `
        ${imgUrl ? `<img src="${imgUrl}" class="illustration-fond">` : ""}
        ${cadreUrl ? `<img src="${cadreUrl}" class="calque-bordure">` : ""}
        ${classeUrl ? `<img src="${classeUrl}" class="classe-icone">` : ""}

        <div class="calque-haut">
            <div class="soustype-carte">${data.Classe || ""}${sousType}</div>
            <div class="nom-carte">${data.Nom || ""}</div>
            <div class="titre-carte">${data.Titre || ""}</div>
        </div>

        ${type === "personnage" ? `
            <div class="${classeStats}">
                <div class="stat-box" style="background-image: url('${await trouverFichier("fond-atk")}')">
                    <span class="chiffre-stat-atk">${data.Attaque || "0"}</span>
                </div>
                <div class="stat-box" style="background-image: url('${await trouverFichier("fond-def")}')">
                    <span class="chiffre-stat-def">${data.Defense || "0"}</span>
                </div>
            </div>

            ${!pasDeTextePerso ? `
                ${((data.Texte_Eveil && data.Texte_Eveil !== "-") && (data.Texte_Repli && data.Texte_Repli !== "-")) ? `
                    <div class="calque-texte-multiple">
                        <div class="perso-section-eveil">
                            <div class="icon-container"><img src="${await trouverFichier("icon-eveil")}" class="icon-section"><span class="chiffre-icon">${data.Eveil_Cout || "0"}</span></div>
                            <span class="texte-perso-multiple">${transformerEnCapsules(data.Texte_Eveil)}</span>
                        </div>
                        <div class="perso-section-repli">
                            <div class="icon-container"><img src="${await trouverFichier("icon-repli")}" class="icon-section"></div>
                            <span class="texte-perso-multiple">${transformerEnCapsules(data.Texte_Repli)}</span>
                        </div>
                    </div>
                ` : `
                    <div class="calque-texte-unique ${(data.Texte_Eveil === "-" || !data.Texte_Eveil) ? 'style-repli' : ''}">
                        ${(data.Texte_Eveil && data.Texte_Eveil !== "-") ? 
                            `<div class="icon-container"><img src="${await trouverFichier("icon-eveil")}" class="icon-section"><span class="chiffre-icon">${data.Eveil_Cout || "0"}</span></div>
                             <span class="texte-perso-unique">${transformerEnCapsules(data.Texte_Eveil)}</span>` 
                            : 
                            `<div class="icon-container"><img src="${await trouverFichier("icon-repli")}" class="icon-section"></div>
                             <span class="texte-perso-unique">${transformerEnCapsules(data.Texte_Repli)}</span>`
                        }
                    </div>
                `}
            ` : ""}
        ` : ""}

        ${type === "sort" ? `
            <div class="calque-cout" style="background-image: url('${fondSortUrl}')"><span class="chiffre-cout">${data.Eveil_Cout || ""}</span></div>
            <div class="calque-texte-eveil"><span class="texte-eveil">${transformerEnCapsules(data.Texte_Eveil)}</span></div>
        ` : ""}

        ${type === "dofus" ? `
            <div class="calque-dofus-box">
                <div class="dofus-section-eveil" ${styleCouleurEveil}><span class="texte-eveil">${transformerEnCapsules(data.Texte_Eveil)}</span></div>
                <div class="dofus-section-repli" ${styleCouleurRepli}><span class="texte-repli">${transformerEnCapsules(data.Texte_Repli)}</span></div>
            </div>
        ` : ""}

        <div class="id-carte">ID: ${data.ID || ""}</div>
        <div class="credit-artiste">${data.Illustrateur || ""}</div>
        <div class="type-carte-texte ${(type === 'personnage' && pasDeTextePerso) ? 'type-perso-sans-texte' : ''}">${data.Type || ""}</div>
    `;

    const btn = document.createElement("button");
    btn.textContent = "Télécharger";
    btn.onclick = async () => { btn.disabled = true; await capturerEtDl(div, data.ID); btn.disabled = false; };
    conteneur.appendChild(div);
    conteneur.appendChild(btn);
    zoneCartes.appendChild(conteneur);
    exportsCartes.push({ id: data.ID, element: div });
}

async function trouverFichier(nom) {
    if (!nom || !dossierImages) return null;
    async function explorer(dossier) {
        for await (const entry of dossier.values()) {
            if (entry.kind === "file" && entry.name.toLowerCase().startsWith(nom.toLowerCase() + ".")) return URL.createObjectURL(await entry.getFile());
            if (entry.kind === "directory") { const res = await explorer(entry); if (res) return res; }
        }
    }
    return await explorer(dossierImages);
}

// Version allégée et optimisée pour ne pas saturer le navigateur en boucle
async function genererCanvasCarte(element) {
    return await html2canvas(element, { 
        useCORS: true, 
        allowTaint: true, 
        backgroundColor: null,
        scale: 1 // On repasse à 1 pour le ZIP afin de préserver la mémoire du PC
    });
}

async function capturerEtDl(element, id) {
    await new Promise(resolve => setTimeout(resolve, 300));

    const canvas = await html2canvas(element, { 
        useCORS: true, 
        allowTaint: true, 
        backgroundColor: null,
        scale: 2 
    });

    const link = document.createElement("a");
    link.download = (id || "carte") + ".png";
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

boutonTelecharger.onclick = async () => {
    boutonTelecharger.disabled = true;
    message.textContent = "Préparation du ZIP en cours...";
    
    const zip = new JSZip();
    
    for (let i = 0; i < exportsCartes.length; i++) {
        const item = exportsCartes[i];
        
        // 1. On met à jour l'affichage en direct
        message.textContent = `Traitement de la carte ${i + 1} sur ${exportsCartes.length}...`;
        
        // 2. PAUSE VITALE (150ms) : Elle permet au texte de s'afficher à l'écran ET laisse le temps aux capsules de se stabiliser !
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // 3. Rendu direct optimisé (Scale 1.5 : meilleur équilibre entre capsules propres et rapidité)
        const canvas = await html2canvas(item.element, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            scale: 1.5 
        });
        
        const dataUrl = canvas.toDataURL("image/png").split(',')[1];
        
        // 4. Sécurité absolue : on nettoie l'ID de tout caractère qui ferait planter le ZIP
        const nomFichier = (item.id || `carte_${i+1}`).toString().replace(/[\/\\?%*:|"<>]/g, '_');
        
        zip.file(nomFichier + ".png", dataUrl, { base64: true });
    }
    
    message.textContent = "Compression finale du ZIP en cours (le navigateur assemble les fichiers)...";
    
    zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, "card_list.zip");
        message.textContent = "Téléchargement terminé !";
        boutonTelecharger.disabled = false;
    }).catch(err => {
        console.error("Erreur ZIP :", err);
        message.textContent = "Une erreur est survenue lors de la création du ZIP.";
        boutonTelecharger.disabled = false;
    });
};