//---------------------------------------------------------------------------
/*
A「Bさん、Cさん、Dさん、一緒に遊ばない？」
B「」
C「はい、プレイしましょう」
D「はい、プレイしましょう」
A「Dさん、お前とは嫌だ。」
A「Cさん、じゃあ始めよう。」
*/
let COLAMONE_OFFER = "COLAMONE_OFFER";//一緒に遊ばない？
let COLAMONE_NO = "COLAMONE_NO";//やだ。(他の人とプレイ中…など)
let COLAMONE_OK = "COLAMONE_OK";//はい、プレイしましょう。
let COLAMONE_LETSGO = "COLAMONE_LETSGO";//じゃあ始めよう。
let COLAMONE_PLAYING = "COLAMONE_PLAYING";//プレイ中
let COLAMONE_FACE = "COLAMONE_FACE";//顔文字
let COLAMONE_HELLO = "COLAMONE_HELLO";//ただ呼んでみただけ。

let STATUS_NONE = "STATUS_NONE"//無心
let STATUS_OFFER = "STATUS_OFFER"//今こっちから誘ってる最中。
let STATUS_PLAYING = "STATUS_PLAYING"//今遊んでる最中。誘いには乗りません。
let STATUS_RETURN = "STATUS_RETURN"//今返答して再回答を待ってる最中。誘いには乗りません。

let MES_INIT = { "en": "Please join by pressing the Connect button.", "ja": "接続ボタンを押してください。↑" };
let MES_DISCONNECT = { "en": "Disconnected.", "ja": "切断しました。" };
let MES_MATCHING = { "en": "Searching player.", "ja": "対戦相手を探しています。" };
let MES_CONNECT = { "en": "Game with @ begins.", "ja": "@との対局を始めます。" };
let MES_YOUBLUE = { "en": "You are Blue.", "ja": "あなたは青です。" };
let MES_YOURED = { "en": "You are Red.", "ja": "あなたは赤です。" };
let MES_YOUWIN = { "en": "You win.", "ja": "あなたの勝ちです。" };
let MES_YOULOSE = { "en": "You lose.", "ja": "あなたの負けです。" };
let MES_YOUTURN = { "en": "It's your turn.", "ja": "あなたのターンです。" };
let MES_OTHERTURN = { "en": "It's @ turn.", "ja": "相手のターンです。" };
let MES_PLAYER_COUNT = { "en": "Players:@", "ja": "現在の参加者:@" };


let status = STATUS_NONE;
let connect_pid = "";
let inc_disconnect_MAX = 300;
let inc_disconnect = 300;
let inc_timeout_MAX = 6;
let inc_timeout = 6;
let inc_offer = 0;
let ObjConnInterval;
let ObjOfferInterval;
let other_player_name;
let me_player = 1;
let play_conn;
let room;
let peer;
//init
$(function () {
    //初期化
    peer = new Peer({
        key: "12c750c6-e688-43ed-9786-cf68767d6e96",
        debug: 3,
    });
});

