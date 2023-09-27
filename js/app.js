let client = {
    table: "",
    hour: "",
    order: []
}

const categoryConverter = {
    1: "Comida",
    2: "Bebidas",
    3: "Postres"
}

const btnSaveCliente = document.querySelector('#guardar-cliente')
btnSaveCliente.addEventListener('click', saveClient)

function saveClient() {
    const table = document.querySelector('#mesa').value
    const hour = document.querySelector('#hora').value

    // Revisar campos vacíos. Some comprueba si alguno de los elemenhtos del array cumple una condicion
    const emptyFields = [table, hour].some(field => field === '')
    if (emptyFields) {
        //verificar si ya hay alerta
        const alertExists = document.querySelector('.invalid-feedback')
        if (!alertExists) {
            const alert = document.createElement('DIV')
            alert.classList.add('invalid-feedback', 'd-block', 'text-center')
            alert.textContent = '*Todos los campos son obligatorios'
            document.querySelector('.modal-body').appendChild(alert)
            setTimeout(() => {
                alert.remove()
            }, 3000)
        }
        return
    }

    // Asignar datos del formulario al cliente
    client = { ...client, table, hour }

    // Ocultar modal
    const modalForm = document.querySelector('#formulario')
    const modalBootstrap = bootstrap.Modal.getInstance(modalForm) //creamos una instancia de modal bootstrap para moder ocultar la modal
    modalBootstrap.hide()//.hide es un metodo de bootstrap para ocultar modales

    // Mostramos las secciones ocultas
    showSections()

    // Obtener platillos de la api de JSON-Server
    getDishes()

}

// Función para mostrar las secciones (están ocultas por defecto en el html)
function showSections() {
    const sectionsHides = document.querySelectorAll('.d-none') // seleccionamos las secciones que están ocultas con esas clase. Es querySelectorAll xk son varias
    sectionsHides.forEach(section => section.classList.remove('d-none')) // iteramos las secciones y les eliminamos la clase que las mantiene ocultas
}

function getDishes() {
    const url = 'http://localhost:4000/platillos'
    fetch(url)
        .then(res => res.json())
        .then(data => showDishes(data))
        .catch(error => console.log(error))
}

function showDishes(dishes) {
    const content = document.querySelector('#platillos .contenido')

    dishes.forEach(dish => {
        const row = document.createElement('DIV')
        row.classList.add('row', 'py-3', "border-top")


        const name = document.createElement('DIV')
        name.classList.add('col-md-4')
        name.textContent = dish.nombre

        const price = document.createElement('DIV')
        price.classList.add('col-md-3', 'fw-bold')
        price.textContent = `${dish.precio} €`

        const category = document.createElement('DIV')
        category.classList.add('col-md-3')
        category.textContent = categoryConverter[dish.categoria]//esto para que sea en texto y no en numero

        const inpuntQuantity = document.createElement('INPUT')
        inpuntQuantity.type = 'number'
        inpuntQuantity.min = 0
        inpuntQuantity.id = `producto-${dish.id}`
        inpuntQuantity.value = 0
        inpuntQuantity.classList.add('form-control', 'col-md-2')

        //Función que detecta la cantidad y el platillo que se está agregando. Necesitamos la cantidad y la referencia al plato
        inpuntQuantity.onchange = () => { //usamos una función anonima con el callback para que no se ejecute y espere al onchange
            const quantity = parseInt(inpuntQuantity.value)   // con esto tenemos la cnatidad
            addDish({ ...dish, quantity }) // metemos en un objeto el objeto dish y la cantidad
        }

        const divQuantity = document.createElement('DIV')
        divQuantity.classList.add('col-md-2')
        divQuantity.appendChild(inpuntQuantity)

        row.appendChild(name)
        row.appendChild(price)
        row.appendChild(category)
        row.appendChild(divQuantity)

        content.appendChild(row)
    })
}

function addDish(productToAdd) {


    // Extraer el pedido actual. Lo hacemos destructurando
    let { order } = client

    // Revisar que la cantidad en el input es > 0
    if (productToAdd.quantity > 0) {
        if (order.some(product => product.id === productToAdd.id)) { //Comprueba si el producto ya estaba en el array pedido
            //Actualizamos la cantidad en lugar de añadir más productos al array
            const updatedOrder = order.map(article => {
                if (article.id === productToAdd.id) {
                    article.quantity = productToAdd.quantity
                }
                return article
            })
            // Se asigna el nuevo array a client.order
            client.order = [...updatedOrder]
        } else {
            client.order = [...order, productToAdd] // El producto no existe en el pedido, añade el producto al array de pedido
        }
    } else {
        //Eliminar elementos cuando la cantidad es 0
        const orderFiltered = order.filter(article => article.id !== productToAdd.id)
        client.order = [...orderFiltered]
    }

    // Limpiar HTML del resumen previamente
    cleanHTML()

    if (client.order.length > 0) { // si hay algo en el pedido
        // Mostrar resumen consumo
        updateContentSummary()
    } else {
        emptyOrderMessage()
    }

}

