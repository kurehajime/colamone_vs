//"use strict"
var ctx=null;
var isTouch=true;
var canv_board=null;
var canv_board2=null;
var canv_focus=null;
var canv_pieces=null;
var canv_hover_piece=null;
var canv_overlay=null;
var hover_piece=null;
var cellSize=null;
var turn_player=null;
var blueScore=0;
var redScore=0;
var winner=null;
var isDraw=false;
var message="";
var thinking=true;
var apikey="";
var COLOR_LINE="#333333";
var COLOR_PANEL_1="#550025";
var COLOR_PANEL_2="#003856";
var COLOR_PANEL_3="#FFFFFF";
var COLOR_PANEL_4="#111111";
var COLOR_PANEL_5="#444444";
var COLOR_PANEL_6="#888888";

var COLOR_SELECT="#88FF88";
var COLOR_RED="#E5004F";
var COLOR_BLUE="#00A0E9";
var COLOR_WHITE="#FFFFFF";
var COLOR_GOLD="#FFFF00";
var PIECES={"1":[1,1,1,
                 1,0,1,
                 1,1,1],
            "2":[1,1,1,
                 1,0,1,
                 1,0,1],
            "3":[1,1,1,
                 0,0,0,
                 1,1,1],
            "4":[1,1,1,
                 0,0,0,
                 1,0,1],
            "5":[1,0,1,
                 0,0,0,
                 1,0,1],
            "6":[1,0,1,
                 0,0,0,
                 0,1,0],
            "7":[0,1,0,
                 0,0,0,
                 0,1,0],
            "8":[0,1,0,
                 0,0,0,
                 0,0,0],
            "-1":[1,1,1,
                  1,0,1,
                  1,1,1],
            "-2":[1,0,1,
                  1,0,1,
                  1,1,1],
            "-3":[1,1,1,
                  0,0,0,
                  1,1,1],
            "-4":[1,0,1,
                  0,0,0,
                  1,1,1],
            "-5":[1,0,1,
                  0,0,0,
                  1,0,1],
            "-6":[0,1,0,
                  0,0,0,
                  1,0,1],
            "-7":[0,1,0,
                  0,0,0,
                  0,1,0],
            "-8":[0,0,0,
                  0,0,0,
                  0,1,0]
           }

var thisMap={  0:-1,10:-2,20:-3,30:-4,40:-5,50:-6,
               1: 0,11:-8,21: 0,31: 0,41:-7,51: 0,
               2: 0,12: 0,22: 0,32: 0,42: 0,52: 0,
               3: 0,13: 0,23: 0,33: 0,43: 0,53: 0,
               4: 0,14: 7,24: 0,34: 0,44: 8,54: 0,
               5: 6,15: 5,25: 4,35: 3,45: 2,55: 1,
              }
var initMap=copyMap(thisMap);
var mouse_x =0;
var mouse_y =0;
var startMap;


//init
$(function(){
    //初期化
    ctx=$("#canv")[0].getContext('2d');
    
    canv_board =document.createElement("canvas");
    canv_board.width=ctx.canvas.width;
    canv_board.height=ctx.canvas.height;

    canv_board2 =document.createElement("canvas");
    canv_board2.width=ctx.canvas.width;
    canv_board2.height=ctx.canvas.height;

    
    canv_focus =document.createElement("canvas");
    canv_focus.width=ctx.canvas.width;
    canv_focus.height=ctx.canvas.height;

    canv_pieces =document.createElement("canvas");
    canv_pieces.width=ctx.canvas.width;
    canv_pieces.height=ctx.canvas.height;
    
    canv_hover_piece =document.createElement("canvas");
    canv_hover_piece.width=ctx.canvas.width;
    canv_hover_piece.height=ctx.canvas.height;
    
    canv_overlay =document.createElement("canvas");
    canv_overlay.width=ctx.canvas.width;
    canv_overlay.height=ctx.canvas.height;
    
    
    cellSize=ctx.canvas.width /6;
    turn_player=1;

    if('ontouchstart' in window){
        isTouch=true;
    }else{
        isTouch=false;        
    }
    //イベントを設定
    if(isTouch){
        $("#canv").bind('touchstart',ev_mouseClick)
    }else{
        $("#canv").bind('mousemove ',ev_mouseMove)
        $("#canv").bind('mouseup',ev_mouseClick);
    }
    $("#disconnect").bind('click',disconnect);
    $("#initpeer").bind('click',init_peer);
    $("#face1").bind('click',sendface);
    $("#face2").bind('click',sendface);
    $("#face3").bind('click',sendface);
    $("#face4").bind('click',sendface);
    $("#face5").bind('click',sendface);

    
    $( window ).unload(disconnect);
    shuffleBoard();
    
    
    
    //パラメータを取得
    var paramObj=getParam();
    //盤面を初期化
    if(paramObj["init"]){
        startMap= getMapByParam(paramObj["init"]);
        thisMap=copyMap(startMap);
    }else{
        startMap=copyMap(thisMap);
    }
       
    printMes(MES_INIT);
    //描画
    flush();
    updateMessage();

});



