//variables globales
const precio = "$";
const miLocalStorage = window.localStorage;
let Num_Orden = 0;
let pedido = [];
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
    cargarProductos(productosGlobal);
    cargarCarritoGuardado();
    cargarPedidosGuardado();
    cargarCarrito();
    cargarPedido();
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

// Eniviar los productos al carrito
function ProductosAlCarrito(event){
    const idProducto = event.target.getAttribute('data-id')
    carrito.push(idProducto);    
    cargarCarrito();
    guardarCarrito();
}

function Paginacion(productos,pagina){
    const paginacion = document.getElementById("paginacion");
    paginacion.innerHTML = ""; // limpiamos paginación

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
            cargarProductos(productos, paginaActual);
        });
        paginacion.appendChild(botonPagina);
    }
}

// cargar los productos
function cargarProductos(productos, pagina = 1){
   
    try{
        const container = document.getElementById("conteiner-Productos")
        container.innerHTML = ""; // limpiamos productos

        // calcular los índices para cortar el array
        const inicio = (pagina - 1) * productosPorPagina;
        const fin = inicio + productosPorPagina;

        //copia una parte de un arreglo
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
                    <div class="precio-Detalles">
                    <P class="des-precio">${precio}${producto.precio}</P>
                    <button class="btn-detalles" data-id="${producto.id}">Más detalles</button>
                    </div>
                    <button class="btn-agregar" data-id="${producto.id}">Agregar al carrito</button>
                </div>
            
            `;

            container.appendChild(div);
            
        });
        container.querySelectorAll('.btn-agregar').forEach(boton =>{
            boton.addEventListener('click', ProductosAlCarrito);
        });
        container.querySelectorAll('.btn-detalles').forEach(boton =>{
            boton.addEventListener('click', Detalles);
        });

        Paginacion(productos,pagina)
        

    }catch(error){
        console.warn(error)
    }
}
// Filtros
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
// Aplicacion de lo filtros
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

// Cargado del carrito
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
        if(window.innerWidth < 1000){
            //Creamos el espacio de los productos
            nodo.innerHTML = `   
                <th id="th-img">
                    <picture>
                        <img src="${producto.imagen}" alt="">
                    </picture>
                </th>
                <th><p> ${cortarTexto(producto.nombre, 15)}</p></th>
                <th>${producto.precio}</th>
                <th>${numeroUnidades}</th>
                <th><button id="menos" data-id="${producto.id}">-</button><button id="mas" data-id="${producto.id}">+</button><button id="borrar" data-id="${producto.id}">x</button></th>
                <th>$ ${subtotal}</th>
            
            `;
        }else{
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
                <th ><button id="menos" data-id="${producto.id}">-</button><button id="mas" data-id="${producto.id}">+</button><button id="borrar" data-id="${producto.id}">x</button></th>
                <th >$ ${subtotal}</th>
            
            `;
        }


        Dcarrito.appendChild(nodo);
    })
    
    //Cada vez que se da click al boton se suma 1
    Dcarrito.querySelectorAll("#mas").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            const index = carrito.indexOf(id); //busca en donde se encuentra el primer valor del id
            if (index !== -1){
                carrito.splice(index, 0 , id); // Agrega uno más [ index =  posición a insertar; 0 = no eliminar; id= elemento a agregar]
                guardarCarrito();
                cargarCarrito();
            }
        });
    });
    //Cada vez que se da click al boton se resta 1, si es que existe
    Dcarrito.querySelectorAll("#menos").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            const index = carrito.indexOf(id); //busca en donded se encuentra el primer valor del id, si no lo encuentra devolvera -1
            if (index !== -1) {
            carrito.splice(index, 1); // Quita uno
            guardarCarrito();
            cargarCarrito();
            }
        });
    });

    //Cada vez que se da click al boton se resta 1, si es que existe
    Dcarrito.querySelectorAll("#borrar").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            const nuevoC = carrito
            carrito = nuevoC.filter(n => n !== id) // Quita todos los productos que tengan el mismo id
            console.log()
            guardarCarrito();
            cargarCarrito();
            
        });
    });

    const tablef = document.createElement('tr');
    tablef.innerHTML= `
    
        <th colspan="2">TOTAL</th>
        <th colspan="2">$ ${totalProductos.toFixed(2)}</th>
        <th colspan="2"><button class="button-pedir" id="pedir">Pedir</button></th>
    
    `
    containertf.appendChild(tablef);

    //evento para captar el click
    document.querySelector('#pedir').addEventListener('click', () =>{
        TomarPedido();
    });

}

