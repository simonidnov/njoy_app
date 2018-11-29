var app_dashboard = {
  init:function(){
    $('.task_list li').on('click', function(){
        if($(this).find('.radio_ui').hasClass('checked')){
            $(this).find('.radio_ui').removeClass('checked');
        }else{
            $(this).find('.radio_ui').addClass('checked');
        }
        var enable = true;
        $.each($('.task_list .radio_ui'), function(index, radio){
            if(!$(this).hasClass('checked')){
                enable=false;
            }
        });
        if(enable){
            $('#launch_app').removeClass('disabled');
        }else{
            $('#launch_app').addClass('disabled');
        }
    });
    $('#launch_app').on('click', function(){
        if($('#launch_app').hasClass('disabled')){return false;}
        ui.navigate('/app_tools');
    });
  },
  destroy : function(){
    console.log('destroy default');
  }
}
