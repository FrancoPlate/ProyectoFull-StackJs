//variables globales
let carrito = [];
let productosGlobal = [];
let filtro = [];
let productosPorPagina = definirProductosPorPantalla();
let paginaActual = 1;
// Cargamos el JSON de forma asíncrona
fetch('../img/productos.json') // Asegurate que la ruta sea correcta
  .then(response => response.json())
  .then(data => {
    productosGlobal = data;
    cargarProductos(productosGlobal, 1);
    cargarCarritoGuardado();
    cargarCarrito();
    Filtros()
    // Evento que detecta cuando se le da click a unos de los check del filtro
    document.querySelectorAll(".filtro-checkbox").forEach(checkbox => {
        checkbox.addEventListener("change", aplicarFiltros);
    });
    //se recalcula los productos por página y se actualice la vista:
    window.addEventListener("resize", () => {
        const nuevoValor = definirProductosPorPantalla();
        if (nuevoValor !== productosPorPagina) {
            productosPorPagina = nuevoValor;
            cargarProductos(productosGlobal, 1); // Volver a cargar desde la primera página
            cargarCarrito()
        }
    });

  })
  .catch(error => console.error("Error al cargar el JSON:", error));
  

const precio = "$";
const miLocalStorage = window.localStorage;
  

function definirProductosPorPantalla() {
  const ancho = window.innerWidth;

    if (ancho < 1000) {
        return 2; // Móviles pequeños
    } else if (ancho < 1200) {
        return 4; // Tablets o pantallas pequeñas
    } else if (ancho < 1600) {
        return 6; // Tablets o pantallas pequeñas
    } else {
        return 8; // Pantallas grandes
    }
}


// cargar los productos
function cargarProductos(productos, pagina = 1){
   
    try{
        

        const container = document.getElementById("conteiner-Productos")
        const paginacion = document.getElementById("paginacion");
        container.innerHTML = ""; // limpiamos productos
        paginacion.innerHTML = ""; // limpiamos paginación

        // calcular los índices para cortar el array
        const inicio = (pagina - 1) * productosPorPagina;
        const fin = inicio + productosPorPagina;
        const productosPagina = productos.slice(inicio, fin);

        productosPagina.forEach(producto => {
            const div = document.createElement("div");
            div.classList.add("port-venta");
            div.innerHTML = `
                <picture>
                    <img src="${producto.imagen}" alt="">
                </picture>
                <div class="des">
                    <h3 class="des-nombre">${producto.nombre}</h3>
                    <P class="des-precio">${precio}${producto.precio}</P>
                    <button class="btn-agregar" data-id="${producto.id}">Agregar al carrito</button>
                </div>
            
            `;

            container.appendChild(div);
            
        });
        container.querySelectorAll('.btn-agregar').forEach(boton =>{
            boton.addEventListener('click', ProductosAlCarrito);
        });

        // Crear botones de paginación
        const totalPaginas = Math.ceil(productos.length / productosPorPagina);
        for (let i = 1; i <= totalPaginas; i++) {
            const botonPagina = document.createElement("button");
            botonPagina.textContent = i;
            botonPagina.classList.add("btn-pagina");
            if (i === pagina) {
                botonPagina.classList.add("activa");
            }
            botonPagina.addEventListener("click", () => {
                paginaActual = i;
                cargarProductos(productos, i);
            });
            paginacion.appendChild(botonPagina);
        }

    }catch(error){
        console.warn(error)
    }
}

function Filtros(){

    const Dfiltros = document.getElementById('filtros');
    Dfiltros.textContent = ""; // Vaciamos el carrito


    //carrito = array de proudctos  
    //filtros = array donde se guardanran las categorias
    let auxCategoria = ""
    let i = 0
    
    while(productosGlobal[i] != undefined ){
        auxCategoria = productosGlobal[i].categoria

        
        while ( productosGlobal[i] != undefined && productosGlobal[i].categoria == auxCategoria){
            
            i = i + 1;
        }
        
        
        let existe= false;
        for(let long = 0 ; long < filtro.length; long++){
            if (filtro[long] == auxCategoria){
                existe= true;
            }
        }
        if(!existe){
            filtro.push(auxCategoria)
        }

    }

    filtro.forEach((item) => {
        //Creamos el espacio de los filtros
        const nodo = document.createElement('li');
        
            nodo.innerHTML = `   
            <label>
                <input type="checkbox" class="filtro-checkbox" value="${item}">
                ${item}
            </label>
            `;

        Dfiltros.appendChild(nodo);
    })
    

     
}

