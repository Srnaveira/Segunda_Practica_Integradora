const socket = io();


// Escuchar el evento cuando se hace clic en el botón "Agregar"
//document.addEventListener('DOMContentLoaded', () => {
//    const buttons = document.querySelectorAll('[id^="button_add_"]'); // Seleccionar todos los botones que comienzan con "button_add_"
//    buttons.forEach(button => {
//        button.addEventListener('click', () => {
//            const productId = button.getAttribute('id').replace('button_add_', ''); // Obtener el ID del producto desde el ID del botón
//            console.log(res.locals.user.cartId)
//            //const CartId= user.cartId;
//            const productInfo = {
//                _id: productId,
//                //cartId: CartId
//            };
//            console.log(productInfo)
//            // Enviar el ID del producto al servidor a través del socket
//            socket.emit('add_Product_cart', productInfo);
//        });
//    });
//});

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/users/user')
        .then(response => response.json())
        .then(user => {
            // Ahora tienes el objeto user disponible aquí
            const buttons = document.querySelectorAll('[id^="button_add_"]');
            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    const productId = button.getAttribute('id').replace('button_add_', '');
                    const CartId = user.cartId;
                    const productInfo = {
                        _id: productId,
                        cartId: CartId
                    };
                    console.log(productInfo);
                    socket.emit('add_Product_cart', productInfo);
                });
            });
        })
        .catch(error => console.error('Error fetching user:', error));
});


socket.on('productAdded', (message) =>{

    console.log(message)

})