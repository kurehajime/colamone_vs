//---------------------------------------------------------------------------
// Transport layer (SkyWay-free)
// - Default: static-safe local mode
// - Optional: WebSocket relay when ?ws=ws(s)://... is provided

let COLAMONE_OFFER = "COLAMONE_OFFER";
let COLAMONE_NO = "COLAMONE_NO";
let COLAMONE_OK = "COLAMONE_OK";
let COLAMONE_LETSGO = "COLAMONE_LETSGO";
let COLAMONE_PLAYING = "COLAMONE_PLAYING";
let COLAMONE_FACE = "COLAMONE_FACE";
let COLAMONE_HELLO = "COLAMONE_HELLO";

let STATUS_NONE = "STATUS_NONE";
let STATUS_OFFER = "STATUS_OFFER";
let STATUS_PLAYING = "STATUS_PLAYING";
let STATUS_RETURN = "STATUS_RETURN";

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

let transport = null;
let localFakePeerId = `local-${Math.random().toString(36).slice(2)}`;

function getWsUrl() {
    let p = getParam();
    if (p.ws) {
        return p.ws;
    }
    return null;
}

function initGame() {
    shuffleBoard();
    winner = null;
    isDraw = false;
    message = "";
}

function startPlayingAsBlue(opponentName) {
    connect_pid = opponentName || "opponent";
    other_player_name = opponentName || "opponent";
    me_player = 1;
    turn_player = 1;
    status = STATUS_PLAYING;
    thinking = false;
    message = "";
    $("#status").text("playing");
    printMes(MES_CONNECT, other_player_name);
    printMes(MES_YOUBLUE);
    updateMessage();
    flush();
    blink();
}

function startPlayingAsRed(opponentName, map, turn) {
    connect_pid = opponentName || "opponent";
    other_player_name = opponentName || "opponent";
    me_player = -1;
    status = STATUS_PLAYING;
    thisMap = map || copyMap(initMap);
    turn_player = (turn || 1) * -1;
    thinking = (turn_player !== me_player);
    message = "";
    $("#status").text("playing");
    printMes(MES_CONNECT, other_player_name);
    printMes(MES_YOURED);
    updateMessage();
    flush();
    blink();
}

function createWebSocketTransport() {
    let ws = null;
    let connected = false;

    return {
        connect: function () {
            return new Promise((resolve, reject) => {
                ws = new WebSocket(getWsUrl());

                ws.onopen = () => {
                    connected = true;
                    ws.send(JSON.stringify({
                        type: "join",
                        name: $("#user_name").val() || "Anonymous player"
                    }));
                    resolve();
                };

                ws.onmessage = (event) => {
                    let msg = null;
                    try {
                        msg = JSON.parse(event.data);
                    } catch (_) {
                        return;
                    }

                    if (msg.type === "matched") {
                        if (msg.role === "blue") {
                            initGame();
                            startPlayingAsBlue(msg.opponentName);
                            send(COLAMONE_LETSGO);
                        } else {
                            status = STATUS_RETURN;
                            $("#status").text("matched");
                        }
                        return;
                    }

                    if (msg.type === "peer-left") {
                        printMes(MES_DISCONNECT);
                        disconnect();
                        return;
                    }

                    if (msg.type === "data") {
                        recv(msg.payload || {}, msg.from || "");
                    }
                };

                ws.onerror = (e) => {
                    reject(e);
                };

                ws.onclose = () => {
                    connected = false;
                    if (status !== STATUS_NONE) {
                        $("#status").text("disconnect");
                    }
                };
            });
        },
        send: function (obj) {
            if (!connected || !ws || ws.readyState !== WebSocket.OPEN) {
                return;
            }
            ws.send(JSON.stringify({ type: "data", payload: obj }));
        },
        close: function () {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
            connected = false;
        }
    };
}

function createLocalTransport() {
    // Local fallback for development when no WS relay is running.
    return {
        connect: function () {
            return new Promise((resolve) => {
                resolve();
            });
        },
        send: function (obj) {
            // emulate round-trip latency
            setTimeout(() => {
                if (obj.message === COLAMONE_LETSGO) {
                    startPlayingAsRed("Local CPU", obj.map, obj.turn);
                    return;
                }
                if (obj.message === COLAMONE_PLAYING) {
                    // just bounce back and swap turn (local fallback behavior)
                    let wk = copyMap(obj.map);
                    recv({
                        pid: "local-opponent",
                        message: COLAMONE_PLAYING,
                        map: wk,
                        turn: obj.turn
                    }, "local-opponent");
                    return;
                }
                if (obj.message === COLAMONE_FACE) {
                    recv({
                        pid: "local-opponent",
                        message: COLAMONE_FACE,
                        face: obj.face
                    }, "local-opponent");
                }
            }, 250);
        },
        close: function () { }
    };
}

function init_peer() {
    inc_disconnect = inc_disconnect_MAX;
    inc_offer = 0;
    connect_pid = "";
    turn_player = null;
    status = STATUS_OFFER;
    initGame();

    if (ObjConnInterval) {
        clearTimeout(ObjConnInterval);
    }
    if (ObjOfferInterval) {
        clearTimeout(ObjOfferInterval);
    }

    $("#initpeer").addClass("btnactive");

    let wsUrl = getWsUrl();
    if (!wsUrl) {
        // Static-safe default: local mode only.
        transport = createLocalTransport();
        transport.connect().then(() => {
            $("#status").text("local");
            printMes2("[local mode] running without relay server.");
            startPlayingAsBlue("Local CPU");
            send(COLAMONE_LETSGO);
        });
        return;
    }

    $("#status").text("connecting...");
    printMes(MES_MATCHING);

    transport = createWebSocketTransport();
    transport.connect().then(() => {
        $("#status").text("waiting...");
    }).catch(() => {
        // Fallback to local mode so the game remains playable.
        transport = createLocalTransport();
        transport.connect().then(() => {
            $("#status").text("local");
            startPlayingAsBlue("Local CPU");
            send(COLAMONE_LETSGO);
            printMes2("[local mode] relay unreachable, switched to local mode.");
        });
    });
}

