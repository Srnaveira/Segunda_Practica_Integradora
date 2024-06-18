const socket = io();


const div_list_products = document.getElementById('list-products');
const div_list_message = document.getElementById('list-message');
const btnDelete = document.getElementById('btn_delete');
const btnAdd = document.getElementById('btn_add');
const messageEmit = document.createElement('p');



btnAdd.addEventListener('click', () => {
    const product = {
        "title": document.getElementById('title').value,
        "description": document.getElementById('description').value,
        "code": document.getElementById('code').value,
        "price": parseFloat(document.getElementById('price').value),
        "status": document.getElementById('status').checked,
        "stock": parseInt(document.getElementById('stock').value),
        "category": document.getElementById('category').value,
    };
    console.log("producto add", product)
    socket.emit('productAdd', product);
});


btnDelete.addEventListener('click', () => {
    const pid = document.getElementById('idp').value;
    console.log("Evento Delete....:", pid)
    socket.emit('productDelete', pid);
})


socket.on('listProducts', (products) =>{
    div_list_products.innerHTML = ``;
    products.forEach(element => {
        const p = document.createElement('p');

        p.style.border = '1px solid #ccc';
        p.style.padding = '10px';
        p.style.marginBottom = '10px';
        p.style.backgroundColor = '#f0f0f0';

        p.innerHTML = `<strong>Id: </strong> ${element._id}, <strong>Title: </strong>${element.title}, <strong>Description: </strong>${element.description},
        <strong>Price: </strong>${element.price}, <strong>Code: </strong>${element.code},
        <strong>Stock: </strong>${element.stock}`;
        div_list_products.appendChild(p);

    });

})


socket.on('message_add', (message_enviar) =>{
    div_list_message.innerHTML = ``;
    messageEmit.innerHTML = `${message_enviar}`;
    div_list_message.appendChild(messageEmit);
})



socket.on('message_delete', (message_enviar) =>{
    div_list_message.innerHTML = ``;
    messageEmit.innerHTML = `${message_enviar}`;
    div_list_message.appendChild(messageEmit);
})

