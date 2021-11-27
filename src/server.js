const express = require('express');
const fs = require('fs');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const readLastLines = require('read-last-lines');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath));
let logRead = [];
let logFilePath = path.join(__dirname, '../logFile/logs.txt');
let fsWait = false;

// fs.readFile(logFilePath, 'utf8', function(err, data) {
//     if(err){
//         console.log(err);
//         throw err;
//     }

//     logRead = data.toString().replace(/\r\n/g,'\n').split('\n');
//     if(logRead.length > 10){
//         logRead = logRead.slice(logRead.length - 10);
//     }
//     for(let i of logRead) console.log(i);
// });

readLastLines.read(publicDirPath, 10)
	.then((lines) => {
        console.log(lines)
        logRead = lines;
});

fs.open(logFilePath, 'r', (err, fd) => {
    if(err) {
        console.error("Unable to open logs file!");
        return;
    }
    fs.watchFile(logFilePath, (curr, prev) => {
        if(fsWait) return;
        fsWait = setTimeout(() => {
            fsWait = false;
        }, 50);

        let len = curr.size - prev.size, position = prev.size;
        console.log("file updated!");
        if (len > 0) {
            var buf = new Buffer.alloc(1024);
            fs.read(fd, buf, 0, len, position, (err, bytesRead, buffer) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    let msg = buffer.toString('utf8', 0, bytesRead);
                    // console.log(msg);
                    let msgArr = msg.replace(/\r\n/g,'\n').split('\n');
                    msgArr.shift();
                    if(logRead.length === 10){
                        for(var i=0;i<msgArr.length;i++)
                            logRead.shift();
                    }
                    else if((logRead.length + msgArr.length) > 10){
                        for(var i=0;i<((logRead.length + msgArr.length - 10));i++)
                            logRead.shift();
                    }
                    logRead = logRead.concat(msgArr);
                    io.emit('fileUpdate', msgArr);
                });
        } else {
            console.log(curr);
        }
    });
});

io.on('connection', (socket) => {
    console.log('New client connected!');

    socket.emit('fileLogs', logRead);
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});