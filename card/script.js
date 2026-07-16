const renderZone = document.getElementById("carte-render");

const urlAnkama = "https://tcg-proto-assets.ankama.com/test.jpg";
const urlWiki = "https://upload.wikimedia.org/wikipedia/commons/3/3f/JPEG_example_flower.jpg";


function creerCanvasTest(url, nom) {

    const bloc = document.createElement("div");

    const titre = document.createElement("p");
    titre.textContent = nom;
    bloc.appendChild(titre);


    const canvas = document.createElement("canvas");

    canvas.width = 372;
    canvas.height = 520;

    canvas.style.border = "1px solid black";

    bloc.appendChild(canvas);


    const ctx = canvas.getContext("2d");


    const img = new Image();

    img.crossOrigin = "anonymous";


    img.onload = () => {

        try {

            ctx.drawImage(img, 0, 0, 372, 520);

            console.log(nom + " : image dessinée");

        }
        catch(e) {

            console.log(nom + " : erreur canvas", e);

        }

    };


    img.onerror = () => {

        console.log(nom + " : erreur chargement image");

    };


    img.src = url;


    const bouton = document.createElement("button");

    bouton.textContent = "Télécharger " + nom;


    bouton.onclick = () => {

        try {

            const lien = document.createElement("a");

            lien.download = nom + ".png";

            lien.href = canvas.toDataURL("image/png");

            lien.click();

        }
        catch(e) {

            bouton.textContent = "Bloqué";

            console.log(nom,e);

        }

    };


    bloc.appendChild(bouton);

    renderZone.appendChild(bloc);

}


renderZone.innerHTML = "";

creerCanvasTest(urlAnkama, "ANKAMA");
creerCanvasTest(urlWiki, "WIKIPEDIA");
