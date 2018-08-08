$("input[name='account_input']").focus(function () {
    $(".login_tip").css("visibility","hidden");
    if( $("input[name='account_input']").val() == "请输入账号") {
        $("input[name='account_input']").val("");
        $("input[name='account_input']").css("color", "#000000");
    }
});
$("input[name='account_input']").blur(function () {
    if( $("input[name='account_input']").val() == ""){
        $("input[name='account_input']").val("请输入账号");
        $("input[name='account_input']").css("color","#aaaaaa");
    }
});
$("input[name='psw_input']").focus(function () {
    $(".login_tip").css("visibility","hidden");
    if( $("input[name='psw_input']").val() == "请输入密码") {
        $("input[name='psw_input']").val("");
        $("input[name='psw_input']").css("color", "#000000");
    }
});
$("input[name='psw_input']").blur(function () {
    if( $("input[name='psw_input']").val() == ""){
        $("input[name='psw_input']").val("请输入密码");
        $("input[name='psw_input']").css("color","#aaaaaa");
    }
});
//下载解析第一章配置
$.getJSON("resources/configs/chapterstart.json", function(data) {
    var chapterConfig = data;
    if(chapterConfig["10"] != undefined && chapterConfig["10"] != "" && chapterConfig["10"]!= null)
    {
        $(".game_desc").html(chapterConfig["10"]["desc"]);
    }
});
var ws;
function enterGame() {
    var localStr = localStorage.getItem("newworldlogininfo");
    var userName = "";
    var userPsw = "";
    if ("WebSocket" in window)
    {
        if(ws == null || ws == undefined|| ws.readyState == ws.CLOSED || ws.readyState == ws.CLOSING)
        {
            ws = new WebSocket("ws://localhost:8082/ws/login");
        }
        ws.onopen = function(){
            console.log("建立登录连接");
            if(localStr != undefined && localStr != "" && localStr != null){
                var loginInfo = JSON.parse(localStr);
                userName = loginInfo["name"];
                userPsw = loginInfo["psw"];
                sendMsg(JSON.stringify({name:userName,psw:userPsw}));
            }
            else {
                $(".login").css("display","block");
            }
        }
        ws.onmessage = function (evt)
        {
            console.log("登录界面收到消息："+evt.data);
            var loginInfo = JSON.parse(evt.data);
            if(loginInfo["id"] != null && loginInfo["id"] != "" && loginInfo["id"] != undefined&&loginInfo["register"] == 1)
            {
                $(".login_tip").css("visibility","visible");
                $(".login_tip").html("* 账号已经存在，请换一个试试:)");
            }
            else if(loginInfo["errorId"] == 1){
                $(".login_tip").css("visibility","visible");
                $(".login_tip").html("* 账号注册出错，请换个账号试试或者联系客服:)");
            }
            else if(loginInfo["errorId"] == 2){
                $(".login_tip").css("visibility","visible");
                $(".login_tip").html("* 账号不存在，请重新输入:)");
            }
            else if(loginInfo["guide"]!=null&&loginInfo["guide"]!=undefined)
            {
                localStorage.setItem("newworldlogininfo",JSON.stringify({id:loginInfo["id"],name:loginInfo["name"],psw:loginInfo["psw"]}));
                ws.close(1000,"正常关闭");
                if(loginInfo["guide"] != -1){
                    window.location.href = "src/html/guide.html?guide="+loginInfo["guide"];
                }else{
                    window.location.href = "src/html/mainview.html";
                }
            }else
            {
                $(".login_tip").css("visibility","visible");
                $(".login_tip").html("* 账号或者密码错误:)");
            }
        };
        ws.onclose = function(evt)
        {
            console.log(evt);
        };
        ws.onerror = function (evt) {
            console.log(evt);
        }
    }
}
function sendMsg(msg) {
    if(ws != null && ws != undefined && ws.readyState == ws.OPEN)
    {
        console.log("发送消息："+msg);
        ws.send(msg);
    }
}
$("#btn_login").click(function () {
    var name = $("input[name='account_input']").val();
    var psw = $("input[name='psw_input']").val();
    if(name == "" || name == "请输入账号" || psw == "" || psw == "请输入密码")
    {
        $(".login_tip").css("visibility","visible");
        $(".login_tip").html("* 请输入账号和密码:)");
    }
    else{
        sendMsg(JSON.stringify({"name":name,"psw":psw}));
    }
});
$("#btn_register").click(function () {
    var name = $("input[name='account_input']").val();
    var psw = $("input[name='psw_input']").val();
    if(name == "" || name == "请输入账号" || psw == "" || psw == "请输入密码")
    {
        $(".login_tip").css("visibility","visible");
        $(".login_tip").html("* 请输入账号和密码:)");
    }
    else{
        $.getJSON("resources/configs/forbidens.json", function(data) {
            var isForbiden = false;
           $.each(data,function (index,itemData) {
                if(itemData.indexOf(name)!=-1)
                {
                    $(".login_tip").css("visibility","visible");
                    $(".login_tip").html("* 账号含有敏感字，请重新输入:)");
                    isForbiden = true;
                    return false;
                }
           });
            if(!isForbiden){
                sendMsg(JSON.stringify({"name":name,"psw":psw,"register":1}));
            }
        });
    }
});