function aplicarFiltros(){
    const checkboxes = document.querySelectorAll(".filtro-checkbox")
    const categoriasSeleccionadas = [];

    checkboxes.forEach(cb => {
        if (cb.checked) {
            categoriasSeleccionadas.push(cb.value);
        }
    });
    // Filtramos productos
    let productosFiltrados;
    if (categoriasSeleccionadas.length === 0) {
        productosFiltrados = productosGlobal; // si no hay filtros, mostrar todos
    } else {
        productosFiltrados = productosGlobal.filter(p =>
            categoriasSeleccionadas.includes(p.categoria)
        );
    }

    cargarProductos(productosFiltrados); // Recarga solo los productos filtrados
}

function ProductosAlCarrito(event){
    const idProducto = event.target.getAttribute('data-id')
    carrito.push(idProducto);    
    cargarCarrito();
    guardarCarrito();
}

function cargarCarrito(){
    
    const Dcarrito = document.getElementById('bodytable');
    Dcarrito.textContent = ""; // Vaciamos el carrito

    const containertf = document.getElementById("table-foot")
    containertf.innerHTML = ""; // limpiar el contenedor antes

    //Quitamos los duplicados
    const carritoSinDuplicados= [...new Set(carrito)];

    let totalProductos = 0
    

    //generamos los productos
    carritoSinDuplicados.forEach((item) => {
        //tomamos el producto que necesitamos del json
        const producto = productosGlobal.find(productoData => productoData.id === parseInt(item)); // ¿Coincide las id? Solo puede existir un caso
        
        // Cuenta las veces que se repite el producto
        const numeroUnidades  = carrito.reduce((total,id) => id === item ? total += 1 : total, 0);  // ¿Coincide las id? Incremento el contador, en caso contrario, no 
        const subtotal = numeroUnidades *producto.precio;
        totalProductos += subtotal;

        //Creamos el espacio de los productos
        const nodo = document.createElement('tr');
        nodo.classList.add("prod-carrito");
        //Creamos el espacio de los productos
        nodo.innerHTML = `   
            <th id="th-img">
                <picture>
                    <img src="${producto.imagen}" alt="">
                </picture>
            </th>
            <th > <p>${producto.nombre}</p></th>
            <th  >${producto.precio}</th>
            <th >${numeroUnidades}</th>
            <th ><button id="mas" data-id="${producto.id}">+</button><button id="menos" data-id="${producto.id}">-</button></th>
            <th >$ ${subtotal}</th>
        
        `;

        Dcarrito.appendChild(nodo);

        
        
    })
    //Cada vez que se da click al boton se suma 1
    Dcarrito.querySelectorAll("#mas").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            carrito.push(id); // Agrega uno más
            guardarCarrito();
            cargarCarrito();
    });
    });
    //Cada vez que se da click al boton se resta 1, si es que existe
    Dcarrito.querySelectorAll("#menos").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            const index = carrito.indexOf(id);
            if (index !== -1) {
            carrito.splice(index, 1); // Quita uno
            guardarCarrito();
            cargarCarrito();
            }
    });
    });

    const tablef = document.createElement('tr');
    tablef.innerHTML= `
    
        <th colspan="4" >TOTAL</th>
        <th>$ ${totalProductos.toFixed(2)}</th>
    
    `
    containertf.appendChild(tablef);

}

function guardarCarrito(){
    miLocalStorage.setItem("carrito", JSON.stringify(carrito));
}

function cargarCarritoGuardado(){
    //verificamos si hay algo guardado en el localStorage
    if(miLocalStorage.getItem("carrito") !== null){
        //si es asi carga la informacion
        carrito = JSON.parse(miLocalStorage.getItem("carrito"))
    }
}
