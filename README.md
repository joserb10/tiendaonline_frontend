# Construcción

## Lenguaje y librerías

Para la construcción del frontend se hizo uso de JavaScript puro con el uso de librerías que incluye Jquery, Bootstrap, SweetAlert2, AnimateCss y Axios.

## Funcionalidades

### Obtener productos por categoría

#### Obtener todas las categorías

Para que el cliente pueda obtener los productos filtrados por categoría en primer lugar se debía obtener todas las categorías de la base de datos.

```
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
```

#### Renderizado de categorías

Una vez obtenidas con Axios se debe renderizar en el html cada una de las categorías para lo cual se hizo la función renderCategories(categories) que recibe como parametro las categorias obtenidas de la api.

```
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
```

#### Ejecución de funciones al cargar la página}

La función principal getCategories() que en su interior ejecuta renderCategories(categories) se debe ejecutar automaticamente al cargarse la página para lo cual se generó una función llamada startup() donde se encontraran todas las funciones que se deban ejecutar al cargar la página.

```
/* Ejecutar funciones getCategories y getAllProducts */
function startup() {
    getCategories();
    getAllProducts();
}
```

```
/*Ejecutar funcion para obtener categorias al cargar la pagina y todos los productos*/
window.addEventListener('load', startup, false);
```

#### Obtener todos los productos iniciales

Al cargarse la página se obtendrán todos los productos sin ningún filtro para que el usuario las pueda filtrar posteriormente.

```
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
```

#### Renderizado de productos

Una vez obtenidos todos los productos se deben renderizar en el html.

```
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
```

De igual forma esta función se encontrará dentro de la función startup que se ejecuta al cargar la página.

#### Obtener productos por categoría

Una vez obtenidos los productos y categorías al cargar la página se puede obtener los productos filtrados por categoría presionando en el botón de la categoría que desee el usuario esto activará la siguiente función getProductsByCategory(category) al cual se le pasa el id de categoria del botón.

```
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
```

Se termina de ejecutar la funcíon y se vuelve a renderizar los productos eliminando los anteriores.

### Obtener productos por texto de búsqueda

Esta función obtendrá los productos que posean el texto ingresado por el usuario y renderizará dichos productos en el html.

```
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
        })
        .catch(function (error) {
            //Manejar error
            console.log(error);
        })
        .then(function () {
            //Siempre se ejecuta
        });
}
```

### Obtener productos por rango de precios

Esta función obtendrá los productos por que esten dentro de un rango de precios ingresados por el usuario.

```
/*Obtener productos por rango de precios*/
function getProductsByPriceRange() {
    //Obtener valor del input min-price
    let min_price = $('#min_price').val();
    //Obtener valor del input max-price
    let max_price = $('#max_price').val();
    let query;
    //Validar si min_price tiene valor diferente a null
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
```

### Agregar productos al carrito de compras

Para poder colocar un producto en el carrito de compras el usuario debe dar click en el botón "Añadir a carrito" del producto que desee de tal forma que se ejecute la función addProductToCart(productId) recibiendo como parametro el id del producto a añadir.

```
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
```

### Renderizado productos en el carrito de compras

Cada vez que se añada un producto al carrito de compras se ejecutará la función renderCartProducts() que pintará todos los productos que se encuentren la variable global cartProducts array de productos.

```
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
```

### Calcular el total por producto

Esta función se activará cada vez que el usuario despues de que haya añadido por lo menos un producto al carrito, le modifique la cantidad del producto añadido entonces se calcular el precio total de ese producto.

```

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
```

### Quitar producto del carrito

Esta función se ejecutará al dar click en el botón eliminar de un producto del carrito, haciendo que ese producto se quite del array de cartProducts y que al renderizarse denuevo los productos del carrito ya no aparezca dicho producto.

```
/*Quitar producto de array cartProducts*/
function quitarCartProduct(indexProduct) {
    console.log('borrat'+indexProduct)
    cartProducts.splice(indexProduct,1);
    renderCartProducts();
    //Calcular total
    calculateTotalPrice();
}
```

### Calcular precio total a pagar

Esta función se ejecuta cuando se añade un nuevo producto al carrito, cuando se quita y cuando se modifica la cantidad de un producto.

```
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
```

# Estilos

Los estilos están construidos con bootstrap y las personalizaciones específicas están escritas en css.

## Responsive Design

El responsive design se construyó con el sistema de grillas de bootstrap de tal manera que la vista para dispositivos de diferentes tamaños se adapte y sea agradable al usuario. Este sitema de grillas se basa en filas "row" y columnas "col", las columnas pueden tomar desde un ancho 1 - 12.

```
<div class="container">
  <div class="row">
    <div class="col">
      Column
    </div>
    <div class="col">
      Column
    </div>
    <div class="col">
      Column
    </div>
  </div>
</div>
```

## Estilos Personalizados en CSS

### Customizar el carousel y sus elementos

Se modificó el alto de la imagen de carousel y se crearon dos clases para que los captions de cada imagen vaya una a la izquierda y la otra a la derecha.

```
/*Customización carousel*/
/*encajar imagen al ancho de la pantalla y alto*/
.img-carousel {
    height: 450px;
    object-fit: cover;
}

/*alinear texto de caption a la derecha*/
.caption-img-carousel-right {
    top: 180px;
    right: 30px;
    text-align: right;
}

/*alinear texto de caption a la izquierda*/
.caption-img-carousel-left {
    top: 180px;
    left: 30px;
    text-align: left;
}
```

