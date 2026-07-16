const renderZone = document.getElementById("carte-render");

const urlAnkama = "https://tcg-proto-assets.ankama.com/test.jpg";
const urlWiki = "https://upload.wikimedia.org/wikipedia/commons/3/3f/JPEG_example_flower.jpg";


function creerTest(url, nom) {

    const bloc = document.createElement("div");

    bloc.style.marginBottom = "20px";


    const titre = document.createElement("p");
    titre.innerText = nom;

    bloc.appendChild(titre);


    const img = new Image();

    img.crossOrigin = "anonymous";

    img.src = url;

    img.style.width = "372px";
    img.style.height = "520px";
    img.style.objectFit = "cover";


    bloc.appendChild(img);


    const bouton = document.createElement("button");

    bouton.innerText = "Télécharger " + nom;


    bouton.onclick = () => {


        const canvas = document.createElement("canvas");

        canvas.width = 372;
        canvas.height = 520;


        const ctx = canvas.getContext("2d");


        try {

            ctx.drawImage(img,0,0,372,520);


            const lien = document.createElement("a");

            lien.download = nom + ".png";

            lien.href = canvas.toDataURL("image/png");

            lien.click();


            bouton.innerText = "OK";

        }
        catch(e) {

            bouton.innerText = "ERREUR";

            console.log(nom,e);

        }

    };


    bloc.appendChild(bouton);


    renderZone.appendChild(bloc);

}



// Nettoyage
renderZone.innerHTML = "";


// Tests
creerTest(urlAnkama,"ANKAMA");

creerTest(urlWiki,"WIKIPEDIA");
