const boutonTelecharger = document.getElementById("telecharger");
const renderZone = document.getElementById("carte-render");

const urlImage = "https://upload.wikimedia.org/wikipedia/commons/3/3f/JPEG_example_flower.jpg";


// Affichage
renderZone.innerHTML = `
<div id="captureCarte" style="
    width:372px;
    height:520px;
">
    <img src="${urlImage}"
         style="
            width:372px;
            height:520px;
            object-fit:cover;
         ">
</div>
`;


// Export
boutonTelecharger.addEventListener("click", async () => {

    const zone = document.getElementById("captureCarte");

    boutonTelecharger.innerText = "Capture...";

    try {

        const canvas = await html2canvas(zone, {
            width:372,
            height:520,
            scale:2,
            foreignObjectRendering:true,
            backgroundColor:null
        });


        const image = canvas.toDataURL("image/png");


        const lien = document.createElement("a");
        lien.download = "carte.png";
        lien.href = image;
        lien.click();


        boutonTelecharger.innerText = "Télécharger";

    } catch(e) {

        boutonTelecharger.innerText = "Erreur capture";
        console.log(e);

    }

});
