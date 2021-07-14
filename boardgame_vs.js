//"use strict"
let ctx = null;
let isTouch = true;
let canv_board = null;
let canv_board2 = null;
let canv_focus = null;
let canv_pieces = null;
let canv_hover_piece = null;
let canv_overlay = null;
let hover_piece = null;
let cellSize = null;
let turn_player = null;
let blueScore = 0;
let redScore = 0;
let winner = null;
let isDraw = false;
let message = "";
let thinking = true;
let apikey = "";
let COLOR_LINE = "#333333";
let COLOR_PANEL_1 = "#550025";
let COLOR_PANEL_2 = "#003856";
let COLOR_PANEL_3 = "#FFFFFF";
let COLOR_PANEL_4 = "#111111";
let COLOR_PANEL_5 = "#444444";
let COLOR_PANEL_6 = "#888888";

let COLOR_SELECT = "#88FF88";
let COLOR_RED = "#E5004F";
let COLOR_BLUE = "#00A0E9";
let COLOR_WHITE = "#FFFFFF";
let COLOR_GOLD = "#FFFF00";
let PIECES = {
    "1": [1, 1, 1,
        1, 0, 1,
        1, 1, 1],
    "2": [1, 1, 1,
        1, 0, 1,
        1, 0, 1],
    "3": [1, 1, 1,
        0, 0, 0,
        1, 1, 1],
    "4": [1, 1, 1,
        0, 0, 0,
        1, 0, 1],
    "5": [1, 0, 1,
        0, 0, 0,
        1, 0, 1],
    "6": [1, 0, 1,
        0, 0, 0,
        0, 1, 0],
    "7": [0, 1, 0,
        0, 0, 0,
        0, 1, 0],
    "8": [0, 1, 0,
        0, 0, 0,
        0, 0, 0],
    "-1": [1, 1, 1,
        1, 0, 1,
        1, 1, 1],
    "-2": [1, 0, 1,
        1, 0, 1,
        1, 1, 1],
    "-3": [1, 1, 1,
        0, 0, 0,
        1, 1, 1],
    "-4": [1, 0, 1,
        0, 0, 0,
        1, 1, 1],
    "-5": [1, 0, 1,
        0, 0, 0,
        1, 0, 1],
    "-6": [0, 1, 0,
        0, 0, 0,
        1, 0, 1],
    "-7": [0, 1, 0,
        0, 0, 0,
        0, 1, 0],
    "-8": [0, 0, 0,
        0, 0, 0,
        0, 1, 0]
}
let zeroMap = {
    0: -1, 10: -2, 20: -3, 30: -4, 40: -5, 50: -6,
    1: 0, 11: -8, 21: 0, 31: 0, 41: -7, 51: 0,
    2: 0, 12: 0, 22: 0, 32: 0, 42: 0, 52: 0,
    3: 0, 13: 0, 23: 0, 33: 0, 43: 0, 53: 0,
    4: 0, 14: 7, 24: 0, 34: 0, 44: 8, 54: 0,
    5: 6, 15: 5, 25: 4, 35: 3, 45: 2, 55: 1,
}
let thisMap = {
    0: -1, 10: -2, 20: -3, 30: -4, 40: -5, 50: -6,
    1: 0, 11: -8, 21: 0, 31: 0, 41: -7, 51: 0,
    2: 0, 12: 0, 22: 0, 32: 0, 42: 0, 52: 0,
    3: 0, 13: 0, 23: 0, 33: 0, 43: 0, 53: 0,
    4: 0, 14: 7, 24: 0, 34: 0, 44: 8, 54: 0,
    5: 6, 15: 5, 25: 4, 35: 3, 45: 2, 55: 1,
}
let initMap = copyMap(thisMap);
let mouse_x = 0;
let mouse_y = 0;
let startMap;


