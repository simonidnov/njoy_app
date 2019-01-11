var default_class = {
    init : function () {
        if (typeof app === "undefined" || typeof ui === "undefined" || typeof $ === "undefined") {
            return false;
        }
        if (typeof app.infos.user_name !== "undefined" && typeof app.infos.uuid !== "undefined" && app.infos.user_name !== "" && app.infos.uuid !== "") {
            app.socket.emit('njoy', {status : "disconnect", user_name: app.infos.user_name, uuid: app.infos.uuid});
        }
        $('#ip_config').val("http://10.3.141.1:3000");
        $('#connect_button').off(ui.event).on(ui.event, function () {
            app.ip = $('#ip_config').val();
            app.init_socket(function (e) {
                if(e.status === "socket_connected"){
                    console.log('socket connected');
                    ui.navigate('/checking_socket');
                }else{
                    console.log("error :::: ", e);
                    ui.display_error({"icon":"", "message":"veuillez vérifier que l'adresse indiquée sur l'écran principal correspond à celle indiquée dans le champs ci-dessous."});
                }
            });
        });
        $('#wifi_settings').on(ui.event, function(e){
            ui.open_wifi_settings();
            e.preventDefault();
        });
        ui.check_wifi();
    },
    destroy : function (){
    }
}