### Spinners Para mostrar al usuario la carga de elementos

Se escribió los siguientes estilos para manejar la petición de categorias y mostrar un spinner mientras carga la obtención de categorías.

```
/*Spinner Para carga de categorias de api*/
.spinner {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
  }
  .spinner div {
    display: inline-block;
    position: absolute;
    left: 8px;
    width: 16px;
    background: #fff;
    animation: spinner 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;
  }
  .spinner div:nth-child(1) {
    left: 8px;
    animation-delay: -0.24s;
  }
  .spinner div:nth-child(2) {
    left: 32px;
    animation-delay: -0.12s;
  }
  .spinner div:nth-child(3) {
    left: 56px;
    animation-delay: 0;
  }
  @keyframes spinner {
    0% {
      top: 8px;
      height: 64px;
    }
    50%, 100% {
      top: 24px;
      height: 32px;
    }
  }
```

### Transiciones y hover effect sobre los cards de productos

Los estilos al hacer pasar el mouse sobre el card de producto este se mostrará 125% más grande y con un color más opaco.

```
/*Spinner Para carga de categorias de api*/
.spinner {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
  }
  .spinner div {
    display: inline-block;
    position: absolute;
    left: 8px;
    width: 16px;
    background: #fff;
    animation: spinner 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;
  }
  .spinner div:nth-child(1) {
    left: 8px;
    animation-delay: -0.24s;
  }
  .spinner div:nth-child(2) {
    left: 32px;
    animation-delay: -0.12s;
  }
  .spinner div:nth-child(3) {
    left: 56px;
    animation-delay: 0;
  }
  @keyframes spinner {
    0% {
      top: 8px;
      height: 64px;
    }
    50%, 100% {
      top: 24px;
      height: 32px;
    }
  }
```

### Clases de badges de descuento de card de producto

Estos estilos permiten que los badges tenan un background color gradiente y un clase para que se oculten los badges.

```
/*Customizar badge de card product*/
.badge-custom {
    background: rgb(6,3,65);
    background: linear-gradient(90deg, rgba(6,3,65,1) 0%, rgb(180, 174, 174) 100%);
}

/*Class para esconder badges de descuento*/
.display_none {
    display: none;    
}
```

### Customizar Swal alert

Estos estilos modifican los estilos por defecto de SweetAlert2, cambiandole los tamaños y colores.

```
/*Customizar Swal Alert*/
.swal2-title {
    color: white !important;
    font-size: 15px !important;
}
.swal-small {
    height: 60px !important;
    width: 300px !important;
}

/*Customizar Swal Alert de añadir a carrito*/
.swal-small-cart {
    height: 43px !important;
    width: 300px !important;
}
```

# Validaciones y Alertas

## Validar inputs de rango de precios

### Alerta minPrice y maxPrice deben tener un valor mayor a cero

Al hacer click en el botón "Filtrar" antes de obtener los productos filtrados por el rango de precios se valida que el minPrice y maxPrice no sean negativos y sean mayor a cero caso contrario se muestra una alerta.

```
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
```

### Alerta minPrice es mayot a maxPrice

Al hacer click en el botón "Filtrar" antes de obtener los productos filtrados por el rango de precios se valida que el minPrice sea menor o igual maxPrice caso contrario salta una alerta de error.

```
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
```

## Validar que el mismo producto no se agregue dos veces al carrito

### Alerta producto ya ha sido añadido al carrito

Al hacer click en "Añadir a carrito" de un producto se valida que este producto no se encuentre ya en el carrito caso contrario se muestra una alerta.

```
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
```

# Deployment

## AWS Instance

Para el despliegue de la aplicación se usó amazon web services con una cuenta gratuita, donde se lanzó una instancia EC2 con el sistema operativo Ubuntu, se activo los puertos http, https, para todos los origenes de forma que la aplicación web sea accesibles. Así también se configuró una ip elástica para la instancia, de tal modo que al reiniciar la instancia no se modifique la ipv4 pública.

## Configuración de entorno virtual Ubuntu

Se ingresó a la máquina virtual a través de putty con el uso de una llave par de claves .PPK, se actualizó el sistema operativo y se instaló nginx como servidor web y unzip para poder descomprimir el proyecto en el servidor.

```
    ssudo apt-get update
    sudo apt-get install nginx
    sudo apt install unzip
```

## Configuración de nginx para deploy

Se configuró el archivo de condiguración por defecto de nginx para que la aplicación web que lea tenga el root: "/home/ubuntu" lugar donde se copió el proyecto comprimido y se descomprimió con unzip. Se copió el proyecto comprimido usando filezilla en "/home/ubuntu".

```
    cd /home/ubuntu/
    sudo unzip tienda_online.zip
```

## Configuración de dominio con Route 53

### Obtención dominio

Se obtuvo el dominio "tiendaonlinebsale.soy.pe" a través de aqphost de forma gratuita.

### Creación de Zona Alojada

Se creó una zona alojada en aws con el nombre de dominio adquirido y se le creó dos registros adicionales.
El primero con el nombre original "tiendaonlinebsale.soy.pe" configurado con la ip del servidor web y el segundo con "www.tiendaonlinebsale.soy.pe".

### Asignación de dns a dominio en aqphost

Se estableció los siguientes 4 nombres de servidor:

```
Name Server 1: ns-736.awsdns-28.net
Name Server 1: ns-36.awsdns-04.com
Name Server 1: ns-1216.awsdns-24.org
Name Server 1: ns-1943.awsdns-50.co.uk
```









