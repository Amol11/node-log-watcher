const socket = io();

socket.on('fileLogs', (mssg) => {
    for(var log of mssg) console.log(log);
    for(var i of mssg){
        var node = document.createElement("LI"); 
        var log = document.createTextNode(i);
        node.appendChild(log);                          
        document.getElementById("log").appendChild(node);
    }
});

socket.on('fileUpdate', (logUpdates) => {
    for(var log of logUpdates) console.log(log);
    for(var i of logUpdates){
        var node = document.createElement("LI"); 
        var log = document.createTextNode(i);
        node.appendChild(log);                          
        document.getElementById("log").appendChild(node);
    }
});