//init
$(function () {
    //初期化
    ctx = $("#canv")[0].getContext('2d');

    canv_board = document.createElement("canvas");
    canv_board.width = ctx.canvas.width;
    canv_board.height = ctx.canvas.height;

    canv_board2 = document.createElement("canvas");
    canv_board2.width = ctx.canvas.width;
    canv_board2.height = ctx.canvas.height;


    canv_focus = document.createElement("canvas");
    canv_focus.width = ctx.canvas.width;
    canv_focus.height = ctx.canvas.height;

    canv_pieces = document.createElement("canvas");
    canv_pieces.width = ctx.canvas.width;
    canv_pieces.height = ctx.canvas.height;

    canv_hover_piece = document.createElement("canvas");
    canv_hover_piece.width = ctx.canvas.width;
    canv_hover_piece.height = ctx.canvas.height;

    canv_overlay = document.createElement("canvas");
    canv_overlay.width = ctx.canvas.width;
    canv_overlay.height = ctx.canvas.height;


    cellSize = ctx.canvas.width / 6;
    turn_player = 1;

    if ('ontouchstart' in window) {
        isTouch = true;
    } else {
        isTouch = false;
    }
    //イベントを設定
    if (isTouch) {
        $("#canv").bind('touchstart', ev_mouseClick)
    } else {
        $("#canv").bind('mousemove ', ev_mouseMove)
        $("#canv").bind('mouseup', ev_mouseClick);
    }
    $("#disconnect").bind('click', disconnect);
    $("#initpeer").bind('click', init_peer);
    $("#face1").bind('click', sendface);
    $("#face2").bind('click', sendface);
    $("#face3").bind('click', sendface);
    $("#face4").bind('click', sendface);
    $("#face5").bind('click', sendface);
    $("#user_name").bind('keypress', ev_delMultiByte);


    $(window).unload(disconnect);
    shuffleBoard();



    //パラメータを取得
    let paramObj = getParam();
    //盤面を初期化
    if (paramObj["init"]) {
        startMap = getMapByParam(paramObj["init"]);
        thisMap = copyMap(startMap);
    } else {
        startMap = copyMap(thisMap);
    }

    printMes(MES_INIT);
    //描画
    flush();
    updateMessage();
});

function ev_delMultiByte() {
    let str = $("#user_name").val();
    for (let i = 0, len = str.lenght; i < len; i++) {
        let code = table[str.charCodeAt(i)];
        if (!(code <= 256 || !code)) {
            $("#user_name").val("Anonymous Player");
            return;
        };
    }
    return;
}

//マウス移動時処理
function ev_mouseMove(e) {
    getMousePosition(e);
    flush();
}
//マウスクリック時処理
function ev_mouseClick(e) {
    getMousePosition(e);
    let target = Math.floor(mouse_x / cellSize) * 10
        + Math.floor(mouse_y / cellSize)
    if (thinking == true) {
        return true;
    }

    if (winner != null) {
        disconnect();
        return true;
    }
    if (hover_piece == null) {
        if (thisMap[target] * turn_player > 0) {
            hover_piece = target;
        }
    } else {
        if (target == hover_piece) {
            hover_piece = null;
            updateMessage();
            flush();
            return;
        }
        let canm = getCanMovePanel(hover_piece);
        if (canm.indexOf(target) >= 0) {
            thisMap[target] = thisMap[hover_piece];
            thisMap[hover_piece] = 0;
            //turn_player=turn_player*-1;
            hover_piece = null;

            //AIが考える。
            drawFocus();
            message = "thinking..."
            thinking = true;
            flush();
            updateMessage();
            inc_disconnect = inc_disconnect_MAX;
            printMes(MES_OTHERTURN);
            send(COLAMONE_PLAYING);
        }
    }
    drawFocus();
    //    updateMessage();
    flush();
}


//盤面をシャッフル
function shuffleBoard() {
    thisMap = copyMap(zeroMap);
    //クリア
    for (let num in thisMap) {
        thisMap[num] = 0;
    }
    let arr = [1, 2, 3, 4, 5, 6, 7, 8];
    let red_num = [0, 10, 20, 30, 40, 50, 11, 41];
    let blue_num = [55, 45, 35, 25, 15, 5, 44, 14];
    for (let i = 0; i <= 666; i++) {
        arr.sort(function () {
            return Math.random() - Math.random();
        });
    }

    for (let num in blue_num) {
        thisMap[blue_num[num]] = arr[num];
    }
    for (let num in red_num) {
        thisMap[red_num[num]] = -1 * arr[num];
    }
}


