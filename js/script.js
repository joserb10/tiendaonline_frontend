/* Url Endpoint ApiRest */
const urlbaseApiRest = "http://34.205.223.61:8080/";
const apiCategories = "categories";
const apiProducts = "products"

/*Variable global para almacenar los productos*/
var products = [];
/*Variable total paginas de grupos de 8 productos*/
var totalPages;
/*Variable global para alamcenar productos de carrito*/
var cartProducts = [];

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
            //renderizar cantidad de productos
            let totalItems = response.data.totalItems;
            renderQuantityProducts(totalItems);
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
                <div class="badge badge-custom bg-dark text-white position-absolute  `+ classHideBadges +`" style="top: 0.5rem; right: 0.5rem">Descuento de `+ product.discount +`%</div>
                <!-- Product image-->
                <img class="card-img-top product-img" src="`+ url_image +`"/>
                <!-- Product details-->
                <div class="card-body p-0">
                    <div class="text-center">
                        <!-- Product name-->
                        <h5 class="fw-bolder p-2 bg-dark text-white">`+ product.name +`</h5>
                        <!-- Product reviews-->
                        <div class="d-flex justify-content-center small text-warning mb-2">
                            <span class="badge badge-custom">`+ product.category.name.toUpperCase() +`</span>
                        </div>
                        <!-- Product price-->
                        <span class="text-muted text-decoration-line-through  `+ classHideBadges +`">`+ product.price +`</span>
                        $`+ priceWithDiscount +`
                    </div>
                </div>
                <!-- Product actions-->
                <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
                    <div class="text-center"><a onclick="addProductToCart(`+ product.id +`)" class="btn btn-outline-dark mt-auto">Añadir a carrito</a></div>
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
            //renderizar cantidad de productos
            let totalItems = response.data.totalItems;
            renderQuantityProducts(totalItems);
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
            //renderizar cantidad de productos
            let totalItems = response.data.totalItems;
            renderQuantityProducts(totalItems);
        })
        .catch(function (error) {
            //Manejar error
            console.log(error);
        })
        .then(function () {
            //Siempre se ejecuta
        });
}

/*Obtener productos por texto busqueda*/
function getProductsByText() {
    //Obtener valor del input search
    let textSearch = $('.input-search').val();
    let query = '?text=';
    //Validar si textSearch tiene texto
    if (textSearch.trim().length>0) {
        query += textSearch;
    } else {
        query = '';
    }

    //Formar la url completa para el request con el parametro text
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
            //renderizar cantidad de productos
            let totalItems = response.data.totalItems;
            renderQuantityProducts(totalItems);
        })
        .catch(function (error) {
            //Manejar error
            console.log(error);
        })
        .then(function () {
            //Siempre se ejecuta
        });
}

/*Obtener productos por rango de precios*/
function getProductsByPriceRange() {
    //Obtener valor del input min-price
    let min_price = $('#min_price').val();
    //Obtener valor del input max-price
    let max_price = $('#max_price').val();
    let query;
    //Validar si min_price tiene valor diferente a null y sea mayor a cero
    if (!min_price || !max_price || min_price<0 || max_price<0) {
        Swal.fire({
            position: 'top-end',
            background: '#D20505',
            customClass: 'swal-small',
            title: 'Ingresar el precio mínimo y máximo mayor igual a cero!',
            showConfirmButton: false,
            timer: 2000
        });
        return
    } 
    //Validar que min price sea menor o igual que max price 
    if (parseInt(max_price) < parseInt(min_price)) {
        Swal.fire({
            position: 'top-end',
            background: '#D20505',
            customClass: 'swal-small',
            title: 'El precio mínimo debe ser menor al precio máximo!',
            showConfirmButton: false,
            timer: 2000
        });
        return
    } 

    //Al pasar las validaciones
    query = '?minPrice='+min_price+'&maxPrice='+max_price;

    //Formar la url completa para el request con el parametro min y max price
    let urlApi = urlbaseApiRest+apiProducts+query;

    //request api products
    axios.get(urlApi)
        .then(function (response) {
            //Manejar success
            console.log(response);
            //Almacenar data en array products
            products = response.data.products;
            //Validar que reques devuelva resultados
            if(products.length>0) {
                //Setear totalPages
                totalPages = response.data.totalPages;
                //Renderizar productos
                renderProducts(products);
                //Renderizar totalPages con parametro adicional de query activo para añadirlo al request
                let queryActive = query;
                renderTotalPages(totalPages,queryActive);
                //renderizar cantidad de productos
                let totalItems = response.data.totalItems;
                renderQuantityProducts(totalItems);
            } else {
                Swal.fire({
                    position: 'top-end',
                    background: '#C85318',
                    customClass: 'swal-small',
                    title: 'No existen productos en ese rango de precios!',
                    showConfirmButton: false,
                    timer: 2000
                });
            }
            
        })
        .catch(function (error) {
            //Manejar error
            console.log(error);
        })
        .then(function () {
            //Siempre se ejecuta
        });
}