//マウス移動時処理
function ev_mouseMove(e){
    getMousePosition(e);
    flush();
}
//マウスクリック時処理
function ev_mouseClick(e){
    getMousePosition(e);
    var target=Math.floor(mouse_x/cellSize)*10
                +Math.floor(mouse_y/cellSize)
    if(thinking==true){
        return true;
    }
    
    if(winner!=null){
        reloadnew();
        return true;
    }
    if(hover_piece==null){
        if(thisMap[target]*turn_player>0){
            hover_piece=target;
        }
    }else{
        if(target==hover_piece){
            hover_piece=null;
            updateMessage();
            flush();
            return;
        }
        var canm=getCanMovePanel(hover_piece);
        if(canm.indexOf (target)>=0){
            thisMap[target]=thisMap[hover_piece];
            thisMap[hover_piece]=0;
            //turn_player=turn_player*-1;
            hover_piece=null;

            //AIが考える。
            drawFocus();
            message="thinking..."
            thinking=true;
            flush();
            updateMessage();
            inc_disconnect=inc_disconnect_MAX;
            printMes(MES_OTHERTURN);
            send(connect_pid,COLAMONE_PLAYING);
        }        
    }
    drawFocus();
//    updateMessage();
    flush();
}


//盤面をシャッフル
function shuffleBoard(){
    //クリア
    for(var num in thisMap){
        thisMap[num]=0;   
    }
    var arr=[1,2,3,4,5,6,7,8];
    var red_num=[0,10,20,30,40,50,11,41];
    var blue_num=[55,45,35,25,15,5,44,14];
    for(var i=0;i<=666;i++){
        arr.sort(function() {
                return Math.random() - Math.random();
            });        
    }
    
    for(var num in blue_num){
        thisMap[blue_num[num]]=arr[num];   
    }
    for(var num in red_num){
        thisMap[red_num[num]]=-1*arr[num];   
    }
}


// マウス位置取得  
function getMousePosition(e) {  
	if(!e.clientX){//SmartPhone
        if(e.touches){
            e = e.originalEvent.touches[0];            
        }else if(e.originalEvent.touches){
            e = e.originalEvent.touches[0];
        }else{
            e = event.touches[0];
        }
    }
    var rect = e.target.getBoundingClientRect();
    mouse_x = e.clientX - rect.left;  
    mouse_y = e.clientY - rect.top;  
}  
//画面描画
function flush(){
    var wkMap=$.extend(true,{},thisMap)
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.width);

    //盤面を描画
    ctx.drawImage(drawBoard(), 0, 0, ctx.canvas.width, ctx.canvas.height);
    
    //テカリを描画
    ctx.drawImage(drawBoard2(), 0, 0, ctx.canvas.width, ctx.canvas.height);
    
    //選択したコマを除外
    if(hover_piece!=null){
        wkMap[hover_piece]=0;
    }
    //コマを表示
    ctx.drawImage(drawPieceAll(wkMap), 0, 0, ctx.canvas.width, ctx.canvas.height);
    
    //選択したコマを表示
    ctx.drawImage(drawHoverPiece(), 0, 0, ctx.canvas.width, ctx.canvas.height);
    
    //フォーカスを描画
    ctx.drawImage(drawFocus(), 0, 0, ctx.canvas.width, ctx.canvas.height);
    
    //メッセージを描画
    ctx.drawImage(drawOverlay(), 0, 0, ctx.canvas.width, ctx.canvas.height);
    
    if(status==STATUS_PLAYING){
        if(turn_player==1){
            $("body").removeClass("body_0");
            $("body").addClass("body_1");
            $("body").removeClass("body_2");
        }else if(turn_player==-1){
            $("body").removeClass("body_0");
            $("body").removeClass("body_1");
            $("body").addClass("body_2");
        }
    }else{
        $("body").addClass("body_0");
        $("body").removeClass("body_1");
        $("body").removeClass("body_2");  
    }
}
//フォーカスを描画
function drawFocus(){
    //選択マスを強調
    var x=mouse_x- (mouse_x % cellSize);
    var y=mouse_y- (mouse_y % cellSize);
    var ctx_focus=canv_focus.getContext('2d');
    ctx_focus.clearRect(0,0,ctx.canvas.width,ctx.canvas.width);
    ctx_focus.globalAlpha = 0.5;
    ctx_focus.fillStyle=COLOR_SELECT;
    ctx_focus.lineWidth =1;
    ctx_focus.beginPath();
    ctx_focus.fillRect(x, y, cellSize, cellSize);
    
    if(isTouch==true &&hover_piece==null){
        return canv_focus;
    }

    //移動可能マスを強調
    var target=(x/cellSize)*10+(y/cellSize);
    if(thisMap[target]*turn_player>0){
        var canm = getCanMovePanel(target)
        for(var i=0;i<=canm.length-1;i++){
            x=Math.floor(canm[i]/10);
            y=Math.floor(canm[i]%10);
            ctx_focus.strokeStyle  = COLOR_SELECT;
            ctx_focus.lineWidth =5;
            ctx_focus.beginPath();
            ctx_focus.arc(x*cellSize+(cellSize/2), y*cellSize+(cellSize/2)
                          , (cellSize/2)-10, 0, Math.PI*2, false);
            ctx_focus.stroke();
        }        
    }
    return canv_focus;
}



