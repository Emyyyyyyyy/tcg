const boutonTelecharger = document.getElementById("telecharger");
const renderZone = document.getElementById("carte-render");

const urlImage = "https://tcg-proto-assets.ankama.com/test.jpg";


// Affichage de l'image
renderZone.innerHTML = `
    <img id="imageCapture"
         src="${urlImage}"
         style="
            width:372px;
            height:520px;
            object-fit:cover;
         ">
`;


// Téléchargement par capture écran
boutonTelecharger.addEventListener("click", () => {

    const element = document.getElementById("imageCapture");

    if (!element) {
        boutonTelecharger.innerText = "Pas d'image";
        return;
    }


    boutonTelecharger.innerText = "Capture...";


    html2canvas(element, {
        width:372,
        height:520,
        scale:2,
        useCORS:false,
        allowTaint:true
    })
    .then(canvas => {

        const lien = document.createElement("a");

        lien.download = "carte.png";

        lien.href = canvas.toDataURL("image/png");

        lien.click();


        boutonTelecharger.innerText = "Télécharger";

    })
    .catch(err => {

        boutonTelecharger.innerText = "Erreur";

        console.log(err);

    });

});
