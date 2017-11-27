var dashboard = {
  init:function(){
    //app.socket_callback = function(e){
    //  console.log("get activities : ", e);
    //}
    //app.socket.emit("njoy", {"status":"activities"});
    ui.navigate('/drawing');
    $('#video_button').on('click', function(){
      app.socket.emit("njoy", {"status":"play_video", "file":"ressources/1703_NJOY_ANIM_LOGO_FB.mp4"});
    });
    $('#audio_button').on('click', function(){
      app.socket.emit("njoy", {"status":"play_audio", "file":"ressources/Kids_mp3.mp3"});
    });
    $('#picture_button').on('click', function(){
      app.socket.emit("njoy", {"status":"picture", "file":"ressources/crazy_show_logo.svg"});
    });
  },
  destroy : function(){
    console.log('destroy default');
  }
}
