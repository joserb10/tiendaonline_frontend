/* Url Endpoint ApiRest */
const urlbaseApiRest = "http://34.205.223.61:8080/";
//const urlbaseApiRest = "http://35.172.128.204:8080/";
const apiCategories = "categories";
const apiProducts = "products"

/*Variable globales para almacenar los productos,productos de carrito y total paginas*/
var products = [];
var totalPages;
var cartProducts = [];

/*Obtener todas las categorías para mostrarlas al usuario*/
function getCategories() {
    let urlApi = urlbaseApiRest+apiCategories;
    let categories = [];
    axios.get(urlApi)
        .then(function (response) {
            console.log(response);
            categories = response.data;
            if(categories.length > 0) {
                renderCategories(categories);
            }
        })
        .catch(function (error) {
            console.log(error);
        })
        .then(function () {
            $('.spinner').hide();
        });
}

/*Renderizar las categorias en el html*/
function renderCategories(categories) {
    let containerCategories = $('#containerCategories');
    
    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        containerCategories.append('<a onclick=getProductsByCategory('+category.id+') type="button" class="btn btn-outline-light inline animate__animated animate__fadeInLeft" href="#section-products">'+category.name.toUpperCase()+'</a>');
    }
}

/*Obtener todos los productos sin filtro con paginación*/
function getAllProducts() {
    let urlApi = urlbaseApiRest+apiProducts;
    axios.get(urlApi)
        .then(function (response) {
            console.log(response);
            products = response.data.products;
            totalPages = response.data.totalPages;
            renderProducts(products);
            let queryActive = '';
            renderTotalPages(totalPages,queryActive);
            let totalItems = response.data.totalItems;
            renderQuantityProducts(totalItems);
        })
        .catch(function (error) {
            console.log(error);
        })
        .then(function () {
        });
}

