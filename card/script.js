const boutonCharger = document.getElementById("charger");
const boutonTelecharger = document.getElementById("telecharger");
const inputCSV = document.getElementById("csvFile");
const renderZone = document.getElementById("carte-render");

let imageChargee = false;

boutonTelecharger.disabled = true;
boutonTelecharger.style.opacity = "0.5";
boutonTelecharger.style.cursor = "not-allowed";

boutonCharger.addEventListener("click", () => inputCSV.click());

inputCSV.addEventListener("change", (e) => {

    if (!e.target.files.length) return;

    Papa.parse(e.target.files[0], {
        header: true,
        skipEmptyLines: true,
        delimiter: ";",
        encoding: "UTF-8",

        complete(results) {

            if (!results.data.length)
                return;

            genererLaCarte(results.data[0]);
        }
    });

});

function genererLaCarte(carte) {

    renderZone.innerHTML = "";
    imageChargee = false;

    const container = document.createElement("div");
    container.className = "carte-item";
    container.style.width = "372px";
    container.style.height = "520px";
    container.style.position = "relative";
    container.style.overflow = "hidden";

    const img = new Image();

    img.crossOrigin = "anonymous";

    // enlève les espaces éventuels dans le CSV
    img.src = carte.Illustration.trim();

    img.className = "illustration-fond";

    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";

    img.onload = () => {

        imageChargee = true;

        boutonTelecharger.disabled = false;
        boutonTelecharger.style.opacity = "1";
        boutonTelecharger.style.cursor = "pointer";

    };

    img.onerror = () => {

        console.error("Impossible de charger :", img.src);

    };

    container.appendChild(img);
    renderZone.appendChild(container);

}

boutonTelecharger.addEventListener("click", async () => {

    if (!imageChargee)
        return;

    const item = document.querySelector(".carte-item");

    const canvas = await html2canvas(item, {

        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        scale: 2,
        logging: true

    });

    const link = document.createElement("a");
    link.download = "illustration_two.png";
    link.href = canvas.toDataURL("image/png");
    link.click();

});
