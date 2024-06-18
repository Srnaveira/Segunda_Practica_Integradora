const socket = io();
socket.emit('message', "hola, me estoy comunicando desde un webSocket");

socket.on('message', data =>{
    console.log(data);
})

socket.on('message_user_conect', data =>{
    console.log(data);
})

socket.on('event_for_all',data =>{
    console.log(data);
})