//盤面を描画してCANVASオブジェクトを返す。
function drawBoard(){
    var ctx_board=canv_board.getContext('2d');
    ctx_board.clearRect(0,0,ctx.canvas.width,ctx.canvas.width);

    var grad  = ctx_board.createLinearGradient(0,0,ctx.canvas.width,ctx.canvas.width);
    grad.addColorStop(0,COLOR_PANEL_6);    
    grad.addColorStop(0.3,COLOR_PANEL_5); 
    grad.addColorStop(1,COLOR_PANEL_4);                  

    
    for(var x=0;x<6;x++){
        for(var y=0;y<6;y++){
            //パネル描画
            ctx_board.strokeStyle = COLOR_LINE;
            if(y==0){
                ctx_board.fillStyle=COLOR_PANEL_1;
            }else if(y==5){
                ctx_board.fillStyle=COLOR_PANEL_2;            
            }else if((x+y) % 2 ==0){
                ctx_board.fillStyle=COLOR_PANEL_3;
            }else{
                ctx_board.fillStyle=COLOR_PANEL_4;
                ctx_board.fillStyle   = grad
            }
            ctx_board.beginPath();
            ctx_board.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
            ctx_board.strokeRect(x*cellSize, y*cellSize, cellSize, cellSize);
        }
    }
    
    return canv_board;
}
function drawBoard2(){
    var ctx_board2=canv_board2.getContext('2d');
    ctx_board2.clearRect(0,0,ctx.canvas.width,ctx.canvas.width);
    ctx_board2.globalAlpha = 0.07;
    ctx_board2.fillStyle = COLOR_WHITE;
    ctx_board2.beginPath();
    ctx_board2.arc(cellSize*1, -3*cellSize, 7*cellSize, 0, Math.PI*2, false);
    ctx_board2.fill();

    return canv_board2;
}
//浮遊しているコマを描画する。
function drawHoverPiece(){
    var ctx_hover=canv_hover_piece.getContext('2d');
    ctx_hover.clearRect(0,0,ctx.canvas.width,ctx.canvas.width);
    var x = mouse_x-(cellSize/2)
    var y = mouse_y-(cellSize/2)
    if(hover_piece!=null){
        drawPiece(ctx_hover,x,y,thisMap[hover_piece]
                  ,false)
    }
    return canv_hover_piece;
}
//コマを描画する。
function drawPiece(wkCtx,x,y,number,goal){
    var wkColor;
    
    //外枠を描画
    if(number==0){
        return wkCtx;
    }else if(number>0){
        wkColor=COLOR_BLUE;   
    }else{
        wkColor=COLOR_RED;           
    }
    //wkCtx.fillStyle = wkColor;
    var grad  = ctx.createLinearGradient(x,y, x+cellSize,y+cellSize);
    grad.addColorStop(0,'rgb(255, 255, 255)');    
    grad.addColorStop(0.4,wkColor); 
    grad.addColorStop(1,wkColor);  
    wkCtx.fillStyle   = grad;
    
    
    wkCtx.beginPath();
    wkCtx.fillRect(x+cellSize/10,y+cellSize/10,cellSize-1*cellSize/5,cellSize-1*cellSize/5);
    
    //文字を描画。
    if(goal){
        wkCtx.fillStyle   = COLOR_GOLD;                
    }else{
        wkCtx.fillStyle   = COLOR_WHITE;        
    };        
    
    
    
    var fontsize=Math.round(cellSize*0.18);
    wkCtx.textBaseline ="middle";
    wkCtx.textAlign="center";
    wkCtx.font = fontsize+"pt Arial";
    wkCtx.beginPath();
    
    //数字を印字
    wkCtx.fillText(Math.abs(number), x+(cellSize/2), y+(cellSize/2));

    
    //点を描画
    for(var i =0;i<= PIECES[number].length-1;i++){
        if(PIECES[number][i]==0){
            continue;   
        }
        var x_dot = x+cellSize/4.16+( Math.floor (cellSize-1*cellSize/5)/3)*Math.floor (i % 3.0);
        var y_dot = y+cellSize/4.16+( Math.floor (cellSize-1*cellSize/5)/3)*Math.floor (i / 3.0);

        if(goal){
            wkCtx.fillStyle   = COLOR_GOLD;                
        }else{
            wkCtx.fillStyle   = COLOR_WHITE;        
        }
        wkCtx.beginPath();
        wkCtx.arc(x_dot, y_dot, cellSize*0.06, 0, Math.PI*2, false);
        wkCtx.fill();
    }
    
    
    return wkCtx;
    
}
//コマをすべて描画
function drawPieceAll(wkMap){
    var ctx_pieces=canv_pieces.getContext('2d');
    ctx_pieces.clearRect(0,0,ctx.canvas.width,ctx.canvas.width);
    for(var x=0;x<6;x++){
        for(var y=0;y<6;y++){
            if(wkMap[x*10+y]!=0){
                var goal=false;
                if(y*cellSize,wkMap[x*10+y]>0 & y==0){
                    goal=true;
                }else if(y*cellSize,wkMap[x*10+y]<0 & y==5){
                    goal=true;
                }
                ctx_pieces=drawPiece(ctx_pieces,x*cellSize
                                        ,y*cellSize,wkMap[x*10+y],goal);
            }
        }
    }
    return canv_pieces;
}

