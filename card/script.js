const boutonTelecharger = document.getElementById("telecharger");
const renderZone = document.getElementById("carte-render");

const urlImage = "https://tcg-proto-assets.ankama.com/test.jpg";

const img = document.createElement("img");

img.id = "preview";
img.crossOrigin = "anonymous";
img.src = urlImage;

img.style.width = "372px";
img.style.height = "520px";
img.style.objectFit = "cover";

renderZone.innerHTML = "";
renderZone.appendChild(img);


boutonTelecharger.addEventListener("click", () => {

    if (!img.complete) {
        boutonTelecharger.textContent = "Image pas chargée";
        return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = 372;
    canvas.height = 520;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0, 372, 520);


    try {

        const link = document.createElement("a");

        link.download = "test.png";

        link.href = canvas.toDataURL("image/png");

        link.click();

        boutonTelecharger.textContent = "OK";

    } 
    catch(error) {

        boutonTelecharger.textContent = "Erreur canvas";

        console.log(error);

    }

});
