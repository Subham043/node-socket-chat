const socket = io();

let name;

let textarea = document.querySelector('#textarea');

let messageArea = document.querySelector('.message__area');



name = person;
user_id = person_id;


textarea.addEventListener('keyup', (e) => {
    if(e.key === 'Enter'){
        sendMessage(e.target.value);
    }
})

textarea.addEventListener('input', (e) => {
    //alert('typing')
    //send to server via socket about typing
    let type = {user: name}
    socket.emit('typing', type)
})

function sendBtnMsg(){
     
    if(!textarea.value.length == 0){
        sendMessage(textarea.value);
        
    }

}

function sendMessage(messge){
    let msg = {
        user: name,
        user_id: user_id,
        message: messge.trim(),
    }

    //append
    appendMessage(msg, 'outgoing');

    textarea.value='';

    scrollToBottom();

    //send to server via socket
    socket.emit('message', msg)
}

function appendMessage(msg, type){
    let mainDiv = document.createElement('div');
    let className = type;

    mainDiv.classList.add(className, 'message');

    let markup = `
        <h4>${msg.user}</h4>
        <p>${msg.message}</p>
    `;

    mainDiv.innerHTML = markup;

    messageArea.appendChild(mainDiv);
}


//recieve message from socket

socket.on('message', (msg) => {
    //console.log(msg)
    appendMessage(msg, 'incoming');

    scrollToBottom();

    document.getElementById('msg_tone').play()
    document.getElementById('typing_text').innerText = "";

})

//recieve typing from socket

socket.on('typing', (type) => {

    // console.log(type.user+" is typing")

    document.getElementById('typing_text').innerText = type.user+" is typing..."

})


function scrollToBottom(){
    messageArea.scrollTop = messageArea.scrollHeight;
}