/*Renderizar un card por cada producto que se encuentre en el argumento products*/
function renderProducts(products) {
    let containerProducts = $('#containerProducts');
    containerProducts.empty();

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        let no_image = "assets/no_image.jpg";
        let url_image = product.url_image ? product.url_image : no_image;

        let hasDiscount = product.discount>0 ? true: false;
        let priceWithDiscount = null;
        let classHideBadges = "";
        if (hasDiscount) {
            priceWithDiscount = product.price * (100 - product.discount) / 100;
        } else {
            priceWithDiscount = product.price;
            classHideBadges = "display_none";
        }

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

/*Crear elementos numerados de Pagination*/
function renderTotalPages(totalPages, queryActive) {
    let containerPagination = $('#containerPagination');
    containerPagination.empty();

    for (let i = 0; i < totalPages; i++) {
        containerPagination.append(`<li class="page-item"><a class="page-link text-dark" href="#section-products" 
        onclick="getProductsPaginated(`+ i +`,'`+ queryActive +`')">`+ (i+1) +`</a></li>`);         
    }
}

/*Obtener productos de un número de página específico*/
function getProductsPaginated(pageNro, queryActive) {
    let urlApi;
    if (queryActive.length > 0) {
        urlApi = urlbaseApiRest+apiProducts+queryActive+'&pageNo='+pageNro;
    } else {
        urlApi = urlbaseApiRest+apiProducts+'?pageNo='+pageNro;
    }

    axios.get(urlApi)
        .then(function (response) {
            console.log(response);
            products = response.data.products;
            totalPages = response.data.totalPages;
            renderProducts(products);
            renderTotalPages(totalPages,queryActive);
            let totalItems = response.data.totalItems;
            renderQuantityProducts(totalItems);
        })
        .catch(function (error) {
            console.log(error);
        })
        .then(function () {
        });
}

/*Obtener productos filtrados por categoria y paginado*/
function getProductsByCategory(category) {
    let query = '?category='+category;
    let urlApi = urlbaseApiRest+apiProducts+query;
    axios.get(urlApi)
        .then(function (response) {
            console.log(response);
            products = response.data.products;
            totalPages = response.data.totalPages;
            renderProducts(products);
            let queryActive = query;
            renderTotalPages(totalPages,queryActive);
            let totalItems = response.data.totalItems;
            renderQuantityProducts(totalItems);
        })
        .catch(function (error) {
            console.log(error);
        })
        .then(function () {
        });
}

/*Obtener productos filtrado por texto de búsqueda y paginado*/
function getProductsByText() {
    let textSearch = $('.input-search').val();
    let query = '?text=';
    //Validar si textSearch tiene texto
    if (textSearch.trim().length>0) {
        query += textSearch;
    } else {
        query = '';
    }

    let urlApi = urlbaseApiRest+apiProducts+query;

    $([document.documentElement, document.body]).animate({
        scrollTop: $("#section-products").offset().top
    });

    axios.get(urlApi)
        .then(function (response) {
            console.log(response);
            products = response.data.products;
            totalPages = response.data.totalPages;
            renderProducts(products);
            let queryActive = query;
            renderTotalPages(totalPages,queryActive);
            let totalItems = response.data.totalItems;
            renderQuantityProducts(totalItems);
            if (! (products.length >0)) {
                Swal.fire({
                    position: 'top-left',
                    background: '#FF5733',
                    customClass: 'swal-small-cart',
                    title: 'No existen productos con ese nombre!',
                    showConfirmButton: false,
                    timer: 1300
                });
            }
        })
        .catch(function (error) {
            console.log(error);
        })
        .then(function () {
        });
}

/*Al presionar enter buscar productos por texto*/
function onPressEnterSearchProductos(event) {
    if (event.keyCode == 13) {
        getProductsByText();     
    }
}

/*Obtener productos por rango de precios*/
function getProductsByPriceRange() {
    let min_price = $('#min_price').val();
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

    query = '?minPrice='+min_price+'&maxPrice='+max_price;

    let urlApi = urlbaseApiRest+apiProducts+query;

    axios.get(urlApi)
        .then(function (response) {
            console.log(response);
            products = response.data.products;
            if(products.length>0) {
                totalPages = response.data.totalPages;
                renderProducts(products);
                let queryActive = query;
                renderTotalPages(totalPages,queryActive);
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
            console.log(error);
        })
        .then(function () {
        });
}

/*Añadir producto a carrito*/
function addProductToCart(productId) {
    let product = products.find(p => p.id === productId);

    //Validar que el producto no haya sido añadido previamente
    let productInCart = cartProducts.find(p => p.id === productId);
    if (productInCart) {
        Swal.fire({
            position: 'top-left',
            background: '#FF5733',
            customClass: 'swal-small-cart',
            title: 'Este producto ya fue añadido!',
            showConfirmButton: false,
            timer: 1300
        });
        return;
    }

    product.cantidad = 1;
    cartProducts.push(product);
    Swal.fire({
        position: 'top-left',
        background: '#4AD256',
        customClass: 'swal-small-cart',
        title: 'Producto añadido al carrito!',
        showConfirmButton: false,
        timer: 1300
    });

    let counterCart = $('#counterCart');
    counterCart.text(cartProducts.length);

    renderCartProducts();
    calculateTotalPrice();
}

/*Renderizar productos que están dentro de carrito de compras*/
function renderCartProducts() {
    let cartContainer = $('#table-cart-container');
    cartContainer.empty();
    
    for (let i = 0; i < cartProducts.length; i++) {
        const product = cartProducts[i];
        let no_image = "assets/no_image.jpg";
        let url_image = product.url_image ? product.url_image : no_image;
        cartContainer.append(`<tr>
                            <td>
                              <div class="d-flex align-items-center">
                                <img
                                    src="`+url_image+`"
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
        cantidad_ingresada = parseInt(event.key);
        cartProducts.find(p=> p.id ===productId).cantidad = cantidad_ingresada;
        renderCartProducts();
    } else {
        cantidad_ingresada = event.target.valueAsNumber;
        cartProducts.find(p=> p.id ===productId).cantidad = cantidad_ingresada;
        renderCartProducts();
    }

    calculateTotalPrice();
}

/*Quitar producto de array cartProducts*/
function quitarCartProduct(indexProduct) {
    console.log('borrat'+indexProduct)
    cartProducts.splice(indexProduct,1);
    renderCartProducts();
    calculateTotalPrice();
}

/*Calcular el precio total total*/
function calculateTotalPrice() {
    let totalPrice = 0;

    for (let i = 0; i < cartProducts.length; i++) {
        const product = cartProducts[i];
        totalPrice += product.cantidad * product.price * (100 - product.discount) / 100;
    }

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
    let containerQuantity = $('#quantity');
    if (!quantity) {
        containerQuantity.text('0');
    } else {
        containerQuantity.text(quantity);
    }
}

/*Ordenar productos por precio*/
function orderProducts(event) {
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

/*Alerta de compra*/
function alertCompra() {
    console.log(cartProducts)
    if (cartProducts.length<=0) {
        return;
    }
    Swal.fire({
        customClass: 'swal-black',
        position: 'center',
        icon: 'success',
        title: 'Productos Comprados!',
        showConfirmButton: false,
        timer: 1500
    })
}

/*Ejecutar funcion para obtener categorias al cargar la pagina y todos los productos*/
window.addEventListener('load', startup, false);
