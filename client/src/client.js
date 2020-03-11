//Include socket.io to connect client to server
const socket = io();

function writeText(text){
    //Find parent list element where item can be merged into
    const parent = document.querySelector("#events");
    //Create a new list item
    const el = document.createElement('li');
    //Set the text of the list item to the text passed through the function
    el.innerHTML = text;
    //Add the newly created list item to the parent list
    parent.appendChild(el);
}

const onFormSubmitted = (e) => {
    //We will handel the event our self
    e.preventDefault();
    //Gets the input from the form
    const input = document.querySelector("#chat");
    //Save the current state of the input
    const inputText = input.value;
    //Clear the input field
    input.value = '';

    //Send text to the server
    socket.emit('message', inputText);

};

writeText('Welkom bij het klassieke gokspel: Steen, Papier en Schaar!');
socket.on('message', writeText);
document
    .querySelector('#chat-form')
    .addEventListener('submit', onFormSubmitted);