//メッセージを描画
function drawOverlay(){
    var ctx_overlay=canv_overlay.getContext('2d');
    var x = cellSize*1.5
    var y = cellSize*2.5
    
    ctx_overlay.clearRect(0,0,ctx.canvas.width,ctx.canvas.width);

    if(message==""){
        return canv_overlay;
    }
    ctx_overlay.globalAlpha = 0.8;
    ctx_overlay.fillStyle = COLOR_WHITE;
    ctx_overlay.beginPath();
    ctx_overlay.fillRect(x,y,cellSize*3,cellSize*1);
    ctx_overlay.fill();
    
    var fontsize=Math.round(cellSize*0.36);    
    ctx_overlay.font = "bold "+fontsize+"px sans-serif";
    ctx_overlay.globalAlpha = 1;
    ctx_overlay.fillStyle = COLOR_LINE;
    ctx_overlay.textBaseline ="middle";
    ctx_overlay.textAlign="center";
    ctx_overlay.beginPath();
    ctx_overlay.fillText(message, cellSize*3, cellSize*3);
    
    return canv_overlay;
}


//動かせるマスを返す。Return:[NN,NN,NN]
function getCanMovePanel(panel_num){
    var number = thisMap[panel_num];
    var x = Math.floor(panel_num / 10);
    var y = Math.floor(panel_num % 10);
    var canMove=new Array;
    if(number==0){
        return canMove;   
    }
    //アガリのコマは動かしたらダメ。
    if(number>0 & y==0){
        return canMove;   
    }else if(number<0 &y==5){
        return canMove;   
    }

    for(var i=0;i<=PIECES[number].length-1;i++){
        var target_x= x + Math.floor(i%3)-1;
        var target_y= y + Math.floor(i/3)-1;
        
        if(PIECES[number][i]==0){
            continue;
        }
        if(target_x<0 || target_y<0|target_x>5|target_y>5 ){
            continue;
        }
        var target_number=thisMap[target_x*10+target_y];
        if(target_number*number>0){
            continue;   
        }
        //アガリのコマはとったらダメ。
        if(target_number>0 & target_y==0){
            continue;   
        }else if(target_number<0 &target_y==5){
            continue;
        }
        canMove.push(target_x*10+target_y);
        
    }
    return canMove;
}

function updateMessage(){
    calcScore();
    if(turn_player>0){
        $("#turn")[0].innerHTML="Blue";
        $("#turn")[0].style.color=COLOR_BLUE;
    }else if(turn_player<0){
        $("#turn")[0].innerHTML="Red";          
        $("#turn")[0].style.color=COLOR_RED;
    }else{
        $("#turn")[0].innerHTML="";                  
    }
    $("#blue")[0].innerHTML=blueScore;                  
    $("#red")[0].innerHTML=redScore;
    //$("#score")[0].innerHTML=score;
    
    if(winner==me_player){
        message="You Win!"
        endgame();
        printMes(MES_YOUWIN);
    }else if(winner==-1*me_player){
        message="You Lose..."
        endgame();
        printMes(MES_YOULOSE);
    }else if(winner==0){
        message="-- Draw --"
        endgame();
    }
   
}
function endgame(){
    
}