function disconnect() {
    if (transport) {
        transport.close();
    }
    transport = null;

    $("#status").text("disconnect");
    printMes(MES_DISCONNECT);
    shuffleBoard();

    status = STATUS_NONE;
    connect_pid = "";
    turn_player = null;
    $("body").addClass("body_0");
    $("body").removeClass("body_1");
    $("body").removeClass("body_2");
    $("#initpeer").removeClass("btnactive");
    updateMessage();
    flush();
}

function recv(data, src) {
    switch (status) {
        case STATUS_NONE:
            break;

        case STATUS_OFFER:
            if (data.message === COLAMONE_OK) {
                thisMap = copyMap(initMap);
                shuffleBoard();
                send(COLAMONE_LETSGO);
                connect_pid = data.pid;
                message = "";
                me_player = 1;
                status = STATUS_PLAYING;
                thinking = false;
                send(COLAMONE_NO);
                updateMessage();
                flush();
                other_player_name = data.name;
                $("#status").text("playing");
                printMes(MES_CONNECT, data.name);
                printMes(MES_YOUBLUE);
                blink();
            } else if (data.message === COLAMONE_OFFER) {
                connect_pid = data.pid;
                thisMap = data.map;
                send(COLAMONE_OK);
                status = STATUS_RETURN;
                inc_timeout = inc_timeout_MAX;
            }
            break;

        case STATUS_RETURN:
            if (data.message === COLAMONE_LETSGO) {
                $("#status").text("playing");
                status = STATUS_PLAYING;
                thisMap = data.map;
                turn_player = data.turn * -1;
                message = "";
                me_player = -1;
                updateMessage();
                flush();
                printMes(MES_CONNECT, data.name || "opponent");
                printMes(MES_YOURED);
                blink();
            } else if (data.message === COLAMONE_NO) {
                status = STATUS_OFFER;
            }
            break;

        case STATUS_PLAYING:
            if (data.message === COLAMONE_HELLO) {
                return;
            }
            if (data.message !== COLAMONE_FACE && data.message !== COLAMONE_NO) {
                inc_disconnect = inc_disconnect_MAX;
                $("#status").text("playing");

                thisMap = data.map;
                turn_player = data.turn * -1;

                message = "";
                thinking = false;
                updateMessage();
                flush();
                printMes(MES_YOUTURN);
                blink();
            } else if (data.message === COLAMONE_FACE) {
                switch (data.face) {
                    case 1:
                        printMes2("(´・ω・｀)");
                        break;
                    case 2:
                        printMes2("ヽ(ﾟ∀ﾟ)ﾉ");
                        break;
                    case 3:
                        printMes2("(灬ºωº灬)");
                        break;
                    case 4:
                        printMes2("(´；ω；｀)");
                        break;
                    case 5:
                        printMes2("ヽ(´∀｀)人(´∀｀)ﾉ");
                        break;
                }
            }
            break;
    }
}

function send(message, pram) {
    if (!transport) {
        return;
    }

    let obj = new Object();
    obj.pid = localFakePeerId;
    obj.message = message;
    obj.name = $("#user_name").val();

    if (message === COLAMONE_FACE) {
        obj.face = pram;
    }
    if (message === COLAMONE_PLAYING || message === COLAMONE_LETSGO) {
        obj.map = thisMap;
        obj.turn = turn_player;
    }

    transport.send(obj);
}

function offerALL() {
    turn_player = 1;
    status = STATUS_OFFER;
    send(COLAMONE_OFFER);
}

function printMes(message, param) {
    let date = new Date();
    let yyyymmdd = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
    let mes = message[get_lang()];
    if (param != undefined && mes != undefined) {
        mes = mes.replace("@", param);
    }
    let logmsg = yyyymmdd + ": " + mes + "\n" + $("#logmessage").val();
    $("#logmessage").val(logmsg);
}

function printMes2(message) {
    let date = new Date();
    let yyyymmdd = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
    let logmsg = yyyymmdd + ": " + message + "\n" + $("#logmessage").val();
    $("#logmessage").val(logmsg);
}

function sendface(event) {
    if (status === STATUS_PLAYING) {
        let id = $(event.target).attr("id");
        let faceid = 0;
        switch (id) {
            case "face1":
                faceid = 1;
                printMes2("(´・ω・｀)");
                break;
            case "face2":
                faceid = 2;
                printMes2("ヽ(ﾟ∀ﾟ)ﾉ");
                break;
            case "face3":
                faceid = 3;
                printMes2("(灬ºωº灬)");
                break;
            case "face4":
                faceid = 4;
                printMes2("(´；ω；｀)");
                break;
            case "face5":
                faceid = 5;
                printMes2("ヽ(´∀｀)人(´∀｀)ﾉ");
                break;
        }

        send(COLAMONE_FACE, faceid);
    }
}

function blink() {
    $("#main").css("background-color", "#FFFFFF");
    setTimeout(function () {
        $("#main").css("background-color", "");
    }, 77);
}
