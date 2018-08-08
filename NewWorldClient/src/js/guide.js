var ws;
var guideData;
var localStr = localStorage.getItem("newworldlogininfo");
$(function () {
    var url = window.location.href;
    var paramStr = url.split("?");
    var guideArr = paramStr[1].split("=");
    var step = guideArr[1];
    $.getJSON("../../resources/configs/guide.json", function(data) {
        guideData = data;
        setGuideContent(step);
    });
    if ("WebSocket" in window)
    {
        if(ws == null || ws == undefined|| ws.readyState == ws.CLOSED || ws.readyState == ws.CLOSING)
        {
            ws = new WebSocket("ws://localhost:8082/ws/guide");
        }
        ws.onopen = function(){
            console.log("建立新手引导连接");
        }
        ws.onmessage = function (evt)
        {
            console.log("引导收到消息："+evt.data);
            var guideInfo = JSON.parse(evt.data);
            if(guideInfo["guide"] == -1){
                ws.close(1000,"正常关闭");
                window.location.href = "../html/mainview.html";
            }
            else{
                setGuideContent(guideInfo["guide"]);
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
});
function setGuideContent(step){
    if(guideData[step] != undefined && guideData[step] != "" && guideData[step]!= null)
    {
        $("#detail").html(guideData[step]["desc"]);
    }
}
function sendMsg(msg) {
    if(ws != null && ws != undefined && ws.readyState == ws.OPEN)
    {
        console.log("引导发送消息："+msg);
        ws.send(msg);
    }
}

function onNext() {
    if(localStr != undefined && localStr != "" && localStr != null){
        var loginInfo = JSON.parse(localStr);
        sendMsg(JSON.stringify({id:loginInfo["id"],status:"guide_next"}));
    }
}

function onOver() {
    if(localStr != undefined && localStr != "" && localStr != null) {
        var loginInfo = JSON.parse(localStr);
        sendMsg(JSON.stringify({id:loginInfo["id"], status: "guide_over"}));
    }
}