function calcScore(){
    var sum1=0;
    var sum2=0;
    var GoalTop=[0,10,20,30,40,50];
    var GoalBottom=[5,15,25,35,45,55]; 
    //点数勝利        
    for(var i in GoalTop){
        if(thisMap[GoalTop[i]]*1>0){
            sum1+=thisMap[GoalTop[i]];
        }
    }
    for(var i in GoalBottom){
        if(thisMap[GoalBottom[i]]*-1>0){
            sum2+=thisMap[GoalBottom[i]];
        }
    }
    if(sum1>=8){
        winner= 1;
        thinking=false;
    }else if(sum2<=-8){
        winner= -1;
        thinking=false;
    }

    //手詰まりは判定
    if(isNoneNode(thisMap)){
        if(Math.abs(sum1)>Math.abs(sum2)){
            winner= 1;
            thinking=false;
        }else if(Math.abs(sum1)<Math.abs(sum2)){//引き分けは後攻勝利
            winner= -1;
            thinking=false;
        }else if(Math.abs(sum1)==Math.abs(sum2)){
            winner=0;
            thinking=false;
        }
    }
    blueScore=Math.abs(sum1);
    redScore=Math.abs(sum2);
}
function isEnd(wkMap){
 
}
//手詰まり判定
function isNoneNode(wkMap){
    var flag1=false;
    var flag2=false;
    for(var panel_num in wkMap){
        if(wkMap[panel_num]==0){
            continue;
        }
        var canMove=getCanMovePanelX(panel_num,wkMap,false);
        if(canMove.length!=0){
            if(wkMap[panel_num]>0){
                flag1=true;
            }else if(wkMap[panel_num]<0){
                flag2=true;
            }
        }
        if(flag1&&flag2){
            return false;
        }
    }
    return true;
}

//パラメータ取得
function getParam(){
    var obj = new Object();
    if (1 < document.location.search.length) {
        var paramstr = document.location.search.substring(1).split('&');
        for (var i = 0; i < paramstr.length; i++) {
            var entry = paramstr[i].split('=');
            var key = decodeURIComponent(entry[0]);
            var value = decodeURIComponent(entry[1]);
            obj[key] = decodeURIComponent(value);
        }
    }
    return obj;
}
function getMapByParam(initString){
    if(initString){
        var wkMap=copyMap(thisMap);
        //クリア
        for(var num in wkMap){
            wkMap[num]=0;   
        }
        var arr=initString.split(',');
        if(arr.length<8){
            arr=[1,2,3,4,5,6,7,8];
        }
        var red_num=[0,10,20,30,40,50,11,41];
        var blue_num=[55,45,35,25,15,5,44,14];


        for(var num in blue_num){
            wkMap[blue_num[num]]=parseInt(arr[num]);   
        }
        for(var num in red_num){
            wkMap[red_num[num]]=-1*parseInt(arr[num]);   
        }
    }

    return wkMap;
}
function copyMap(wkMap){
    var rtnMap=new Object();
    //不格好だがループするより高速。
    rtnMap[0]=wkMap[0];
    rtnMap[10]=wkMap[10];
    rtnMap[20]=wkMap[20];
    rtnMap[30]=wkMap[30];
    rtnMap[40]=wkMap[40];
    rtnMap[50]=wkMap[50];
    rtnMap[1]=wkMap[1];
    rtnMap[11]=wkMap[11];
    rtnMap[21]=wkMap[21];
    rtnMap[31]=wkMap[31];
    rtnMap[41]=wkMap[41];
    rtnMap[51]=wkMap[51];
    rtnMap[2]=wkMap[2];
    rtnMap[12]=wkMap[12];
    rtnMap[22]=wkMap[22];
    rtnMap[32]=wkMap[32];
    rtnMap[42]=wkMap[42];
    rtnMap[52]=wkMap[52];
    rtnMap[3]=wkMap[3];
    rtnMap[13]=wkMap[13];
    rtnMap[23]=wkMap[23];
    rtnMap[33]=wkMap[33];
    rtnMap[43]=wkMap[43];
    rtnMap[53]=wkMap[53];
    rtnMap[4]=wkMap[4];
    rtnMap[14]=wkMap[14];
    rtnMap[24]=wkMap[24];
    rtnMap[34]=wkMap[34];
    rtnMap[44]=wkMap[44];
    rtnMap[54]=wkMap[54];
    rtnMap[5]=wkMap[5];
    rtnMap[15]=wkMap[15];
    rtnMap[25]=wkMap[25];
    rtnMap[35]=wkMap[35];
    rtnMap[45]=wkMap[45];
    rtnMap[55]=wkMap[55];
    return rtnMap;
}
//動かせるマスを返す。Return:[NN,NN,NN...]
function getCanMovePanelX(panel_num,wkMap){
    var number = wkMap[panel_num];
    var x = Math.floor(panel_num / 10);
    var y = Math.floor(panel_num % 10);
    var canMove=new Array;
    if(number===0){
        return canMove;   
    }
    //アガリのコマは動かしたらダメ。
    if(number>0 && y===0){
        return canMove;   
    }else if(number<0 && y===5){
        return canMove;   
    }
    for(var i=0;i<PIECES[number].length;i++){
        if(PIECES[number][i]===0){
            continue;
        }
        var target_x= x + Math.floor(i%3)-1;
        var target_y= y + Math.floor(i/3)-1;
        if(target_y<0 || target_y>5 || target_x>5 || target_x<0 ){
            continue;
        }
        var idx=target_x*10+target_y;
        var target_number=wkMap[idx];

        //自コマとアガリのコマはとったらダメ。
        if((target_number*number>0)||(target_number>0 && target_y===0)||(target_number<0 &&target_y===5)){
            continue;   
        }
        canMove.push(idx);
    }
    return canMove;
}
//---------------------------------------------------------------------------
/*
A「Bさん、Cさん、Dさん、一緒に遊ばない？」
B「」
C「はい、プレイしましょう」
D「はい、プレイしましょう」
A「Dさん、お前とは嫌だ。」
A「Cさん、じゃあ始めよう。」
*/
var COLAMONE_OFFER="COLAMONE_OFFER";//一緒に遊ばない？
var COLAMONE_NO="COLAMONE_NO";//やだ。(他の人とプレイ中…など)
var COLAMONE_OK="COLAMONE_OK";//はい、プレイしましょう。
var COLAMONE_LETSGO="COLAMONE_LETSGO";//じゃあ始めよう。
var COLAMONE_PLAYING="COLAMONE_PLAYING";//プレイ中
var COLAMONE_FACE="COLAMONE_FACE";//顔文字
var COLAMONE_HELLO="COLAMONE_HELLO";//ただ呼んでみただけ。

