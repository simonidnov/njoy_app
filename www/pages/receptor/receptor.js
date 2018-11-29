/*
  TODO the canvas siz doesn't reflect the device size !important NOTE : broadcast RATIO is 1920*1080
  we need to rotate client canvas @ 90° only when thats vertical.
  TODO #2 traces are broken check traces NOTE : if you make trace the next point draw line from the oldXY NOTE : unset there values doesn"t change anything.
*/
var receptor = {
    currentShape : [],
    canvas :null,
    init:function(){
        app.init(function(){});
        /* on receive node_log print */
        app.socket_callback = $.proxy(function(e){
            if(typeof e.datas !== "undefined"){
                this.create_component(e.datas);
            }
        }, this);
    },
    create_component : function(datas){
        switch(datas.status){
            case "init_drawing":
                $('.module').html('');
                $('.chronos').remove();
                TweenMax.killAll();
                app.socket.emit('njoy', {status:'stop_video'});
                app.socket.emit('njoy', {status:'stop_audio'});
                setTimeout($.proxy(function(){
                    this.init_drawing(datas);
                }, this), 300);
                break;
            case "drawing":
                this.drawing(datas);
                break;
            case "drawing_point":
                this.drawing_point(datas);
                break;
            case "video":
                $('.module').html('');
                $('.chronos').remove();
                TweenMax.killAll();
                $('.module').append('<div class="video_display"><video src="'+app.ip+'/'+datas.file+'" autoplay width="'+window.innerWidth+'px" height="'+window.innerHeight+'px" preload></video></div>');
                break;
            case "playlist_video":
                $('.module').append('<div class="video_display"></div>');
                TweenMax.killAll();
                console.log('play video playlist');
                break;
            case "audio":
                //TweenMax.killAll();
                if(typeof this.audio !== "undefined"){
                  this.audio.pause();
                }
                this.audio = new Audio(datas.file);
                this.audio.play();
                console.log('play audio http://10.213.1.231:3000/', datas.file);
                break;
            case "playlist_audio":
                $('.module').append('<div class="audio_display"></div>');
                TweenMax.killAll();
                console.log('play audio playlist');
                break;
            case "picture":
                $('.module').html('');
                TweenMax.killAll();
                $('.module').append('<div class="picture_display"></div>');
                $('.picture_display').css('background-image', 'url('+datas.file+')');
                console.log('display picture');
                break;
            case "":
                break;
            case "success":
                this.success(datas);
                console.log('this is success');
                break;
            case "fail":
                this.fail(datas);
                console.log('this is fail');
                break;
            case "object":
                this.object_component(datas);
                break;
            case "golden_family":
                this.golden_family(datas);
                break;
            case "web_content":
                this.web_content(datas);
                break;
        }
        if(typeof datas.chronos !== "undefined"){
            this.setChronos(datas.chronos, datas.chronos_type);
        }
    },
    web_content : function(datas){
        console.log(datas);
    },
    object_component : function(datas){
        $('.module').html('');
        $('.chronos').remove();
        TweenMax.killAll();
        //TweenMax.killAllTweens();
        switch (datas.component){
            case "quiz_component":
                break;
            case "golden_family":
                //<h1>'+datas.tools.menu[datas.menu].components.golden_family[datas.component_id].label+'</h1>
                $('.module').append('<div class="golden_family"><div class="content_choice"><h3>'+datas.tools.menu[datas.menu].components.golden_family[datas.component_id].desc+'</h3><ul class="choices"></ul></div></div>');
                var LENGTH = datas.tools.menu[datas.menu].components.golden_family[datas.component_id].choices.length;
                for(var i=0; i<LENGTH; i++){
                    $('.receptor .module .golden_family ul.choices').append('<li><div class="front"></div><div class="back">'+datas.tools.menu[datas.menu].components.golden_family[datas.component_id].choices[i]+'<div class="points">'+((LENGTH*10)-(i*10))+'</div></div></li>');
                }
                /*
                $('.receptor .module .golden_family ul.choices li').on('click', function(){
                    if($(this).hasClass('selected')){
                        $(this).removeClass('selected');
                    }else{
                        $(this).addClass('selected');
                    }
                });
                */
                break;
        }
    },
    golden_family : function(datas){
        //alert('data-type golden family');
        if(typeof datas.response !== "undefined"){
            $('.receptor .module .golden_family ul.choices li').eq(parseInt(datas.response)).addClass('selected');
        }
    },
    setChronos : function(time, type){
        if(typeof type === "undefined"){type="bottom";}
        $('.screen.receptor').append('<div class="chronos '+type+'"><div class="counter"></div><div class="timelap"><div class="progress"></div></div></div>');
        $('.chronos .counter').html(time);
        var chronos_tween = TweenMax.to($('.timelap .progress'), parseInt(time), {css:{width:"100%"}, ease:Linear.easeNone, onUpdate:function(e){
            $('.chronos .counter').html(parseInt(time) - Math.round(chronos_tween.time()));
        }, onComplete:function(){
            //alert('time elapsed');
        }});
    },
    success : function(){
        if($('.motion_canvas').length == 0){
          $('.module').append('<canvas class="motion_canvas" id="motion_canvas"></canvas');
        }
        if(typeof this.conf !== "undefined"){
            delete this.conf;
        }
        this.conf = new confettis();
        this.conf.initConfettis('motion_canvas');
        this.conf.start_confettis();
        setTimeout($.proxy(function(){
            this.conf.stop_confettis();
        },this), 1000);
        //alert('success');
    },
    fail : function(){
        $('.module').append('<canvas class="motion_canvas" id="motion_canvas"></canvas');
        //alert('fail');
    },
    init_drawing : function(datas){
        /*
        app.socket.emit("njoy", {
          "status":"init_drawing",
          "width":window.innerWidth,
          "height":window.innerHeight
        });
        */
        console.log('init_drawing');

        $('.module').append('<canvas id="drawing" width="'+datas.width+'" height="'+datas.height+'"></canvas>');
        //this.drawing_tool = new drawer("drawing", datas.width, datas.height);
        this.canvas = document.getElementById("drawing");
        // TODO REMOVE TEST SIZE
        /*this.canvas.width = datas.width;
        this.canvas.height = datas.height;

        this.canvas.style.width = datas.width;
        this.canvas.style.height = datas.height;*/

        this.canvas.width = datas.width;
        this.canvas.height = datas.height;

        this.canvas.style.width = window.innerWidth;
        this.canvas.style.height = window.innerHeight;

        $('#canvas_id').css({
          "width":$('body').width()+'px !important',
          "height":$('body').height()+'px !important'
        });

        this.stage = new createjs.Stage("drawing");
        this.stage.autoClear = true;
        this.stage.update();

        this.currentShape = [];
        var s = new createjs.Shape();
        this.currentShape[0] = s;
        var g = s.graphics;

        g.beginStroke("#000000");
        this.stage.addChild(s);

        //this.stage = new createjs.Stage("drawing");
        this.stage.autoClear = true;
        this.stage.update();
    },
    drawing_point:function(datas){
        console.log('drawing_point with new shape then set oldX Y enstroke', datas.x );
        this.oldX = datas.x;
        this.oldY = datas.y;
        //var pt = new createjs.Point(datas.x, datas.y);
        this.currentShape[this.currentShape.length-1].graphics.endStroke().endFill();
        //this.currentShape[this.currentShape.length].graphics.endStroke();
        var s = new createjs.Shape();
        this.currentShape[this.currentShape.length] = s;
        var g = s.graphics;
        g.beginStroke("#000000");
        this.stage.addChild(s);
        g.moveTo(datas.x, datas.y);
    },
    drawing : function(datas){
      /*
      if(typeof this.oldX === "undefined"){
        this.oldX = datas.x;
        this.oldY = datas.y;
      }
      */
      console.log(this.oldX);
      //console.log('draw ', this.currentShape[this.currentShape.length-1].graphics);
      var pt = new createjs.Point(datas.x, datas.y);
      var midPoint = new createjs.Point(this.oldX + pt.x>>1, this.oldY+pt.y>>1);
      if(typeof this.currentShape[this.currentShape.length-1] != "undefined"){
          this.currentShape[this.currentShape.length-1].graphics.setStrokeStyle(datas.strokestyle.size, datas.strokestyle.stylingW, datas.strokestyle.stylingH);
          this.currentShape[this.currentShape.length-1].graphics.moveTo(midPoint.x, midPoint.y);
          this.currentShape[this.currentShape.length-1].graphics.curveTo(this.oldX, this.oldY, this.oldMidX, this.oldMidY);
      }
      this.oldX = pt.x;
      this.oldY = pt.y;

      this.oldMidX = midPoint.x;
      this.oldMidY = midPoint.y;
      this.stage.update();
      /*
      app.socket.emit("njoy", {
        "status":"drawing",
        "strokestyle":{
          "size":this.pencil.size,
          "styleH":this.pencil.styleH,
          "styleW":this.pencil.styleW,
        },
        "type":"moveTo",
        "curve":{
          "oldX":this.oldX,
          "oldY":this.oldY,
          "oldMidX":this.oldMidX,
          "oldMidY":this.oldMidY
        }
      });
      */

      /*
      if(typeof this.oldX === "undefined"){
        this.oldX = datas.x;
        this.oldY = datas.y;
      }
      this.currentShape[this.currentShape.length-1].graphics.setStrokeStyle(datas.strokestyle.size, datas.strokestyle.stylingW, datas.strokestyle.stylingH);
      //this.currentShape[this.currentShape.length-1].graphics.moveTo(this.oldX, this.oldY);
      this.currentShape[this.currentShape.length-1].graphics.moveTo(datas.x, datas.y);
      this.currentShape[this.currentShape.length-1].graphics.curveTo(datas.curve.oldX, datas.curve.oldY, datas.curve.oldMidX, datas.curve.oldMidY);
      this.oldX = datas.x;
      this.oldY = datas.y;
      */


      //this.stage.update();
      /*this.stage.clear();
      if(typeof datas.shape !== "undefined"){
        for(var i=0; i<datas.shape.length; i++){
          this.stage.append(datas.shape[i]);
        }
      }*/
      //this.stage.update();
    },
    destroy : function(){
        console.log('destroy receptor');
    }
}

var drawer = function(canvas_id, width, height){
  this.canvas = document.getElementById(canvas_id);
  // TODO REMOVE TEST SIZE
  this.canvas.width = width;
  this.canvas.height = height;

  this.canvas.style.width = width;
  this.canvas.style.height = height;
  $('#canvas_id').css({
    "width":$('body').width()+'px !important',
    "height":$('body').height()+'px !important'
  })
  this.stage = new createjs.Stage(canvas_id);
  this.stage.autoClear = true;
  this.stage.update();

  this.currentShape = [];
  var s = new createjs.Shape();
  this.currentShape[0] = s;
  var g = s.graphics;

  g.beginStroke("#000000");
  this.stage.addChild(s);
  /* TODO : on receive ticker from user update stage */
  //createjs.Ticker.addEventListener("tick", $.proxy(function(){this.update();},this));
}