//接続
function init_peer() {
    inc_disconnect = inc_disconnect_MAX;
    status = STATUS_OFFER;
    room = peer.joinRoom("ROOM_ID", {
        mode: "mesh"
    });

    room.once('open', () => {
        $('#status').text("Connect...");
    });

    peer.on('error', function (e) {
        console.log(e.message);
    });

    room.on('data', ({ data, src }) => {
        recv(data, src)
    });

    inc_offer = 0;
    connect_pid = "";
    turn_player = null;
    initGame();
    if (ObjConnInterval) {
        clearTimeout(ObjConnInterval);
    }
    if (ObjOfferInterval) {
        clearTimeout(ObjOfferInterval);
    }
    ObjOfferInterval = setInterval(offerloop, 1000 + Math.round(Math.random() * 500));
    printMes(MES_MATCHING);
    $("#initpeer").addClass("btnactive");

}
function initGame() {
    shuffleBoard();
    winner = null;
    isDraw = false;
    message = "";
}
//定期的に対戦相手を探す。
function offerloop() {
    if (peer && !peer.disconnected) {
        inc_offer = inc_offer + 1;
        if (status == STATUS_OFFER) {
            if (inc_offer % 5 == 0) {
                $('#status').text("sending...");
                offerALL();
            } else {
                $('#status').text("waiting...");
            }
        }
        if (status == STATUS_RETURN) {
            inc_timeout = inc_timeout - 1;
            if (inc_timeout < 0) {
                status = STATUS_OFFER;
            }
        }
        //対戦相手が見つかったら中止。
        if (status == STATUS_PLAYING || status == STATUS_NONE) {
            clearTimeout(ObjOfferInterval);
        }
    } else {
        clearTimeout(ObjOfferInterval);
    }
}
//切断
function disconnect() {
    if (peer) {
        if (!peer.disconnected) {
            room.close();
            $('#status').text("disconnect");
            printMes(MES_DISCONNECT);
            shuffleBoard();
        }
    }
    status = STATUS_NONE;
    connect_pid = "";
    turn_player = null;
    $("body").addClass("body_0");
    $("body").removeClass("body_1");
    $("body").removeClass("body_2");
    $("#initpeer").removeClass("btnactive");
}
//受信
function recv(data, src) {
    switch (status) {
        case STATUS_NONE://なにもなし
            //無視
            break;
        case STATUS_OFFER://招待中
            if (data.message == COLAMONE_OK) {
                thisMap = copyMap(initMap);
                shuffleBoard();
                send(COLAMONE_LETSGO);//プレイ開始
                connect_pid = data.pid;
                message = ""
                me_player = 1;
                status = STATUS_PLAYING;
                thinking = false;
                send(COLAMONE_NO);
                updateMessage();
                flush();
                other_player_name = data.name;
                $('#status').text("playing");
                printMes(MES_CONNECT, data.name);
                printMes(MES_YOUBLUE);
                blink();
            } else if (data.message == COLAMONE_OFFER) {
                connect_pid = data.pid;
                thisMap = data.map;
                send(COLAMONE_OK);//いいよ。
                status = STATUS_RETURN;
                inc_timeout = inc_timeout_MAX;
            } else {
                //無視
            }

            break;

        case STATUS_RETURN://お返事中
            if (data.pid == connect_pid && data.message == COLAMONE_LETSGO) {
                $('#status').text("playing");
                status = STATUS_PLAYING;
                thisMap = data.map;
                turn_player = data.turn * -1;
                message = ""
                me_player = -1;
                updateMessage();
                flush();
                printMes(MES_CONNECT, data.name);
                printMes(MES_YOURED);
                blink();
            } else if (data.pid == connect_pid && data.message == COLAMONE_NO) {
                status = STATUS_OFFER;//待ち状態に戻る。
            } else {
                //無視。   
            }
            break;
        case STATUS_PLAYING://遊んでる
            if (data.message == COLAMONE_HELLO) {
                return;
            }
            if (data.pid == connect_pid && data.message != COLAMONE_FACE && data.message != COLAMONE_NO) {
                inc_disconnect = inc_disconnect_MAX;
                $('#status').text("playing");

                thisMap = data.map;
                turn_player = data.turn * -1;

                message = ""
                thinking = false;
                updateMessage();
                flush();
                printMes(MES_YOUTURN);
                blink();
                break;
            } else if (data.pid == connect_pid && data.message == COLAMONE_FACE) {
                switch (data.face) {
                    case 1:
                        printMes2("(´・ω・｀)")
                        break;
                    case 2:
                        printMes2("ヽ(ﾟ∀ﾟ)ﾉ")
                        break;
                    case 3:
                        printMes2("(灬ºωº灬)")
                        break;
                    case 4:
                        printMes2("(´；ω；｀)")
                        break;
                    case 5:
                        printMes2("ヽ(´∀｀)人(´∀｀)ﾉ")
                        break;
                }
            }
    }
}
let connections = new Object();
//送信
function send(message, pram) {
    let obj = new Object();
    obj.pid = peer.id;
    obj.message = message;
    obj.name = $("#user_name").val();
    if (message == COLAMONE_FACE) {
        obj.face = pram;
    }
    if (message == COLAMONE_PLAYING || message == COLAMONE_LETSGO) {
        obj.map = thisMap;
        obj.turn = turn_player;
    }
    // メッセージを送信
    room.send(obj);
}
//みんなを誘う。
function offerALL() {
    turn_player = 1;
    status = STATUS_OFFER;
    send(COLAMONE_OFFER);
}
//メッセージを表示
function printMes(message, param) {
    let date = new Date();
    let yyyymmdd = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
    let mes = message[get_lang()];
    if (param != undefined && mes != undefined) {
        mes = mes.replace("@", param);
    }
    let logmsg = yyyymmdd + ": " + mes + "\n" + $('#logmessage').val();
    $('#logmessage').val(logmsg);
}
//メッセージを表示
function printMes2(message) {
    let date = new Date();
    let yyyymmdd = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
    let logmsg = yyyymmdd + ": " + message + "\n" + $('#logmessage').val();
    $('#logmessage').val(logmsg);
}
//顔文字を送る。
function sendface(event) {
    if (status == STATUS_PLAYING) {
        let id = $(event.target).attr('id');
        let faceid = 0;
        switch (id) {
            case "face1":
                faceid = 1;
                printMes2("(´・ω・｀)")
                break;
            case "face2":
                faceid = 2;
                printMes2("ヽ(ﾟ∀ﾟ)ﾉ")
                break;
            case "face3":
                faceid = 3;
                printMes2("(灬ºωº灬)")
                break;
            case "face4":
                faceid = 4;
                printMes2("(´；ω；｀)")
                break;
            case "face5":
                faceid = 5;
                printMes2("ヽ(´∀｀)人(´∀｀)ﾉ")
                break;
        }

        send(COLAMONE_FACE, faceid);
    }
}
function blink() {
    $("#main").css("background-color", "#FFFFFF");
    setTimeout(function () {
        $("#main").css("background-color", "");
    }, 77)
}