var STATUS_NONE="STATUS_NONE"//無心
var STATUS_OFFER="STATUS_OFFER"//今こっちから誘ってる最中。
var STATUS_PLAYING="STATUS_PLAYING"//今遊んでる最中。誘いには乗りません。
var STATUS_RETURN="STATUS_RETURN"//今返答して再回答を待ってる最中。誘いには乗りません。

var MES_INIT={"en":"Please join by pressing the Connect button.","ja":"接続ボタンを押してください。↑"};
var MES_DISCONNECT={"en":"Disconnected.","ja":"切断しました。"};
var MES_MATCHING={"en":"Searching player.","ja":"対戦相手を探しています。"};
var MES_CONNECT={"en":"Game with @ begins.","ja":"@との対局を始めます。"};
var MES_YOUBLUE={"en":"You are Blue.","ja":"あなたは青です。"};
var MES_YOURED={"en":"You are Red.","ja":"あなたは赤です。"};
var MES_YOUWIN={"en":"You win.","ja":"あなたの勝ちです。"};
var MES_YOULOSE={"en":"You lose.","ja":"あなたの負けです。"};
var MES_YOUTURN={"en":"It's your turn.","ja":"あなたのターンです。"};
var MES_OTHERTURN={"en":"It's @ turn.","ja":"相手のターンです。"};
var MES_PLAYER_COUNT={"en":"Players:@","ja":"現在の参加者:@"};


