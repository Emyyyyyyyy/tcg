const boutonImages = document.getElementById("chargerImages");
const boutonCharger = document.getElementById("charger");
const boutonTelecharger = document.getElementById("telecharger");
const inputCSV = document.getElementById("csvFile");
const zoneCartes = document.getElementById("zoneCartes");
const message = document.getElementById("messageEtape");

let dossierImages = null;
let exportsCartes = [];

// ===============================
// 1. GESTION DES ETAPES
// ===============================
boutonImages.onclick = async () => {
    try {
        dossierImages = await window.showDirectoryPicker();
        message.textContent = "Dossier chargé. Étape 2 : Charger le CSV.";
        boutonCharger.disabled = false;
    } catch (e) { console.error("Accès dossier refusé", e); }
};

boutonCharger.onclick = () => inputCSV.click();

// ===============================
// 2. LECTURE CSV ET GÉNÉRATION
// ===============================
inputCSV.onchange = (e) => {
    Papa.parse(e.target.files[0], {
        header: true, delimiter: ";", skipEmptyLines: true,
        complete: async (res) => {
            zoneCartes.innerHTML = "";
            exportsCartes = [];
            for (const data of res.data) {
                await genererCarte(data);
            }
            boutonTelecharger.disabled = false;
            message.textContent = "Génération terminée. " + exportsCartes.length + " cartes prêtes.";
        }
    });
};

// ===============================
// 3. GÉNÉRATION DE L'INTERFACE CARTE
// ===============================
async function genererCarte(data) {
    const conteneur = document.createElement("div");
    conteneur.className = "carte-container";
    
    const div = document.createElement("div");
    div.className = "carte";
    div.dataset.id = data.ID;
    
    // Recherche des ressources
    const imgUrl = await trouverFichier(data.Nom?.trim());
    const cadreUrl = await trouverFichier("cadre");
    const classeUrl = await trouverFichier(data.Classe?.trim());
    const type = data.Type || "";
    const sousType = (data.Sous_Type && data.Sous_Type.toLowerCase() !== "none") ? ` - ${data.Sous_Type}` : "";
    const texteTypeComplet = `${type}${sousType}`;

    // --- ICI : J'ai remis tout ton HTML pour que les textes s'affichent ---
    div.innerHTML = `
        ${imgUrl ? `<img src="${imgUrl}" class="illustration-fond">` : ""}
        ${cadreUrl ? `<img src="${cadreUrl}" class="calque-bordure">` : ""}
	${classeUrl ? `<img src="${classeUrl}" class="classe-icone">` : ""}

	<div class="calque-texte">
            <div class="nom-carte">${data.Nom || ""}</div>
            <div class="type-carte">${texteTypeComplet}</div>
            <div class="titre-carte">${data.Titre || ""}</div>
        </div>

	<div class="id-carte">ID: ${data.ID || ""}</div>
        <div class="credit-artiste">${data.Illustrateur || ""}</div>

    `;

    const btn = document.createElement("button");
    btn.textContent = "Télécharger cette carte";
    btn.onclick = async () => {
        btn.disabled = true;
        btn.textContent = "Capture...";
        await capturerEtDl(div, data.Nom);
        btn.textContent = "Télécharger cette carte";
        btn.disabled = false;
    };
    
    conteneur.appendChild(div);
    conteneur.appendChild(btn);
    zoneCartes.appendChild(conteneur);
    
    exportsCartes.push({ nom: data.Nom, element: div });
}

// ===============================
// 4. MOTEUR DE RECHERCHE FICHIER
// ===============================
async function trouverFichier(nom) {
    if (!nom || !dossierImages) return null;
    
    async function explorer(dossier) {
        for await (const entry of dossier.values()) {
            if (entry.kind === "file") {
                // Correspondance exacte ou avec extension
                if (entry.name.toLowerCase().startsWith(nom.toLowerCase() + ".")) {
                    return URL.createObjectURL(await entry.getFile());
                }
            } else if (entry.kind === "directory") {
                const res = await explorer(entry);
                if (res) return res;
            }
        }
    }
    return await explorer(dossierImages);
}

// ===============================
// 5. EXPORT (UNIQUE & ZIP)
// ===============================
async function capturerEtDl(element, nom) {
    // Petit délai pour laisser le rendu CSS se stabiliser
    await new Promise(r => setTimeout(r, 150));
    
    const canvas = await html2canvas(element, { 
        useCORS: true, 
        allowTaint: true, 
        backgroundColor: null 
    });
    
    const link = document.createElement("a");
    link.download = (nom || "carte") + ".png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}

boutonTelecharger.onclick = async () => {
    boutonTelecharger.textContent = "Compression ZIP...";
    const zip = new JSZip();
    for (const c of exportsCartes) {
        const canvas = await html2canvas(c.element, { useCORS: true, allowTaint: true, backgroundColor: null });
        const blob = await new Promise(r => canvas.toBlob(r, "image/png"));
        zip.file(c.nom + ".png", blob);
    }
    saveAs(await zip.generateAsync({ type: "blob" }), "cartes.zip");
    boutonTelecharger.textContent = "3 - Télécharger tout (ZIP)";
};