/*Añadir producto a carrito*/
function addProductToCart(productId) {
    //Encontrar producto en array products
    let product = products.find(p => p.id === productId);

    //Validar que el producto no haya sido añadido previamente
    let productInCart = cartProducts.find(p => p.id === productId);
    if (productInCart) {
        Swal.fire({
            position: 'top-left',
            background: '#FF5733',
            customClass: 'swal-small-cart',
            title: 'Este producto ya fue añadido al carrito!',
            showConfirmButton: false,
            timer: 1300
        });
        return;
    }

    //Seter el valor de cantidad de productos
    product.cantidad = 1;
    cartProducts.push(product);
    //Alerta success
    Swal.fire({
        position: 'top-left',
        background: '#4AD256',
        customClass: 'swal-small-cart',
        title: 'Este producto ya fue añadido al carrito!',
        showConfirmButton: false,
        timer: 1300
    });

    //Modicar contador de cart products
    let counterCart = $('#counterCart');
    counterCart.text(cartProducts.length);

    //Renderizar productods en carrito de compras
    renderCartProducts();
    //Calcular total
    calculateTotalPrice();
}

//Renderizar producto en carrito de compras
function renderCartProducts() {
    //Obtener elemento contenedor de productos de carrito
    let cartContainer = $('#table-cart-container');
    //Vaciar container
    cartContainer.empty();
    //Pintar productos
    for (let i = 0; i < cartProducts.length; i++) {
        const product = cartProducts[i];
        cartContainer.append(`<tr>
                            <td>
                              <div class="d-flex align-items-center">
                                <img
                                    src="`+product.url_image+`"
                                    alt=""
                                    style="width: 60px; height: 60px"
                                    class="rounded-circle"
                                    />
                              </div>
                            </td>
                            <td>
                                <span class="badge bg-dark">`+product.name+`</span>
                            </td>
                            <td>
                                <span class="badge bg-info">`+product.price+`.00</span>
                            </td>
                            <td>
                                <span class="badge bg-info">`+product.discount+`%</span>
                            </td>
                            <td>
                                <span class="badge bg-success">`+product.price * (100 - product.discount) / 100+`.00</span>
                            </td>
                            <td>
                                <span class="badge bg-warning">`+product.category.name+`</span>
                            </td>
                            <td>
                                <input min="1" onkeypress="calculateTotalProduct(event,`+product.id+`)" onchange="calculateTotalProduct(event,`+product.id+`)" class="my-2 form-control input-quantity" type="number" value="`+product.cantidad+`"/>
                            </td>
                            <td>
                                <span class="badge bg-primary">`+ product.price *product.cantidad* (100 - product.discount) / 100+`.00</span>
                            </td>
                            <td>
                              <button onclick="quitarCartProduct(`+i+`)" type="button" class="btn btn-link btn-sm rounded">
                                <i class="fas fa-trash text-danger fw-bolder"></i>
                              </button>
                            </td>
                          </tr>`);
    }
}

/*Calcular el precio total por producto*/
function calculateTotalProduct(event, productId) {
    let cantidad_ingresada;
    //Validar si el evento es onchange o onkeypress
    if(event.key) {
        //Validar si la tecla no es una letra
        if(isNaN(event.key)) {
            return;
        }
        //Setear cantidad a objeto producto de array cartProducts
        cantidad_ingresada = parseInt(event.key);
        cartProducts.find(p=> p.id ===productId).cantidad = cantidad_ingresada;
        renderCartProducts();
    } else {
        //Setear cantidad a objeto producto de array cartProducts
        cantidad_ingresada = event.target.valueAsNumber;
        cartProducts.find(p=> p.id ===productId).cantidad = cantidad_ingresada;
        renderCartProducts();
    }
    //Calcular total
    calculateTotalPrice();
}

/*Quitar producto de array cartProducts*/
function quitarCartProduct(indexProduct) {
    console.log('borrat'+indexProduct)
    cartProducts.splice(indexProduct,1);
    renderCartProducts();
    //Calcular total
    calculateTotalPrice();
}

/*Calcular el precio total*/
function calculateTotalPrice() {
    let totalPrice = 0;
    for (let i = 0; i < cartProducts.length; i++) {
        const product = cartProducts[i];
        totalPrice += product.cantidad * product.price * (100 - product.discount) / 100;
    }
    //Setear valor a elemento html
    let total = $('#total');
    total.text(totalPrice.toFixed(2));
}

/* Ejecutar funciones getCategories y getAllProducts */
function startup() {
    getCategories();
    getAllProducts();
}

/*Renderizar cantidad de productos obtenidos*/
function renderQuantityProducts(quantity) {
    //Obtener elemento y setearle la cantidad
    let containerQuantity = $('#quantity');
    if (!quantity) {
        containerQuantity.text('0');
    } else {
        containerQuantity.text(quantity);
    }
}

/*Ordenar productos por precio*/
function orderProducts(event) {
    //Identificar que filtro fue seleccionado
    if(event.target.value == 1) {
        //Ordenar de mayor a menor
        products.sort((a, b) => {
            return (b.price * (100-b.discount))/100 - (a.price * (100-a.discount))/100 ;
        });
        renderProducts(products);
    } else {
        //Ordenar de menor a mayor
        products.sort((a, b) => {
            return (a.price * (100-a.discount))/100 - (b.price * (100-b.discount))/100 ;
        });
        renderProducts(products);
    }  
}

/*Ejecutar funcion para obtener categorias al cargar la pagina y todos los productos*/
window.addEventListener('load', startup, false);