function updateContentSummary() {
    const content = document.querySelector('#resumen .contenido')

    const summary = document.createElement('DIV')
    summary.classList.add('col-md-6', 'card', 'py-3', 'px-3', 'shadow')

    //Info de la mesa
    const table = document.createElement('P')
    table.textContent = 'Mesa: '
    table.classList.add('fw-bold')

    const tableSpan = document.createElement('SPAN')
    tableSpan.textContent = client.table
    tableSpan.classList.add('fw-normal')
    table.appendChild(tableSpan)

    //Info de la hora
    const hour = document.createElement('P')
    hour.textContent = 'Hora: '
    hour.classList.add('fw-bold')

    const hourSpan = document.createElement('SPAN')
    hourSpan.textContent = client.hour
    hourSpan.classList.add('fw-normal')
    hour.appendChild(hourSpan)

    //Titulo seccion
    const heading = document.createElement('H3')
    heading.textContent = "Platos consumidos"
    heading.classList.add('my-4', 'text-center')

    //Iterar sobre array de pedidos para mostrar en resumen
    const groupList = document.createElement('UL')
    groupList.classList.add('list-group')

    const { order } = client
    order.forEach(article => {
        const { nombre, quantity, precio, id } = article

        const list = document.createElement('LI')
        list.classList.add('list-group-item')

        const nameLI = document.createElement('H4')
        nameLI.classList.add('my-4')
        nameLI.textContent = nombre

        const quantityLI = document.createElement('P')
        quantityLI.classList.add('fw-bold')
        quantityLI.textContent = 'Cantidad: '
        const quantityValue = document.createElement('SPAN')
        quantityValue.classList.add('fw-normal')
        quantityValue.textContent = quantity

        const priceLI = document.createElement('P')
        priceLI.classList.add('fw-bold')
        priceLI.textContent = 'Precio: '
        const priceValue = document.createElement('SPAN')
        priceValue.classList.add('fw-normal')
        priceValue.textContent = `${precio} €`

        //Subtotal Artículo
        const subTotalLI = document.createElement('P')
        subTotalLI.classList.add('fw-bold')
        subTotalLI.textContent = 'Subtotal: '
        const subTotalValue = document.createElement('SPAN')
        subTotalValue.classList.add('fw-normal')
        subTotalValue.textContent = `${precio * quantity} €`

        // Botón para eliminar artículo
        const btnDelete = document.createElement('BUTTON')
        btnDelete.classList.add('btn', 'btn-danger')
        btnDelete.textContent = "Eliminar del pedido"

        //Funcion para elminar del pedido
        btnDelete.onclick = () => {
            deleteFromOrder(id)
        }

        //Agregar valores a contenedores
        quantityLI.appendChild(quantityValue)
        priceLI.appendChild(priceValue)
        subTotalLI.appendChild(subTotalValue)

        //Agregar elementos al LI
        list.appendChild(nameLI)
        list.appendChild(quantityLI)
        list.appendChild(priceLI)
        list.appendChild(subTotalLI)
        list.appendChild(btnDelete)


        //AGregar lista al grupo principal
        groupList.appendChild(list)

    })

    //Agregar al contenido
    summary.appendChild(heading)
    summary.appendChild(table)
    summary.appendChild(hour)
    summary.appendChild(groupList)

    content.appendChild(summary)

    // Mostrar formulario propinas
    showTipsForm()
}

function cleanHTML() {
    const content = document.querySelector('#resumen .contenido')
    while (content.firstChild) {
        content.removeChild(content.firstChild)
    }
}

function deleteFromOrder(id) {
    const { order } = client
    orderUpdated = order.filter(article => article.id !== id)
    client.order = [...orderUpdated]

    // Limpiar HTML del resumen previamente
    cleanHTML()

    if (client.order.length > 0) { // si hay algo en el pedido
        // Mostrar resumen consumo
        updateContentSummary()
    } else {
        emptyOrderMessage()
    }

    // Regresar cantidad a 0 en el formulario
    const deletedProduct = `#producto-${id}`
    const inputDeleted = document.querySelector(deletedProduct)
    inputDeleted.value = 0

}

// Funcion para que se vuelva a imprimir cuando dejamos el pedido en vacio de nuevo
function emptyOrderMessage() {
    const content = document.querySelector('#resumen .contenido')
    const textMessage = document.createElement('P')
    textMessage.classList.add('text-center')
    textMessage.textContent = "Añade los elementos del pedido"

    content.appendChild(textMessage)
}

