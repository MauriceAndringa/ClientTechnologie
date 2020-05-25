//Include socket.io to connect client to server
const socket = io();

let userName = "";
let currentRoom;
let submitted = false;

//Creating a room
document.querySelector("#create-form").addEventListener("submit",function(e){
    //We will handel the event our self
    e.preventDefault();
    //Gather the filled in username and roomnumber
    let roomId = document.querySelector("#create-id");
    let userName = document.querySelector("#create-name");
    currentRoom = roomId.value;
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

//Sending a message in chat
document.querySelector('#chat-form').addEventListener('submit', function (e) {
    //We will handel the event our self
    e.preventDefault();
    //Gets the input from the form
    const input = document.querySelector("#chat");
    //Save the current state of the input
    const inputText = input.value;
    if(inputText.length > 0){
        //Clear the input field
        input.value = '';
        //Send text to the server
        socket.emit('global message', ('<b>' + userName + '</b>' + ": " + inputText).toString(), currentRoom);
    }
});

document.querySelector("#sps-steen").addEventListener('click', function(e){
    e.preventDefault();
    if(!submitted){
        submitted = true;
        socket.emit('player choice', currentRoom, userName, 'steen');
        socket.emit('broadcast message', '<b>Game: </b><i>'+userName+'</i>' + " heeft een keuze gemaakt", currentRoom);
    }
    else{
        socket.emit('message', '<b>Game: </b>' + "Je hebt al gekozen!");
    }
});

document.querySelector("#sps-papier").addEventListener('click', function(e){
    e.preventDefault();
    if(!submitted){
        submitted = true;
        socket.emit('player choice', currentRoom, userName, 'papier');
        socket.emit('broadcast message', '<b>Game: </b><i>'+userName+'</i>' + " heeft een keuze gemaakt", currentRoom);
    }
    else{
        socket.emit('message', '<b>Game: </b>' + "Je hebt al gekozen!");
    }
});

document.querySelector("#sps-schaar").addEventListener('click', function(e){
    e.preventDefault();
    if(!submitted){
        submitted = true;
        socket.emit('player choice', currentRoom, userName, 'schaar');
        socket.emit('broadcast message', '<b>Game: </b><i>'+userName+'</i>' + " heeft een keuze gemaakt", currentRoom);
        //socket.emit('message', '<b>Game: </b>' + "Je hebt schaar gekozen, wachten op andere speler...");
    }
    else{
        socket.emit('message', '<b>Game: </b>' + "Je hebt al gekozen!");
    }
});

//Hide the login screen
function hideLogin(){
    document.getElementById("login").style.display = "none";
}
//Show the game screen
function showGame(){
    document.getElementById("sps-wrapper").style.display = "block";
    disableButtons();
}

function enableButtons(){
    document.getElementById("sps-steen").disabled = false;
    document.getElementById("sps-papier").disabled = false;
    document.getElementById("sps-schaar").disabled = false;
}

function disableButtons(){
    document.getElementById("sps-steen").disabled = true;
    document.getElementById("sps-papier").disabled = true;
    document.getElementById("sps-schaar").disabled = true;
}


//Event to show game screen when the game starts
socket.on('show game', function(data, users){
    if(data == true){
        hideLogin();
        showGame();
        //Request users in room
        socket.emit('get users', currentRoom);
        if(users.length == 2){
            socket.emit('game start')
        }else{
        }
    }
    else{
        document.getElementById("login-err-msg").innerHTML = "error";
    }
});

socket.on('game start', function(){
    enableButtons();
});

socket.on('player 1 win', function(choices){
    setTimeout(function(){
        submitted = false;
        if(choices[0][0] === userName){
            socket.emit('self message', '<b>Game: </b>' + "Je hebt gewonnen!" + '<br><i>' + choices[0][0] + "</i> had " + choices[0][1] + " en <i>jij</i> had " + choices[1][1] + ".");
        }else{
            socket.emit('self message', '<b>Game: </b>' + "Je hebt verloren..." + '<br><i>' + choices[1][0] + "</i> had " + choices[1][1] + " en <i>jij</i> had " + choices[0][1] + ".");
        }
    }, 500);

});

socket.on('player 2 win', function(choices){
    setTimeout(function(){
        submitted = false;
        if(choices[1][0] === userName){
            socket.emit('self message', '<b>Game: </b>' + "Je hebt gewonnen!" + '<br><i>' + choices[0][0] + "</i> had " + choices[0][1] + " en <i>jij</i> had " + choices[1][1] + ".");
        }else{
            socket.emit('self message', '<b>Game: </b>' + "Je hebt verloren..." + '<br><i>' + choices[1][0] + "</i> had " + choices[1][1] + " en <i>jij</i> had " + choices[0][1] + ".");
        }
    }, 500);

});

socket.on('tie', function(choices){
    setTimeout(function(){
        submitted = false;
        if(choices[1][0] === userName){
            socket.emit('self message', '<b>Game: </b>' + "Gelijkspel! Niemand wint..." + '<br><i>' + choices[0][0] + "</i> had " + choices[0][1] + " en <i>jij</i> had " + choices[1][1] + ".");
        }
        else{
            socket.emit('self message', '<b>Game: </b>' + "Gelijkspel! Niemand wint..." + '<br><i>' + choices[1][0] + "</i> had " + choices[1][1] + " en <i>jij</i> had " + choices[0][1] + ".");
        }

    }, 500);
});

//Set nickname for socket
socket.on('nickname', function(data){
    userName = data;
});

socket.on('get room', function(data){
    let html = '';
    if(data.length > 0){
        for(let i = 0; i < data.length; i++) {
            if (data[i].users.length >= 2) {
                html += '<li class="list-group-item bg-light"> Kamer: ' + data[i].roomNumber + ' - Vol!</li>';
            } else {
                html += '<li class="list-group-item bg-light"> Kamer: ' + data[i].roomNumber + ' - Wachten op speler...</li>';
            }
        }
    }else{
        html += '<li class="list-group-item bg-light"> Geen beschikbare kamers. Maak een kamer aan om een spel te starten!</li>';
    }
    document.getElementById("rooms").innerHTML = html;
});

//Display error message when creating a room
socket.on('errorMessageCreate', function(data){
    document.getElementById('alertCreate').style.display = "block";
    document.getElementById('alertJoin').style.display = "none";
    document.getElementById('alertCreate').innerHTML = data;
});

//Display error message when joining a room
socket.on('errorMessageJoin', function(data){
    document.getElementById('alertJoin').style.display = "block";
    document.getElementById('alertCreate').style.display = "none";
    document.getElementById('alertJoin').innerHTML = data;
});

//Display all users in the room
socket.on('get user', function(data){
    if(data.length == 2){
        enableButtons();
    }else{
        disableButtons();
    }
    let html = '';
    for(let i = 0; i < data.length; i++){
        if(data[i] === userName){
            html += '<li class="list-group-item bg-light">' + data[i] + ' : jij</li>';
        }
        else{
            html += '<li class="list-group-item bg-light">' + data[i] + '</li>';
        }

    }
    document.getElementById("users").innerHTML = html;
});

socket.on('message', function(text){
    //Find parent list element where item can be merged into
    const parent = document.querySelector("#events");
    //Create a new list item
    const el = document.createElement('li');
    el.className = "list-group-item bg-light";
    //Set the text of the list item to the text passed through the function
    el.innerHTML = text;
    //Add the newly created list item to the parent list
    parent.insertBefore(el, parent.firstChild);
});