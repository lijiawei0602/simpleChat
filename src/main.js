window.onload = function(){
    var foo = {
        username: '',
        userList: document.getElementsByClassName("chatBoxUser")[0],
        divchat: document.getElementsByClassName("chatBoxContentMain")[0],
        socket: "",
        loginBtnClick: function(){
            var loginBtn = document.getElementById("loginBox-login");
            loginBtn.addEventListener("click", (function(){
                var usernameInput = document.getElementsByClassName("loginBox-input")[0].value;
                if(usernameInput.trim() == ""){
                    alert("请输入用户名！");
                    return;
                }
                this.username = usernameInput.trim();
                this.socket = io.connect(); //连接socket服务器
                this.socket.on("connect", function(socket){
                    foo.addMsg("与服务器连接已建立...");
                    foo.socket.on("login", function(name){
                        foo.addMsg("欢迎用户 " + name + " 进入聊天室.");
                    });
                    foo.socket.on("sendClients", function(names){
                        var str = '';
                        names.forEach(function(item){
                            str += item + "<br />";
                        });
                        foo.userList.innerHTML = "用户列表：<br />";
                        foo.userList.innerHTML += str;
                    });
                    foo.socket.on("chat", function(data){
                        foo.addMsg(data.user+ '说：' + data.msg);
                    });
                    foo.socket.on("disconnect", function(){
                        foo.addMsg("与聊天室服务器连接已断开.");
                        //禁用相关按钮
                        document.getElementById("loginBox-exit").disabled = true;
                        document.getElementById("submit").disabled = true;
                        document.getElementById("loginBox-login").disabled = '';
                        foo.userList = "用户列表";
                    });
                    foo.socket.on("logout", function(name){
                        foo.addMsg("用户" + name + "已从聊天室离开...");
                    });
                    foo.socket.on("duplicate", function(){
                        foo.alert("该用户名已被使用");
                    });
                });
                this.socket.on("error", function(err){
                    foo.addMsg("与聊天服务器连接失败");
                    foo.socket.disconnect();
                    foo.socket.removeEventListener("connect");
                    io.sockets = {};
                });

                this.socket.emit("login", this.username);
                document.getElementById("loginBox-exit").disabled = '';
                document.getElementById("submit").disabled = '';
                document.getElementById("loginBox-login").disabled = true;
            }).bind(this), false);

        },
        sendClick: function(){
            var sendBtn = document.getElementById("submit");
            sendBtn.addEventListener("click", (function(){
                var userScanf = document.getElementById("userScanf");
                if(userScanf.value.length > 0){
                    this.socket.emit("chat", {user:this.username, msg:userScanf.value});
                    userScanf.value = "";
                }
            }).bind(this), false);
        },
        logoutClick: function(){
            var logoutBtn = document.getElementById("loginBox-exit");
            logoutBtn.addEventListener("click", (function(){
                this.socket.emit("logout", this.username);
                this.socket.disconnect();
                this.socket.removeEventListener("connect");
                io.sockets = {};
                document.getElementById("loginBox-exit").disabled = true;
                document.getElementById("submit").disabled = true;
                document.getElementById("loginBox-login").disabled = '';
            }).bind(this), false);
        },
        addMsg: function(msg){
            this.divchat.innerHTML += msg + "<br />";
        }
    };
    foo.loginBtnClick();
    foo.sendClick();
    foo.logoutClick();
};