//Include socket.io to connect client to server
const socket = io();

let userName = "";
let currentRoom;

//Creating a room
document.querySelector("#create-form").addEventListener("submit",function(e){
    //We will handel the event our self
    e.preventDefault();
    //Gather the filled in username and roomnumber
    let roomId = document.querySelector("#create-id");
    let userName = document.querySelector("#create-name");
    currentRoom = roomId;
    socket.emit('create room', {username: userName.value, room: roomId.value});
    //Clear the fields
    userName.value = "";
    roomId.value = "";
});

//Joining a room
document.querySelector("#join-form").addEventListener("submit", function(e){
    //We will handel the event our self
    e.preventDefault();
    //Gather the filled in username and roomnumber
    let roomId = document.querySelector("#join-id");
    let userName = document.querySelector("#join-name");
    currentRoom = roomId.value;
    socket.emit('join room', {username: userName.value, room: roomId.value});
    //Clear the fields
    userName.value = "";
    roomId.value = "";
});

socket.on('start game', function(data){
    console.log("yeey made it");
    if(data == true){
        //Hide login screen
        HideLogin();
        //Show game screen
        ShowGame();

        //Set room number
        document.getElementById("roomnumber h1").innerHTML = "Room: " + currentRoom.value;

        //Request users in room
        socket.emit('get users', currentRoom);
    }
    else{
        document.getElementById("login-err-msg").innerHTML = "error";
    }
});

socket.on('nickname', function(data){
    userName = data;
})


function HideLogin(){
    console.log("trying to hide the login screen");
    document.getElementById("login").style.display = "none";
}
function ShowGame(){
    console.log("trying to show the game screen");
    document.getElementById("sps-wrapper").style.display = "block";
}







//
// function writeText(text){
//     console.log(text.length);
//     //Find parent list element where item can be merged into
//     const parent = document.querySelector("#events");
//     //Create a new list item
//     const el = document.createElement('li');
//     //Set the text of the list item to the text passed through the function
//     el.innerHTML = text;
//     //Add the newly created list item to the parent list
//     parent.appendChild(el);
// }
//
//
//
// writeText('Welkom bij het klassieke gokspel: Steen, Papier en Schaar!');
//
// socket.on('message', writeText);
// document
//     .querySelector('#chat-form')
//     .addEventListener('submit', onJoinFormSubmitted);
//
// document