function PedidoTomado(){
    const productoPedido = []; // array donde guardaremos los pedidos 
    let total = 0;
    Num_Orden = Num_Orden + 1; // auto sumamos el numero de orden 
            
    const carritoSinDuplicados = [...new Set(carrito)];
    
    carritoSinDuplicados.forEach(id => {
        const producto = productosGlobal.find(p => p.id === parseInt(id));
        const cantidad = carrito.filter(pid => pid === id).length;
        const subtotal = producto.precio * cantidad;
        total += subtotal;
        // Guardamos el producto
        productoPedido.push({
            id:producto.id,
            nombre: producto.nombre,
            cantidad: cantidad,
            precio: producto.precio
        });
    });
    
    // Guardamos el pedido
    pedido.push({
        nuumeroOrden: Num_Orden,
        productos: productoPedido,
        total: total
    });

    carrito = []; // vaciar carrito
    guardarCarrito(); // actualizar localStorage
    guardarPedidos(); // actualizar localStorage
    cargarCarrito(); // actualizar vista
    cargarPedido(); // mostrar pedidos
}

function TomarPedido(){
    //si el carrito esta vacio retorna nada 
        if(carrito.length === 0) return;
        //traemos los campos del dialog de pedido
        const dialogP = document.getElementById("dialog-pedido");
        const modalProdu = document.getElementById("productos-Pedidos")
        const textareaMensaje = document.getElementById("mensaje");
        let mensajeFinal = "";
        dialogP.showModal();

        // Contamos cantidades
        const carritoSinDuplicados = [...new Set(carrito)];
        modalProdu.innerHTML = ""; // Limpiar antes de agregar

        carritoSinDuplicados.forEach(id => {
            const producto = productosGlobal.find(produ => produ.id == id);
            const cantidad = carrito.filter(cant => cant == id).length;

            if (producto) {
                //mesanje para el Formspree
                mensajeFinal += `${(producto.nombre)} (x${cantidad})\n`;
                //creamos la lista de productoa a pedir
                const nodo = document.createElement("li");
                nodo.innerHTML = `
                    <p name="Prodcuto">${cortarTexto(producto.nombre, 20)} (x${cantidad}) - $${producto.precio*cantidad}</p>
                `;
                //aplicamos la lista 
                modalProdu.appendChild(nodo);
            }
        });
        //mesanje final para el Formspree
        textareaMensaje.value = mensajeFinal;

        document.getElementById("cerrar-dialog").addEventListener("click", ()=> {
            dialogP.close();
        });

        document.getElementById("pedir-dialog").addEventListener("click", ()=> {
            
            PedidoTomado()
            dialogP.close();
            
        });
}

// Cargado de los pedidos
function cargarPedido() {


  const Dpedido = document.getElementById('bodytable2');
  Dpedido.textContent = "";

  pedido.forEach(orden => {
    
    const nodo = document.createElement('tr');
    nodo.classList.add("prod-pedido")
    const productosTexto = orden.productos.map(p => `${cortarTexto(p.nombre,20)} (x${p.cantidad})`).join("<br>");

    nodo.innerHTML = `   
      <th>#${orden.nuumeroOrden}</th>
      <th>${orden.productos.length}</th>
      <th>${productosTexto}</th>
      <th>$ ${orden.total.toFixed(2)}</th>
    `;

    Dpedido.appendChild(nodo);
  });
}

function Detalles(event){
    const idProducto = event.target.getAttribute('data-id')
    console.log(idProducto)
    
    const dialog = document.getElementById("dialog-detalle");
    const modalImg = document.getElementById("modal-img");
    const modalNombre = document.getElementById("modal-nombre");
    const modalDescripcion = document.getElementById("modal-descripcion");
    const modalStock = document.getElementById("modal-stock");
    const modalPrecio = document.getElementById("modal-precio");
    console.log(idProducto)
    
    
    const producto = productosGlobal.find(p => p.id == idProducto);
    //si producto esta vacio retornamos
    if(!producto) return
    //si no esta vacio retornamos la informacion:
    modalImg.src = producto.imagen;
    modalNombre.textContent = producto.nombre;
    modalDescripcion.textContent = producto.descripcion || "Sin descripción.";
    modalStock.textContent = `Stock: ${producto.stock}`
    modalPrecio.textContent = `Precio: $${producto.precio}`;
    dialog.showModal();
    

    document.getElementById("cerrar-dialog").addEventListener("click", ()=> {
        dialog.close();
    });
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

function guardarPedidos(){
    miLocalStorage.setItem("pedido", JSON.stringify(pedido));
}

function cargarPedidosGuardado(){
    //verificamos si hay algo guardado en el localStorage
    if(miLocalStorage.getItem("pedido") !== null){
        //si es asi carga la informacion
        pedido = JSON.parse(miLocalStorage.getItem("pedido"))
    }
}

function cortarTexto(texto, longitud) {
  if (texto.length > longitud) {
    return texto.substring(0, longitud) + "...";
  } else {
    return texto;
  }
}


