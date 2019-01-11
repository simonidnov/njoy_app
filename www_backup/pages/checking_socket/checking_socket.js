var checking_socket = {
  init:function(){
    TweenMax.to($('#socket_progress .progress'), .2, {width:"100%", onUpdate:function(){
      $('#socket_progress .status').html(Math.round(parseInt(($('#socket_progress .progress').css('width').replace('px', '')) / parseInt($('#socket_progress .bar').css('width').replace('px', ''))*100))+"%");
    }, onComplete:function(){
      ui.navigate('/synchro');
    }});
  },
  destroy : function(){
    console.log('destroy default');
  }
}