// マウス位置取得  
function getMousePosition(e) {
    if (!e.clientX) {//SmartPhone
        if (e.touches) {
            e = e.originalEvent.touches[0];
        } else if (e.originalEvent.touches) {
            e = e.originalEvent.touches[0];
        } else {
            e = event.touches[0];
        }
    }
    let rect = e.target.getBoundingClientRect();
    mouse_x = e.clientX - rect.left;
    mouse_y = e.clientY - rect.top;
}
//画面描画
function flush() {
    let wkMap = $.extend(true, {}, thisMap)
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.width);

    //盤面を描画
    ctx.drawImage(drawBoard(), 0, 0, ctx.canvas.width, ctx.canvas.height);

    //テカリを描画
    ctx.drawImage(drawBoard2(), 0, 0, ctx.canvas.width, ctx.canvas.height);

    //選択したコマを除外
    if (hover_piece != null) {
        wkMap[hover_piece] = 0;
    }
    //コマを表示
    ctx.drawImage(drawPieceAll(wkMap), 0, 0, ctx.canvas.width, ctx.canvas.height);

    //選択したコマを表示
    ctx.drawImage(drawHoverPiece(), 0, 0, ctx.canvas.width, ctx.canvas.height);

    //フォーカスを描画
    ctx.drawImage(drawFocus(), 0, 0, ctx.canvas.width, ctx.canvas.height);

    //メッセージを描画
    ctx.drawImage(drawOverlay(), 0, 0, ctx.canvas.width, ctx.canvas.height);

    if (status == STATUS_PLAYING) {
        if (turn_player == 1) {
            $("body").removeClass("body_0");
            $("body").addClass("body_1");
            $("body").removeClass("body_2");
        } else if (turn_player == -1) {
            $("body").removeClass("body_0");
            $("body").removeClass("body_1");
            $("body").addClass("body_2");
        }
    } else {
        $("body").addClass("body_0");
        $("body").removeClass("body_1");
        $("body").removeClass("body_2");
    }
}
//フォーカスを描画
function drawFocus() {
    //選択マスを強調
    let x = mouse_x - (mouse_x % cellSize);
    let y = mouse_y - (mouse_y % cellSize);
    let ctx_focus = canv_focus.getContext('2d');
    ctx_focus.clearRect(0, 0, ctx.canvas.width, ctx.canvas.width);
    ctx_focus.globalAlpha = 0.5;
    ctx_focus.fillStyle = COLOR_SELECT;
    ctx_focus.lineWidth = 1;
    ctx_focus.beginPath();
    ctx_focus.fillRect(x, y, cellSize, cellSize);

    if (isTouch == true && hover_piece == null) {
        return canv_focus;
    }

    //移動可能マスを強調
    let target = (x / cellSize) * 10 + (y / cellSize);
    if (thisMap[target] * turn_player > 0) {
        let canm = getCanMovePanel(target)
        for (let i = 0; i <= canm.length - 1; i++) {
            x = Math.floor(canm[i] / 10);
            y = Math.floor(canm[i] % 10);
            ctx_focus.strokeStyle = COLOR_SELECT;
            ctx_focus.lineWidth = 5;
            ctx_focus.beginPath();
            ctx_focus.arc(x * cellSize + (cellSize / 2), y * cellSize + (cellSize / 2)
                , (cellSize / 2) - 10, 0, Math.PI * 2, false);
            ctx_focus.stroke();
        }
    }
    return canv_focus;
}