var status=STATUS_NONE;
var from_pid="";
var connect_pid="";
var offerArray;
var inc_disconnect_MAX=300;
var inc_disconnect=300;
var inc_timeout_MAX=6;
var inc_timeout=6;
var inc_offer=0;
var ObjConnInterval;
var ObjOfferInterval;
var other_player_name;
var me_player=1;
var play_conn;
var peer;
//接続
function init_peer(){
    
    
    inc_disconnect=inc_disconnect_MAX;
    if(peer&&!peer.disconnected){
        disconnect();
    }
    if(!util.supports.data){
        alert("Sorry. This browser does not support.\nPlease play with AI.");
        location.href ="http://xiidec.appspot.com/colamone/colamone.html"

    }
    
    if(location.host.indexOf("localhost")!=-1){
        apikey='6165842a-5c0d-11e3-b514-75d3313b9d05';
    }else{
        apikey='69faa3ba-f08f-11e3-b507-6fcc8611e424';
    }
    status=STATUS_OFFER;
    peer = new Peer({key   : apikey,debug : 3});
    peer.on('open', function(id){
        from_pid=id;
        $('#status').text("Connect...");
    });
    peer.on('error', function(e){
        disconnect();
        console.log(e.message);
    });
    peer.on('connection', function(conn) {
        // メッセージを受信
        conn.on('data', recv);
    });
    inc_offer=0;
    connect_pid="";
    initGame();
    if(ObjConnInterval){
		clearTimeout(ObjConnInterval);
    }
    if(ObjOfferInterval){
		clearTimeout(ObjOfferInterval);
    }
    ObjConnInterval =setInterval(inc, 1000);
    ObjOfferInterval =setInterval(offerloop, 1000+Math.round(Math.random()*500));
    printMes(MES_MATCHING);
    $("#initpeer").addClass("btnactive");  

}
function initGame(){
    winner=null;
    isDraw=false;
    message="";
}
//定期的に実行
function inc(){
    inc_disconnect=inc_disconnect-1;
    if(inc_disconnect<0){//一定時間送信がない場合切断
        disconnect();
    }

    
    //プレイ中なのにコネクションが切れてたら切断
    if(status==STATUS_PLAYING&&connect_pid!=""&&!peer.connections[connect_pid]){
        connect_pid="";
        disconnect();
    }else if(status==STATUS_PLAYING&&connect_pid!=""&&peer.connections[connect_pid]){
        if(inc_disconnect % 5==0){
            send(connect_pid,COLAMONE_HELLO)//生存確認
        }
    }
    
}
//定期的に対戦相手を探す。
function offerloop(){
        if(peer&&!peer.disconnected){
            inc_offer=inc_offer+1;
            if(status==STATUS_OFFER){
                if(inc_offer % 5==0){
                    $('#status').text("sending...");
                    offerALL();
                }else{
                    $('#status').text("waiting...");
                }
            }
            if(status==STATUS_RETURN){
                inc_timeout=inc_timeout-1;
                if(inc_timeout<0){
                    status=STATUS_OFFER;
                }
            }
            //対戦相手が見つかったら中止。
            if(status==STATUS_PLAYING||status==STATUS_NONE){
                clearTimeout(ObjOfferInterval);
            }
        }else{
            clearTimeout(ObjOfferInterval);
        }
}
//切断
function disconnect(){
    if(peer){
        if(!peer.disconnected){
            peer.destroy();
            $('#status').text("disconnect");
            printMes(MES_DISCONNECT);
        }
    }
    status=STATUS_NONE;
    connect_pid="";
    $("body").addClass("body_0");
    $("body").removeClass("body_1");
    $("body").removeClass("body_2");  
    $("#initpeer").removeClass("btnactive");  
    
    
}
//受信
function recv(data){
    switch(status){
        case STATUS_NONE://なにもなし
            //無視
            break;
        case STATUS_OFFER://招待中
            if(data.message==COLAMONE_OK){
                thisMap=copyMap(initMap);
                shuffleBoard();
                send(data.pid,COLAMONE_LETSGO);//プレイ開始
                connect_pid=data.pid;
                message=""
                me_player=1;
                status=STATUS_PLAYING;
                thinking=false;
                send_no_without();
                updateMessage();
                flush();
                other_player_name=data.name;
                $('#status').text("playing");
                printMes(MES_CONNECT,data.name);
                printMes(MES_YOUBLUE);
                blink();
            }else if(data.message==COLAMONE_OFFER){
                connect_pid=data.pid;
                send(data.pid,COLAMONE_OK);//いいよ。
                status=STATUS_RETURN;
                inc_timeout=inc_timeout_MAX;
            }else{
                //無視
            }
            
            break;

        case STATUS_RETURN://お返事中
            if(data.pid==connect_pid&&data.message==COLAMONE_LETSGO){
                $('#status').text("playing");
                status=STATUS_PLAYING;
                thisMap=data.map;
                turn_player=data.turn*-1;
                message=""
                me_player=-1;
                updateMessage();
                flush();
                printMes(MES_CONNECT,data.name);
                printMes(MES_YOURED);
                blink();
            }else if(data.pid==connect_pid&&data.message==COLAMONE_NO){
                status=STATUS_OFFER;//待ち状態に戻る。
            }else{
                //無視。   
            }
            break;
        case STATUS_PLAYING://遊んでる
            if(data.pid==connect_pid && data.message!=COLAMONE_FACE){
                inc_disconnect=inc_disconnect_MAX;
                $('#status').text("playing");
                thisMap=data.map;
                turn_player=data.turn*-1;
                message=""
                thinking=false;
                updateMessage();
                flush();
                printMes(MES_YOUTURN);
                blink();
                break;
            }else if(data.pid==connect_pid&& data.message==COLAMONE_FACE){
                switch(data.face){
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
var connections=new Object();
//送信
function send(to_pid,message,pram){
    var conn;
    if(connections[to_pid]&&connections[to_pid].open){
        conn=connections[to_pid];
        var obj=new Object();
        obj.pid=from_pid;
        obj.message=message;
        user_name=$("#user_name").val();
        if (user_name.match(/[A-Z\d\-]/)) {
            obj.name=user_name;
        }else{
            obj.name="Anonymous Player";
        }
        if(message==COLAMONE_FACE){
            obj.face=pram;
        }
        if(message==COLAMONE_PLAYING||message==COLAMONE_LETSGO){
            obj.map=thisMap;
            obj.turn=turn_player;
        }
        // メッセージを送信
        conn.send(obj);
        return;
    }else{
        conn=peer.connect(to_pid);
        connections[to_pid]=conn;
        conn.on('open', function() {
            var obj=new Object();
            obj.pid=from_pid;
            obj.message=message;
            user_name=$("#user_name").val();
            if (user_name.match(/[A-Z\d\-]/)) {
                obj.name=user_name;
            }else{
                obj.name="Anonymous Player";
            }
            if(message==COLAMONE_FACE){
                obj.face=pram;
            }
            if(message==COLAMONE_PLAYING||message==COLAMONE_LETSGO){
                obj.map=thisMap;
                obj.turn=turn_player;
            }
            // メッセージを送信
            conn.send(obj);
        });
        conn.on('error', function() {
            disconnect();
            if(window.console){
                window.console.log('error');
            }
        });
    }
    



       
}
//お断りのご報告をする。
function send_no_without(){
    for(var i in offerArray){
        if(offerArray[i]!=connect_pid&&offerArray[i]!=from_pid){
            send(offerArray[i],COLAMONE_NO);
        }
    }
    offerArray=new Array();
    clean_connection();
}
//コネクション整理
function clean_connection(){
    //カレント以外とは切断
    for(var pid in peer.connections){
        if(pid!=connect_pid&&pid!=from_pid){
            for(var i in peer.connections[pid]){
                peer.connections[pid][i].close();
            }
        }
    }
    //コネクションが切れてたら切断
    if(connect_pid!=""&&!peer.connections[connect_pid]){
        connect_pid="";
        disconnect();
        
    }
}
//みんなを誘う。
function offerALL(){
    turn_player=1;
    status=STATUS_OFFER;
    offerArray=new Array();
    $.getJSON("https://skyway.io/active/list/"+apikey, function(json){
        for(var i=0;i<=666;i++){
            json.sort(function() {
                    return Math.random() - Math.random();
                });        
        }
        for(var i=0;i<=32;i++){
            if(i<json.length&&json[i]!=from_pid){
                if(status==STATUS_OFFER){
                    offerArray.push(json[i]);
                    send(json[i],COLAMONE_OFFER);
                }
            }
        }
        printMes(MES_PLAYER_COUNT,json.length);
    });
}
//メッセージを表示
function printMes(message,param){
    var date = new Date();
    var yyyymmdd=date.getFullYear()  + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
    var mes=message[get_lang()];
    if(param!=undefined&&mes!=undefined){
        mes=mes.replace("@",param);
    }
    var logmsg=yyyymmdd+": "+mes+"\n"+$('#logmessage').val();
     $('#logmessage').val(logmsg);   
}
//メッセージを表示
function printMes2(message){
    var date = new Date();
    var yyyymmdd=date.getFullYear()  + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
    var logmsg=yyyymmdd+": "+message+"\n"+$('#logmessage').val();
     $('#logmessage').val(logmsg);   
}
//顔文字を送る。
function sendface(event){
    if(status==STATUS_PLAYING){
        var id=$(event.target).attr('id');
        var faceid=0;
        switch(id){
            case "face1":
                faceid=1;
                printMes2("(´・ω・｀)")
                break;
            case "face2":
                faceid=2;
                printMes2("ヽ(ﾟ∀ﾟ)ﾉ")
                break;
            case "face3":
                faceid=3;
                printMes2("(灬ºωº灬)")
                break;
            case "face4":
                faceid=4;
                printMes2("(´；ω；｀)")
                break;
            case "face5":
                faceid=5;
                printMes2("ヽ(´∀｀)人(´∀｀)ﾉ")
                break;
        }

        send(connect_pid,COLAMONE_FACE,faceid);
    }
}
function blink(){
    $("#main").css("background-color", "#FFFFFF");
    setTimeout(function(){
        $("#main").css("background-color", "");
    },77)   
}