function showTipsForm() {
    const content = document.querySelector('#resumen .contenido')

    const form = document.createElement('DIV')
    form.classList.add('col-md-6', 'formulario')

    const divForm = document.createElement('DIV')
    divForm.classList.add('card', 'py-3', 'px-3', 'shadow')

    const heading = document.createElement('H3')
    heading.classList.add('my-4', 'text-center')
    heading.textContent = "Propinas"

    //Radio button 10%
    const radio10 = document.createElement('INPUT')
    radio10.type = 'radio'
    radio10.name = 'propina'
    radio10.value = '10'
    radio10.classList.add('form-check-input')
    radio10.onclick = calculateTips

    const radio10Label = document.createElement('LABEL')
    radio10Label.textContent = '10%'
    radio10Label.classList.add('form-check')

    const radio10Div = document.createElement('DIV')
    radio10Div.classList.add('form-check')

    radio10Div.appendChild(radio10)
    radio10Div.appendChild(radio10Label)

    //Radio button 20%
    const radio20 = document.createElement('INPUT')
    radio20.type = 'radio'
    radio20.name = 'propina'
    radio20.value = '20'
    radio20.classList.add('form-check-input')
    radio20.onclick = calculateTips

    const radio20Label = document.createElement('LABEL')
    radio20Label.textContent = '20%'
    radio20Label.classList.add('form-check')

    const radio20Div = document.createElement('DIV')
    radio20Div.classList.add('form-check')

    radio20Div.appendChild(radio20)
    radio20Div.appendChild(radio20Label)

    //Radio button 30%
    const radio30 = document.createElement('INPUT')
    radio30.type = 'radio'
    radio30.name = 'propina'
    radio30.value = '30'
    radio30.classList.add('form-check-input')
    radio30.onclick = calculateTips

    const radio30Label = document.createElement('LABEL')
    radio30Label.textContent = '30%'
    radio30Label.classList.add('form-check')

    const radio30Div = document.createElement('DIV')
    radio30Div.classList.add('form-check')

    radio30Div.appendChild(radio30)
    radio30Div.appendChild(radio30Label)

    divForm.appendChild(heading)
    divForm.appendChild(radio10Div)
    divForm.appendChild(radio20Div)
    divForm.appendChild(radio30Div)

    form.appendChild(divForm)
    content.appendChild(form)

}

function calculateTips() {
    const { order } = client
    let subtotal = 0

    order.forEach(article => {
        subtotal += (article.quantity * article.precio)
    })

    const tipSelected = document.querySelector('[name="propina"]:checked').value

    //Calcular propina
    const totalTip = subtotal * (parseInt(tipSelected) / 100)

    //Calcular total a pagar
    const total = subtotal + totalTip

    showTotalHTML(subtotal, totalTip, total)
}

function showTotalHTML(subtotal, totalTip, total) {

    const divTotals = document.createElement('DIV')
    divTotals.classList.add('total-pagar')

    //Subtotal
    const subtotalP = document.createElement('P')
    subtotalP.classList.add('fs-4', 'fw-bold', 'mt-2')
    subtotalP.textContent = 'Subtotal Consumo: '

    const subtotalSpan = document.createElement('SPAN')
    subtotalSpan.classList.add('fw-normal')
    subtotalSpan.textContent = `${subtotal} €`

    subtotalP.appendChild(subtotalSpan)

    //Propina
    const totalTipP = document.createElement('P')
    totalTipP.classList.add('fs-4', 'fw-bold', 'mt-2')
    totalTipP.textContent = 'Propina: '

    const totalTipSpan = document.createElement('SPAN')
    totalTipSpan.classList.add('fw-normal')
    totalTipSpan.textContent = `${totalTip} €`

    totalTipP.appendChild(totalTipSpan)

    //Total
    const totalP = document.createElement('P')
    totalP.classList.add('fs-3', 'fw-bold', 'mt-3')
    totalP.textContent = 'Total a pagar: '

    const totalSpan = document.createElement('SPAN')
    totalSpan.classList.add('fw-normal')
    totalSpan.textContent = `${total} €`

    totalP.appendChild(totalSpan)

    // Eliminar ultimo resultado si hubiera
    const totalPayDiv = document.querySelector('.total-pagar')
    if (totalPayDiv) {
        totalPayDiv.remove()
    }

    // Agregamos el contenido
    divTotals.appendChild(subtotalP)
    divTotals.appendChild(totalTipP)
    divTotals.appendChild(totalP)


    const form = document.querySelector('.formulario > div')
    form.appendChild(divTotals)

}