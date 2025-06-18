// Cargamos el JSON de forma asíncrona
fetch('../img/personas.json') // Asegurate que la ruta sea correcta
  .then(response => response.json())
  .then(data => cargarReseñas(data))
  .catch(error => console.error("Error al cargar el JSON:", error));

//carga los productos
function cargarReseñas(reseñas) {

    try{
        const container = document.getElementById("conteiner-Resñas")

        for( let i = 1;i <= 2; i++){

            reseñas.forEach(reseña => {
    
                const div = document.createElement("div");
                div.classList.add("carta-Rese");
                div.innerHTML = `
                    <picture>
                        <img src="${reseña.foto}" alt="Imagen de persona">
                    </picture>
                    <div class="estrellas">
                        ${agregarEstrellas(reseña.estrellas)}
    
                    </div>
                    <div class="carta-Rese-Text">
                        <h4>${reseña.nombre} ${reseña.apellido}</h4>   
                        <p>
                            ${reseña.descripcion}  
                        </p>
                    </div>`;
    
                container.appendChild(div);
                
            })
        }

        

    }catch(error){
        console.log(error)
    }
}

function agregarEstrellas(cantidad){
    const total= 5;
    let estrellas = ``;

    for (let i = 1; i <= total; i++){
        if(i <= cantidad){
            estrellas += `
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffcc00"
                    stroke-width="1"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    >
                    <path d="M15 3a3 3 0 0 1 3 3a3 3 0 1 1 -2.12 5.122l-4.758 4.758a3 3 0 1 1 -5.117 2.297l0 -.177l-.176 0a3 3 0 1 1 2.298 -5.115l4.758 -4.758a3 3 0 0 1 2.12 -5.122z" />
                    </svg>`
        }else{
            estrellas += `
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#000000"
                    stroke-width="1"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    >
                    <path d="M15 3a3 3 0 0 1 3 3a3 3 0 1 1 -2.12 5.122l-4.758 4.758a3 3 0 1 1 -5.117 2.297l0 -.177l-.176 0a3 3 0 1 1 2.298 -5.115l4.758 -4.758a3 3 0 0 1 2.12 -5.122z" />
                    </svg>`
        }
    }
    return estrellas;
}