var ws;
var msg_query_user_info = 1;
var msg_query_tasks_attrs = 2;
var msg_query_skill_equips = 3;
var msg_change_name = 4;
var localStr = localStorage.getItem("newworldlogininfo");
var userId;
var userInfo = {};
var accountName;
$(function () {
    if ("WebSocket" in window)
    {
        if(ws == null || ws == undefined|| ws.readyState == ws.CLOSED || ws.readyState == ws.CLOSING)
        {
            ws = new WebSocket("ws://localhost:8082/ws/mainview");
        }
        ws.onopen = function(){
            console.log("建立主界面通信连接");
            if(localStr != undefined && localStr != "" && localStr != null) {
                var loginInfo = JSON.parse(localStr);
                userId = loginInfo["id"];
                accountName = loginInfo["name"];
            }
            sendMsg(JSON.stringify({cmd:msg_query_user_info,id:userId}));
        }
        ws.onmessage = function (evt)
        {
            console.log("主界面收到消息："+evt.data);
            var message = JSON.parse(evt.data);
            if(message["cmd"] == msg_query_user_info){
                userInfo["id"] = message["id"];
                userInfo["name"] = message["name"];
                $("#player_name").html(userInfo["name"]);
                if(userInfo["name"]==accountName){
                    $("#changeNameBtn").css("display","inline");
                }
                userInfo["level"] = message["level"];
                userInfo["exp"] = message["exp"];
                userInfo["id_pet"] = message["id_pet"];
                userInfo["bag_maxnum"] = message["bag_maxnum"];
                userInfo["gold"] = message["gold"];
                userInfo["money"] = message["money"];
                userInfo["id_map"] = message["id_map"];
                showStory();
                sendMsg(JSON.stringify({cmd:msg_query_tasks_attrs,id:userId}));
            }else if(message["cmd"] == msg_query_tasks_attrs){
                userInfo["id_tasks"] = message["id_tasks"];
                userInfo["attack"] = message["attack"];
                userInfo["m_attack"] = message["m_attack"];
                userInfo["def"] = message["def"];
                userInfo["m_def"] = message["m_def"];
                sendMsg(JSON.stringify({cmd:msg_query_skill_equips,id:userId}));
            }else if(message["cmd"] == msg_query_skill_equips) {
                userInfo["ids_skill"] = message["ids_skill"];
                userInfo["equip_head"] = message["equip_head"];
                userInfo["equip_body"] = message["equip_body"];
                userInfo["equip_pants"] = message["equip_pants"];
                userInfo["equip_shoes"] = message["equip_shoes"];
                userInfo["equip_weapon"] = message["equip_weapon"];
                console.log(JSON.stringify(userInfo));
            }else if(message["cmd"] == msg_change_name) {
                if(message["result"] == 1){
                    $("#player_name").html(message["name"]);
                    $("#changeNameBtn").css("display","none");
                }
                else{
                    alert("改名失败！请晚点再试试或者联系客服");
                }
                $(".change_name_container").hide();
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

function sendMsg(msg) {
    if(ws != null && ws != undefined && ws.readyState == ws.OPEN)
    {
        console.log("主界面发送消息："+msg);
        ws.send(msg);
    }
}
$("input[name='name_input']").focus(function () {
    $(".name_tip").css("visibility","hidden");
    if( $("input[name='name_input']").val() == "请输入新的角色名") {
        $("input[name='name_input']").val("");
        $("input[name='name_input']").css("color", "#000000");
    }
});
$("input[name='name_input']").blur(function () {
    if( $("input[name='name_input']").val() == ""){
        $("input[name='name_input']").val("请输入新的角色名");
        $("input[name='name_input']").css("color","#aaaaaa");
    }
});
function changeName() {
    $(".change_name_container").show();
}
$("#btn_change").click(function () {
    var name = $("input[name='name_input']").val();
    if(name == "" || name == "请输入新的角色名")
    {
        $(".name_tip").css("visibility","visible");
        $(".name_tip").html("* 请输入新的角色名:)");
    }
    else{
        $.getJSON("../../resources/configs/forbidens.json", function(data) {
            var isForbiden = false;
            $.each(data,function (index,itemData) {
                if(itemData.indexOf(name)!=-1)
                {
                    $(".name_tip").css("visibility","visible");
                    $(".name_tip").html("* 新名字带有敏感字，请换一个:)");
                    isForbiden = true;
                    return false;
                }
            });
            if(!isForbiden){
                sendMsg(JSON.stringify({cmd:msg_change_name,id:userId,name:name}));
            }
        });
    }
});

function showStory(){
    $.getJSON("../../resources/configs/story.json", function(data) {
        var storyConfig = data;
        var level =  Math.floor(userInfo["level"]/30)*30 + "";
        console.log("------------"+userInfo["level"]+"----"+level);
        if(storyConfig[level] != undefined && storyConfig[level] != "" && storyConfig[level]!= null)
        {
            $(".story").html(storyConfig[level]["desc"]);
        }
    });
}


