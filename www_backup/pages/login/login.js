var login = {
  init:function(){
    $('form').submit(function(e){
      console.log('submit');
      e.preventDefault();
      if($('#pseudo').val() === ""){
        return false;
      }
      app.infos.user_name = $('#pseudo').val();
      app.socket_callback = function(e){
          if(e.status === "login_error"){
            ui.display_error({"icon":"", "message":e.infos.message});
            return false;
          }
          //if(app.infos.regis){
            ui.navigate('/regis');
          //}else{
          //    ui.navigate('/dashboard');
          //}
      }
      app.socket.emit('njoy', {status:"connect", user_name:app.infos.user_name, uuid:app.infos.uuid});
      return false;
    });
    $('#pseudo').on('change paste keyup', function(){
      if($('#pseudo').val() === ""){
        $('#connect_button').attr('disabled', "true");
      }else{
        $('#connect_button').removeAttr('disabled');
      }
    });
  },
  destroy : function(){
    console.log('destroy default');
  }
}
