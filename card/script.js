// 1. Initialisation
const boutonTelecharger = document.getElementById("telecharger");
const renderZone = document.getElementById("carte-render");
const urlIllustration = "https://tcg-proto-assets.ankama.com/test.jpg";

// 2. Création dynamique du Canvas
renderZone.innerHTML = "";
const canvas = document.createElement("canvas");
canvas.width = 372;
canvas.height = 520;
canvas.style.borderRadius = "15px";
renderZone.appendChild(canvas);
const ctx = canvas.getContext("2d");

// 3. Chargement de l'image via un Proxy pour contourner le blocage CORS
// On utilise un service de proxy qui ajoute les autorisations nécessaires
const proxyUrl = "https://corsproxy.io/?";
const imageFinale = new Image();

// On définit le crossorigin AVANT de donner la source
imageFinale.crossOrigin = "anonymous"; 

imageFinale.onload = function() {
    console.log("Image chargée via proxy !");
    // On dessine l'image sur tout le canvas
    ctx.drawImage(imageFinale, 0, 0, canvas.width, canvas.height);
    
    // On active le bouton
    boutonTelecharger.disabled = false;
    boutonTelecharger.style.opacity = "1";
    boutonTelecharger.style.cursor = "pointer";
};

imageFinale.onerror = function() {
    console.error("Erreur de chargement.");
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Erreur de chargement image", canvas.width/2, canvas.height/2);
};

// On déclenche le chargement
imageFinale.src = proxyUrl + encodeURIComponent(urlIllustration);

// 4. Téléchargement propre (sans html2canvas)
boutonTelecharger.addEventListener("click", () => {
    try {
        // toDataURL fonctionne ici car on a géré le CORS via le proxy + crossorigin
        const dataURL = canvas.toDataURL("image/png");
        
        const link = document.createElement("a");
        link.download = `carte_${Date.now()}.png`;
        link.href = dataURL;
        link.click();
    } catch (e) {
        alert("Le navigateur bloque toujours l'export. Hébergez l'image localement.");
    }
});
