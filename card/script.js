const boutonCharger = document.getElementById("charger");
const boutonTelecharger = document.getElementById("telecharger");
const inputCSV = document.getElementById("csvFile");
const renderZone = document.getElementById("carte-render");

let urlImage = "";

// Charger le CSV
boutonCharger.addEventListener("click", () => inputCSV.click());

inputCSV.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
        header: true,
        delimiter: ";",
        skipEmptyLines: true,
        complete: (results) => {
            const carte = results.data[0];
            if (!carte) return;

            // URL de l’image
            urlImage = carte.Illustration.trim();

            // Affichage simple
            renderZone.innerHTML = `
                <img src="${urlImage}"
                     id="preview"
                     style="width:372px;height:520px;object-fit:cover;">
            `;
        }
    });
});

// Télécharger
boutonTelecharger.addEventListener("click", () => {

    if (!urlImage) {
        alert("Charge d’abord un CSV");
        return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 372;
    canvas.height = 520;

    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
        ctx.drawImage(img, 0, 0, 372, 520);

        const link = document.createElement("a");
        link.download = "carte.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    img.onerror = () => {
        alert("Impossible de charger l’image");
    };

    img.src = urlImage;
});
