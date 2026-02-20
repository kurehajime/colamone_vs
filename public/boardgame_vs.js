//"use strict"
let isTouch = true;
let hover_piece = null;
let cellSize = 500 / 6;
let turn_player = null;
let blueScore = 0;
let redScore = 0;
let winner = null;
let isDraw = false;
let message = "";
let thinking = true;
let apikey = "";
let COLOR_RED = "#E5004F";
let COLOR_BLUE = "#00A0E9";
let PIECES = {
    "1": [1, 1, 1, 1, 0, 1, 1, 1, 1],
    "2": [1, 1, 1, 1, 0, 1, 1, 0, 1],
    "3": [1, 1, 1, 0, 0, 0, 1, 1, 1],
    "4": [1, 1, 1, 0, 0, 0, 1, 0, 1],
    "5": [1, 0, 1, 0, 0, 0, 1, 0, 1],
    "6": [1, 0, 1, 0, 0, 0, 0, 1, 0],
    "7": [0, 1, 0, 0, 0, 0, 0, 1, 0],
    "8": [0, 1, 0, 0, 0, 0, 0, 0, 0],
    "-1": [1, 1, 1, 1, 0, 1, 1, 1, 1],
    "-2": [1, 0, 1, 1, 0, 1, 1, 1, 1],
    "-3": [1, 1, 1, 0, 0, 0, 1, 1, 1],
    "-4": [1, 0, 1, 0, 0, 0, 1, 1, 1],
    "-5": [1, 0, 1, 0, 0, 0, 1, 0, 1],
    "-6": [0, 1, 0, 0, 0, 0, 1, 0, 1],
    "-7": [0, 1, 0, 0, 0, 0, 0, 1, 0],
    "-8": [0, 0, 0, 0, 0, 0, 0, 1, 0]
};
let zeroMap = {
    0: -1, 10: -2, 20: -3, 30: -4, 40: -5, 50: -6,
    1: 0, 11: -8, 21: 0, 31: 0, 41: -7, 51: 0,
    2: 0, 12: 0, 22: 0, 32: 0, 42: 0, 52: 0,
    3: 0, 13: 0, 23: 0, 33: 0, 43: 0, 53: 0,
    4: 0, 14: 7, 24: 0, 34: 0, 44: 8, 54: 0,
    5: 6, 15: 5, 25: 4, 35: 3, 45: 2, 55: 1,
};
let thisMap = {
    0: -1, 10: -2, 20: -3, 30: -4, 40: -5, 50: -6,
    1: 0, 11: -8, 21: 0, 31: 0, 41: -7, 51: 0,
    2: 0, 12: 0, 22: 0, 32: 0, 42: 0, 52: 0,
    3: 0, 13: 0, 23: 0, 33: 0, 43: 0, 53: 0,
    4: 0, 14: 7, 24: 0, 34: 0, 44: 8, 54: 0,
    5: 6, 15: 5, 25: 4, 35: 3, 45: 2, 55: 1,
};
let initMap = copyMap(thisMap);
let mouse_x = 0;
let mouse_y = 0;
let startMap;

$(function () {
    turn_player = 1;
    let $board = $("#canv");

    if ('ontouchstart' in window) {
        isTouch = true;
    } else {
        isTouch = false;
    }
    if (isTouch) {
        $board.on('touchstart', ev_mouseClick);
        $board.on('touchmove', ev_mouseMove);
    } else {
        $board.on('mousemove', ev_mouseMove);
        $board.on('mouseup', ev_mouseClick);
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

    let paramObj = getParam();
    if (paramObj["init"]) {
        startMap = getMapByParam(paramObj["init"]);
        thisMap = copyMap(startMap);
    } else {
        startMap = copyMap(thisMap);
    }

    printMes(MES_INIT);
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
        }
    }
}

function ev_mouseMove(e) {
    getMousePosition(e);
    flush();
}

function ev_mouseClick(e) {
    getMousePosition(e);
    let target = Math.floor(mouse_x / cellSize) * 10 + Math.floor(mouse_y / cellSize);
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
            hover_piece = null;

            message = "thinking...";
            thinking = true;
            flush();
            updateMessage();
            inc_disconnect = inc_disconnect_MAX;
            printMes(MES_OTHERTURN);
            send(COLAMONE_PLAYING);
        }
    }
    flush();
}