//盤面を描画してCANVASオブジェクトを返す。
function drawBoard() {
    let ctx_board = canv_board.getContext('2d');
    ctx_board.clearRect(0, 0, ctx.canvas.width, ctx.canvas.width);

    let grad = ctx_board.createLinearGradient(0, 0, ctx.canvas.width, ctx.canvas.width);
    grad.addColorStop(0, COLOR_PANEL_6);
    grad.addColorStop(0.3, COLOR_PANEL_5);
    grad.addColorStop(1, COLOR_PANEL_4);


    for (let x = 0; x < 6; x++) {
        for (let y = 0; y < 6; y++) {
            //パネル描画
            ctx_board.strokeStyle = COLOR_LINE;
            if (y == 0) {
                ctx_board.fillStyle = COLOR_PANEL_1;
            } else if (y == 5) {
                ctx_board.fillStyle = COLOR_PANEL_2;
            } else if ((x + y) % 2 == 0) {
                ctx_board.fillStyle = COLOR_PANEL_3;
            } else {
                ctx_board.fillStyle = COLOR_PANEL_4;
                ctx_board.fillStyle = grad
            }
            ctx_board.beginPath();
            ctx_board.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            ctx_board.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }

    return canv_board;
}
function drawBoard2() {
    let ctx_board2 = canv_board2.getContext('2d');
    ctx_board2.clearRect(0, 0, ctx.canvas.width, ctx.canvas.width);
    ctx_board2.globalAlpha = 0.07;
    ctx_board2.fillStyle = COLOR_WHITE;
    ctx_board2.beginPath();
    ctx_board2.arc(cellSize * 1, -3 * cellSize, 7 * cellSize, 0, Math.PI * 2, false);
    ctx_board2.fill();

    return canv_board2;
}
//浮遊しているコマを描画する。
function drawHoverPiece() {
    let ctx_hover = canv_hover_piece.getContext('2d');
    ctx_hover.clearRect(0, 0, ctx.canvas.width, ctx.canvas.width);
    let x = mouse_x - (cellSize / 2)
    let y = mouse_y - (cellSize / 2)
    if (hover_piece != null) {
        drawPiece(ctx_hover, x, y, thisMap[hover_piece]
            , false)
    }
    return canv_hover_piece;
}
//コマを描画する。
function drawPiece(wkCtx, x, y, number, goal) {
    let wkColor;

    //外枠を描画
    if (number == 0) {
        return wkCtx;
    } else if (number > 0) {
        wkColor = COLOR_BLUE;
    } else {
        wkColor = COLOR_RED;
    }
    //wkCtx.fillStyle = wkColor;
    let grad = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
    grad.addColorStop(0, 'rgb(255, 255, 255)');
    grad.addColorStop(0.4, wkColor);
    grad.addColorStop(1, wkColor);
    wkCtx.fillStyle = grad;


    wkCtx.beginPath();
    wkCtx.fillRect(x + cellSize / 10, y + cellSize / 10, cellSize - 1 * cellSize / 5, cellSize - 1 * cellSize / 5);

    //文字を描画。
    if (goal) {
        wkCtx.fillStyle = COLOR_GOLD;
    } else {
        wkCtx.fillStyle = COLOR_WHITE;
    };



    let fontsize = Math.round(cellSize * 0.18);
    wkCtx.textBaseline = "middle";
    wkCtx.textAlign = "center";
    wkCtx.font = fontsize + "pt Arial";
    wkCtx.beginPath();

    //数字を印字
    wkCtx.fillText(Math.abs(number), x + (cellSize / 2), y + (cellSize / 2));


    //点を描画
    for (let i = 0; i <= PIECES[number].length - 1; i++) {
        if (PIECES[number][i] == 0) {
            continue;
        }
        let x_dot = x + cellSize / 4.16 + (Math.floor(cellSize - 1 * cellSize / 5) / 3) * Math.floor(i % 3.0);
        let y_dot = y + cellSize / 4.16 + (Math.floor(cellSize - 1 * cellSize / 5) / 3) * Math.floor(i / 3.0);

        if (goal) {
            wkCtx.fillStyle = COLOR_GOLD;
        } else {
            wkCtx.fillStyle = COLOR_WHITE;
        }
        wkCtx.beginPath();
        wkCtx.arc(x_dot, y_dot, cellSize * 0.06, 0, Math.PI * 2, false);
        wkCtx.fill();
    }


    return wkCtx;

}
//コマをすべて描画
function drawPieceAll(wkMap) {
    let ctx_pieces = canv_pieces.getContext('2d');
    ctx_pieces.clearRect(0, 0, ctx.canvas.width, ctx.canvas.width);
    for (let x = 0; x < 6; x++) {
        for (let y = 0; y < 6; y++) {
            if (wkMap[x * 10 + y] != 0) {
                let goal = false;
                if (y * cellSize, wkMap[x * 10 + y] > 0 & y == 0) {
                    goal = true;
                } else if (y * cellSize, wkMap[x * 10 + y] < 0 & y == 5) {
                    goal = true;
                }
                ctx_pieces = drawPiece(ctx_pieces, x * cellSize
                    , y * cellSize, wkMap[x * 10 + y], goal);
            }
        }
    }
    return canv_pieces;
}

//メッセージを描画
function drawOverlay() {
    let ctx_overlay = canv_overlay.getContext('2d');
    let x = cellSize * 1.5
    let y = cellSize * 2.5

    ctx_overlay.clearRect(0, 0, ctx.canvas.width, ctx.canvas.width);

    if (message == "") {
        return canv_overlay;
    }
    ctx_overlay.globalAlpha = 0.8;
    ctx_overlay.fillStyle = COLOR_WHITE;
    ctx_overlay.beginPath();
    ctx_overlay.fillRect(x, y, cellSize * 3, cellSize * 1);
    ctx_overlay.fill();

    let fontsize = Math.round(cellSize * 0.36);
    ctx_overlay.font = "bold " + fontsize + "px sans-serif";
    ctx_overlay.globalAlpha = 1;
    ctx_overlay.fillStyle = COLOR_LINE;
    ctx_overlay.textBaseline = "middle";
    ctx_overlay.textAlign = "center";
    ctx_overlay.beginPath();
    ctx_overlay.fillText(message, cellSize * 3, cellSize * 3);

    return canv_overlay;
}


//動かせるマスを返す。Return:[NN,NN,NN]
function getCanMovePanel(panel_num) {
    let number = thisMap[panel_num];
    let x = Math.floor(panel_num / 10);
    let y = Math.floor(panel_num % 10);
    let canMove = new Array;
    if (number == 0) {
        return canMove;
    }
    //アガリのコマは動かしたらダメ。
    if (number > 0 & y == 0) {
        return canMove;
    } else if (number < 0 & y == 5) {
        return canMove;
    }

    for (let i = 0; i <= PIECES[number].length - 1; i++) {
        let target_x = x + Math.floor(i % 3) - 1;
        let target_y = y + Math.floor(i / 3) - 1;

        if (PIECES[number][i] == 0) {
            continue;
        }
        if (target_x < 0 || target_y < 0 | target_x > 5 | target_y > 5) {
            continue;
        }
        let target_number = thisMap[target_x * 10 + target_y];
        if (target_number * number > 0) {
            continue;
        }
        //アガリのコマはとったらダメ。
        if (target_number > 0 & target_y == 0) {
            continue;
        } else if (target_number < 0 & target_y == 5) {
            continue;
        }
        canMove.push(target_x * 10 + target_y);

    }
    return canMove;
}

function updateMessage() {
    calcScore();
    if (turn_player > 0) {
        $("#turn")[0].innerHTML = "Blue";
        $("#turn")[0].style.color = COLOR_BLUE;
    } else if (turn_player < 0) {
        $("#turn")[0].innerHTML = "Red";
        $("#turn")[0].style.color = COLOR_RED;
    } else {
        $("#turn")[0].innerHTML = "";
    }
    $("#blue")[0].innerHTML = blueScore;
    $("#red")[0].innerHTML = redScore;
    //$("#score")[0].innerHTML=score;

    if (winner == me_player) {
        message = "You Win!"
        endgame();
        printMes(MES_YOUWIN);
    } else if (winner == -1 * me_player) {
        message = "You Lose..."
        endgame();
        printMes(MES_YOULOSE);
    } else if (winner == 0) {
        message = "-- Draw --"
        endgame();
    }

}
function endgame() {

}

function calcScore() {
    let sum1 = 0;
    let sum2 = 0;
    let GoalTop = [0, 10, 20, 30, 40, 50];
    let GoalBottom = [5, 15, 25, 35, 45, 55];
    //点数勝利        
    for (let i in GoalTop) {
        if (thisMap[GoalTop[i]] * 1 > 0) {
            sum1 += thisMap[GoalTop[i]];
        }
    }
    for (let i in GoalBottom) {
        if (thisMap[GoalBottom[i]] * -1 > 0) {
            sum2 += thisMap[GoalBottom[i]];
        }
    }
    if (sum1 >= 8) {
        winner = 1;
        thinking = false;
    } else if (sum2 <= -8) {
        winner = -1;
        thinking = false;
    }

    //手詰まりは判定
    if (isNoneNode(thisMap)) {
        if (Math.abs(sum1) > Math.abs(sum2)) {
            winner = 1;
            thinking = false;
        } else if (Math.abs(sum1) < Math.abs(sum2)) {//引き分けは後攻勝利
            winner = -1;
            thinking = false;
        } else if (Math.abs(sum1) == Math.abs(sum2)) {
            winner = 0;
            thinking = false;
        }
    }
    blueScore = Math.abs(sum1);
    redScore = Math.abs(sum2);
}
function isEnd(wkMap) {

}
//手詰まり判定
function isNoneNode(wkMap) {
    let flag1 = false;
    let flag2 = false;
    for (let panel_num in wkMap) {
        if (wkMap[panel_num] == 0) {
            continue;
        }
        let canMove = getCanMovePanelX(panel_num, wkMap, false);
        if (canMove.length != 0) {
            if (wkMap[panel_num] > 0) {
                flag1 = true;
            } else if (wkMap[panel_num] < 0) {
                flag2 = true;
            }
        }
        if (flag1 && flag2) {
            return false;
        }
    }
    return true;
}

//パラメータ取得
function getParam() {
    let obj = new Object();
    if (1 < document.location.search.length) {
        let paramstr = document.location.search.substring(1).split('&');
        for (let i = 0; i < paramstr.length; i++) {
            let entry = paramstr[i].split('=');
            let key = decodeURIComponent(entry[0]);
            let value = decodeURIComponent(entry[1]);
            obj[key] = decodeURIComponent(value);
        }
    }
    return obj;
}
function getMapByParam(initString) {
    if (initString) {
        let wkMap = copyMap(thisMap);
        //クリア
        for (let num in wkMap) {
            wkMap[num] = 0;
        }
        let arr = initString.split(',');
        if (arr.length < 8) {
            arr = [1, 2, 3, 4, 5, 6, 7, 8];
        }
        let red_num = [0, 10, 20, 30, 40, 50, 11, 41];
        let blue_num = [55, 45, 35, 25, 15, 5, 44, 14];


        for (let num in blue_num) {
            wkMap[blue_num[num]] = parseInt(arr[num]);
        }
        for (let num in red_num) {
            wkMap[red_num[num]] = -1 * parseInt(arr[num]);
        }
    }

    return wkMap;
}
function copyMap(wkMap) {
    let rtnMap = new Object();
    //不格好だがループするより高速。
    rtnMap[0] = wkMap[0];
    rtnMap[10] = wkMap[10];
    rtnMap[20] = wkMap[20];
    rtnMap[30] = wkMap[30];
    rtnMap[40] = wkMap[40];
    rtnMap[50] = wkMap[50];
    rtnMap[1] = wkMap[1];
    rtnMap[11] = wkMap[11];
    rtnMap[21] = wkMap[21];
    rtnMap[31] = wkMap[31];
    rtnMap[41] = wkMap[41];
    rtnMap[51] = wkMap[51];
    rtnMap[2] = wkMap[2];
    rtnMap[12] = wkMap[12];
    rtnMap[22] = wkMap[22];
    rtnMap[32] = wkMap[32];
    rtnMap[42] = wkMap[42];
    rtnMap[52] = wkMap[52];
    rtnMap[3] = wkMap[3];
    rtnMap[13] = wkMap[13];
    rtnMap[23] = wkMap[23];
    rtnMap[33] = wkMap[33];
    rtnMap[43] = wkMap[43];
    rtnMap[53] = wkMap[53];
    rtnMap[4] = wkMap[4];
    rtnMap[14] = wkMap[14];
    rtnMap[24] = wkMap[24];
    rtnMap[34] = wkMap[34];
    rtnMap[44] = wkMap[44];
    rtnMap[54] = wkMap[54];
    rtnMap[5] = wkMap[5];
    rtnMap[15] = wkMap[15];
    rtnMap[25] = wkMap[25];
    rtnMap[35] = wkMap[35];
    rtnMap[45] = wkMap[45];
    rtnMap[55] = wkMap[55];
    return rtnMap;
}
//動かせるマスを返す。Return:[NN,NN,NN...]
function getCanMovePanelX(panel_num, wkMap) {
    let number = wkMap[panel_num];
    let x = Math.floor(panel_num / 10);
    let y = Math.floor(panel_num % 10);
    let canMove = new Array;
    if (number === 0) {
        return canMove;
    }
    //アガリのコマは動かしたらダメ。
    if (number > 0 && y === 0) {
        return canMove;
    } else if (number < 0 && y === 5) {
        return canMove;
    }
    for (let i = 0; i < PIECES[number].length; i++) {
        if (PIECES[number][i] === 0) {
            continue;
        }
        let target_x = x + Math.floor(i % 3) - 1;
        let target_y = y + Math.floor(i / 3) - 1;
        if (target_y < 0 || target_y > 5 || target_x > 5 || target_x < 0) {
            continue;
        }
        let idx = target_x * 10 + target_y;
        let target_number = wkMap[idx];

        //自コマとアガリのコマはとったらダメ。
        if ((target_number * number > 0) || (target_number > 0 && target_y === 0) || (target_number < 0 && target_y === 5)) {
            continue;
        }
        canMove.push(idx);
    }
    return canMove;
}
