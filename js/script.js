/* Url Endpoint ApiRest */
const urlbaseApiRest = "http://localhost:8080/";
const apiCategories = "categories";
const apiProducts = "products"

/*Variable global para almacenar los productos*/
var products = [];
/*Variable total paginas de grupos de 8 productos*/
var totalPages;

/*Obtener todas las categorías para mostrarlas al usuario*/
function getCategories() {
    //Formar la url completa para el request
    let urlApi = urlbaseApiRest+apiCategories;
    //Array para contener la data de categorias de la api
    let categories = [];
    //request api categories
    axios.get(urlApi)
        .then(function (response) {
            //Manejar success
            console.log(response);
            //Almacenar data en array categories
            categories = response.data;
            //Validar que se hay obtenido data de la api para ejecutar la funcion de renderizado de categorias
            if(categories.length > 0) {
                //Renderizar categorias
                renderCategories(categories);
            }
        })
        .catch(function (error) {
            //Manejar error
            console.log(error);
        })
        .then(function () {
            //Siempre se ejecuta
            //Esconder spinner al terminar el request
            $('.spinner').hide();
        });
}

/*Renderizar las categorias en el html*/
function renderCategories(categories) {
    //Obtener elemento contenedor de las categorias
    let containerCategories = $('#containerCategories');
    
    //Recorrer el array de categorias e insertar un boton por cada uno
    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        //Añadir boton al container con los datos de cada categoria
        //Agregarle evento onclick para que ejecute la peticion obtener por categoria
        containerCategories.append('<a onclick=getProductsByCategory('+category.id+') type="button" class="btn btn-outline-light inline animate__animated animate__fadeInLeft" href="#section-products">'+category.name.toUpperCase()+'</a>');
    }
}

function getAllProducts() {
    //Formar la url completa para el request sin el parametro category para obtener todos los productos
    let urlApi = urlbaseApiRest+apiProducts;
    //request api products
    axios.get(urlApi)
        .then(function (response) {
            //Manejar success
            console.log(response);
            //Almacenar data en array products
            products = response.data.products;
            //Setear totalPages
            totalPages = response.data.totalPages;
            //Renderizar productos
            renderProducts(products);
            //Renderizar totalPages con parametro adicional de query activo para añadirlo al request
            let queryActive = '';
            renderTotalPages(totalPages,queryActive);
        })
        .catch(function (error) {
            //Manejar error
            console.log(error);
        })
        .then(function () {
            //Siempre se ejecuta
        });
}

/*Generar cada elemento html por producto al ingresar a la pagina*/
function renderProducts(products) {
    //Obtener elemento contenedor de los productos y limpiarlo si es que tiene elementos
    let containerProducts = $('#containerProducts');
    containerProducts.empty();

    //Recorrer initialProducts para generar elementos
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        //Imagen para productos que no poseen url_image
        let no_image = "assets/no_image.jpg";
        let url_image = product.url_image ? product.url_image : no_image;

        //indicar si el producto tiene o no descuento
        let hasDiscount = product.discount>0 ? true: false;
        let priceWithDiscount = null;
        let classHideBadges = "";
        if (hasDiscount) {
            priceWithDiscount = product.price * (100 - product.discount) / 100;
        } else {
            priceWithDiscount = product.price;
            //Class para esconder badges
            classHideBadges = "display_none";
        }

        //Añadir elemento con sus datos al contenedor de productos
        containerProducts.append(`
        <div class="col mb-5 animate__animated animate__bounceInUp">
            <div class="card h-100 card-product">
                <!-- Oferta badge-->
                <div class="badge bg-dark text-white position-absolute  `+ classHideBadges +`" style="top: 0.5rem; right: 0.5rem">Descuento de `+ product.discount +`%</div>
                <!-- Product image-->
                <img class="card-img-top product-img" src="`+ url_image +`"/>
                <!-- Product details-->
                <div class="card-body p-0">
                    <div class="text-center">
                        <!-- Product name-->
                        <h5 class="fw-bolder p-2 bg-dark text-white">`+ product.name +`</h5>
                        <!-- Product reviews-->
                        <div class="d-flex justify-content-center small text-warning mb-2">
                            <span class="badge">`+ product.category.name.toUpperCase() +`</span>
                        </div>
                        <!-- Product price-->
                        <span class="text-muted text-decoration-line-through  `+ classHideBadges +`">`+ product.price +`</span>
                        $`+ priceWithDiscount +`
                    </div>
                </div>
                <!-- Product actions-->
                <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
                    <div class="text-center"><a class="btn btn-outline-dark mt-auto" href="#">Añadir a carrito</a></div>
                </div>
            </div>
        </div>
        `);        
    }
}

/*Crear elementos de Pagination*/
function renderTotalPages(totalPages, queryActive) {
    //Obtener elemento contenedor de pagination y limpiarlo si es que tiene elementos
    let containerPagination = $('#containerPagination');
    containerPagination.empty();

    //Recorrer la cantidad de veces de totalPages para crear la lista de pagination
    //Añadir el elemento con el evento click para poder hacer la peticion a la pagina deseada
    for (let i = 0; i < totalPages; i++) {
        containerPagination.append(`<li class="page-item"><a class="page-link text-dark" href="#section-products" 
        onclick="getProductsPaginated(`+ i +`,'`+ queryActive +`')">`+ (i+1) +`</a></li>`);         
    }
}

/*Obtener productos de una página específica*/
function getProductsPaginated(pageNro, queryActive) {
    let urlApi;
    //Formar la url completa para el request con el parametro queryActive o sin el si esta vacio
    if (queryActive.length > 0) {
        urlApi = urlbaseApiRest+apiProducts+queryActive+'&pageNo='+pageNro;
    } else {
        urlApi = urlbaseApiRest+apiProducts+'?pageNo='+pageNro;
    }

    //request api products
    axios.get(urlApi)
        .then(function (response) {
            //Manejar success
            console.log(response);
            //Almacenar data en array products
            products = response.data.products;
            //Setear totalPages
            totalPages = response.data.totalPages;
            //Renderizar productos
            renderProducts(products);
            //Renderizar totalPages con query activo
            renderTotalPages(totalPages,queryActive);
        })
        .catch(function (error) {
            //Manejar error
            console.log(error);
        })
        .then(function () {
            //Siempre se ejecuta
        });
}

/*Obtener productos por categoria*/
function getProductsByCategory(category) {
    //Formar la url completa para el request con el parametro category
    let query = '?category='+category;
    let urlApi = urlbaseApiRest+apiProducts+query;
    //request api products
    axios.get(urlApi)
        .then(function (response) {
            //Manejar success
            console.log(response);
            //Almacenar data en array products
            products = response.data.products;
            //Setear totalPages
            totalPages = response.data.totalPages;
            //Renderizar productos
            renderProducts(products);
            //Renderizar totalPages con parametro adicional de query activo para añadirlo al request
            let queryActive = query;
            renderTotalPages(totalPages,queryActive);
        })
        .catch(function (error) {
            //Manejar error
            console.log(error);
        })
        .then(function () {
            //Siempre se ejecuta
        });
}


/* Ejecutar funciones getCategories y getAllProducts */
function startup() {
    getCategories();
    getAllProducts();
}

/*Ejecutar funcion para obtener categorias al cargar la pagina y todos los productos*/
window.addEventListener('load', startup, false);