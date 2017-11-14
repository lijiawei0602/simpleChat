var http = require("http");
var express = require("express");
var socket = require("socket.io");

var app = express();
var server = http.createServer(app);

app.use("/src", express.static("src"));
app.get("/", function(req,res){
    res.sendFile(__dirname + '/index.html');
});

server.listen(1337);
var io = socket.listen(server);

var names = [];
io.sockets.on("connection", function(socket){
    socket.on("login", function(name){
        for(var i=0; i<names.length; i++){
            if(name == names[i]){
                socket.emit("duplicate");
                return;
            }
        }
        names.push(name);
        io.sockets.emit("login", name);
        io.sockets.emit("sendClients", names);
    });

    socket.on("chat", function(data){
        io.sockets.emit("chat", data);
    });
    socket.on("logout", function(name){
        for(var i=0; i<names.length; i++){
            if(name == names[i]){
                names.splice(i, 1);
                break;
            }
        }
        socket.broadcast.emit("logout", name);
        io.sockets.emit("sendClients", names);
    });
});