function shuffleBoard() {
    thisMap = copyMap(zeroMap);
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

function getMousePosition(e) {
    if (!e.clientX) {
        if (e.touches) {
            e = e.originalEvent.touches[0];
        } else if (e.originalEvent.touches) {
            e = e.originalEvent.touches[0];
        } else {
            e = event.touches[0];
        }
    }
    let rect = document.getElementById("canv").getBoundingClientRect();
    let scale = 500 / rect.width;
    mouse_x = (e.clientX - rect.left) * scale;
    mouse_y = (e.clientY - rect.top) * scale;
}

function flush() {
    let wkMap = $.extend(true, {}, thisMap);
    if (hover_piece != null) {
        wkMap[hover_piece] = 0;
    }

    let selectedCell = null;
    if (mouse_x >= 0 && mouse_y >= 0) {
        selectedCell = {
            x: Math.max(0, Math.min(5, Math.floor(mouse_x / cellSize))),
            y: Math.max(0, Math.min(5, Math.floor(mouse_y / cellSize)))
        };
    }

    let highlights = [];
    if (!(isTouch == true && hover_piece == null) && selectedCell) {
        let target = selectedCell.x * 10 + selectedCell.y;
        if (thisMap[target] * turn_player > 0) {
            highlights = getCanMovePanel(target);
        }
    }

    window.__colamoneRenderState = {
        map: wkMap,
        hoverPiece: hover_piece,
        mouseX: mouse_x,
        mouseY: mouse_y,
        selectedCell,
        highlights,
        message
    };
    window.dispatchEvent(new CustomEvent('colamone:render'));

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

function drawFocus() {
    return null;
}

function getCanMovePanel(panel_num) {
    let number = thisMap[panel_num];
    let x = Math.floor(panel_num / 10);
    let y = Math.floor(panel_num % 10);
    let canMove = new Array;
    if (number == 0) {
        return canMove;
    }
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

    if (winner == me_player) {
        message = "You Win!";
        endgame();
        printMes(MES_YOUWIN);
    } else if (winner == -1 * me_player) {
        message = "You Lose...";
        endgame();
        printMes(MES_YOULOSE);
    } else if (winner == 0) {
        message = "-- Draw --";
        endgame();
    }
    flush();
}
function endgame() {}

function calcScore() {
    let sum1 = 0;
    let sum2 = 0;
    let GoalTop = [0, 10, 20, 30, 40, 50];
    let GoalBottom = [5, 15, 25, 35, 45, 55];
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

    if (isNoneNode(thisMap)) {
        if (Math.abs(sum1) > Math.abs(sum2)) {
            winner = 1;
            thinking = false;
        } else if (Math.abs(sum1) < Math.abs(sum2)) {
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
function isEnd(wkMap) {}

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
        return wkMap;
    }

    return copyMap(thisMap);
}
function copyMap(wkMap) {
    let rtnMap = new Object();
    rtnMap[0] = wkMap[0]; rtnMap[10] = wkMap[10]; rtnMap[20] = wkMap[20]; rtnMap[30] = wkMap[30]; rtnMap[40] = wkMap[40]; rtnMap[50] = wkMap[50];
    rtnMap[1] = wkMap[1]; rtnMap[11] = wkMap[11]; rtnMap[21] = wkMap[21]; rtnMap[31] = wkMap[31]; rtnMap[41] = wkMap[41]; rtnMap[51] = wkMap[51];
    rtnMap[2] = wkMap[2]; rtnMap[12] = wkMap[12]; rtnMap[22] = wkMap[22]; rtnMap[32] = wkMap[32]; rtnMap[42] = wkMap[42]; rtnMap[52] = wkMap[52];
    rtnMap[3] = wkMap[3]; rtnMap[13] = wkMap[13]; rtnMap[23] = wkMap[23]; rtnMap[33] = wkMap[33]; rtnMap[43] = wkMap[43]; rtnMap[53] = wkMap[53];
    rtnMap[4] = wkMap[4]; rtnMap[14] = wkMap[14]; rtnMap[24] = wkMap[24]; rtnMap[34] = wkMap[34]; rtnMap[44] = wkMap[44]; rtnMap[54] = wkMap[54];
    rtnMap[5] = wkMap[5]; rtnMap[15] = wkMap[15]; rtnMap[25] = wkMap[25]; rtnMap[35] = wkMap[35]; rtnMap[45] = wkMap[45]; rtnMap[55] = wkMap[55];
    return rtnMap;
}
function getCanMovePanelX(panel_num, wkMap) {
    let number = wkMap[panel_num];
    let x = Math.floor(panel_num / 10);
    let y = Math.floor(panel_num % 10);
    let canMove = new Array;
    if (number === 0) {
        return canMove;
    }
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

        if ((target_number * number > 0) || (target_number > 0 && target_y === 0) || (target_number < 0 && target_y === 5)) {
            continue;
        }
        canMove.push(idx);
    }
    return canMove;
}
