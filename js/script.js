/* Url Endpoint ApiRest */
const urlbaseApiRest = "http://localhost:8080/";
const apiCategories = "categories";
const apiProducts = "products"

/*Obtener todas las categorías para mostrarlas al usuario*/
function getCategories() {
    //Formar la url completa para el request
    let urlApi = urlbaseApiRest+apiCategories;
    //Array para contener la data de categorias de la api
    let categories = [];

    axios.get(urlApi)
        .then(function (response) {
            //Manejar success
            console.log(response);
            //Almacenar data en array categories
            categories = response.data;
            //Validar que se hay obtenido data de la api para ejecutar la funcion de renderizado de categorias
            if(categories.length > 0) {
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
        containerCategories.append('<button type="button" class="btn btn-outline-light">'+category.name.toUpperCase()+'</button>');
    }
}

/*Ejecutar funcion para obtener categorias al cargar la pagina*/
window.addEventListener('load', getCategories, false);