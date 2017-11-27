var regis = {
    init:function(){
        console.log('regis');
        /*$('#video_button').on('click', function(){
        app.socket.emit("njoy", {"status":"video", "file":"ressources/1703_NJOY_ANIM_LOGO_FB.mp4"});
        });
        $('#play_video').on('click', function(){
        app.socket.emit("njoy", {"status":"play_video", "file":"ressources/1703_NJOY_ANIM_LOGO_FB.mp4"});
        });
        $('#pause_video').on('click', function(){
        app.socket.emit("njoy", {"status":"pause_video", "file":"ressources/1703_NJOY_ANIM_LOGO_FB.mp4"});
        });
        $('#stop_video').on('click', function(){
        app.socket.emit("njoy", {"status":"stop_video", "file":"ressources/1703_NJOY_ANIM_LOGO_FB.mp4"});
        });

        $('#audio_button').on('click', function(){
        app.socket.emit("njoy", {"status":"audio", "file":"ressources/Kids_mp3.mp3"});
        });
        $('#play_audio').on('click', function(){
        app.socket.emit("njoy", {"status":"play_audio", "file":"ressources/Kids_mp3.mp3"});
        });
        $('#pause_audio').on('click', function(){
        app.socket.emit("njoy", {"status":"pause_audio", "file":"ressources/Kids_mp3.mp3"});
        });
        $('#stop_audio').on('click', function(){
        app.socket.emit("njoy", {"status":"stop_audio", "file":"ressources/Kids_mp3.mp3"});
        });

        $('#picture_button').on('click', function(){
        app.socket.emit("njoy", {"status":"picture", "file":"ressources/crazy_show_logo.svg"});
        });*/
        $('[data-appid]').on('click', function(e){
            app.selected_app = app.activities.activities[parseInt($(this).attr('data-appid'))];
            ui.navigate('/app_dashboard');
            ///id/'+$(this).attr('data-appid')
            //+$(this).attr('data-appid')
        });
  },
    destroy : function(){
        console.log('destroy default');
    }
}
