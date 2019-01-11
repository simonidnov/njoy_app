var app_tools = {
    component_template: null,
    is_mobile : false,
    init: function() {
        setTimeout($.proxy(function() {
            /*
            this.tools_scroll = new IScroll('#tools_scroll', {
                mouseWheel: true,
                click: true,
                useTransition: true
            });
            this.apps_scroll = new IScroll('#apps_scroll', {
                mouseWheel: true,
                click: true,
                useTransition: true
            });
            this.components_scroll = new IScroll('#components_scroll', {
                mouseWheel: true,
                click: true,
                useTransition: true
            });
            */
            var self = this;
            console.log('----------------------------------------- APP TOOLS');
            if(typeof app.selected_app.redirect !== "undefined"){
                console.log('app.selected_app.redirect ', app.selected_app.redirect);
                if(typeof app.selected_app.redirect !== "undefined"){
                    app.socket.emit('redirect', {url:app.selected_app.redirect});
                }else{
                    app.socket.emit('redirect', {url:'/receptor'});
                }
            }
            $('#connexion_check').off('click').on('click', function(){
                ui.open_wifi_settings();
            });
            console.log(app.selected_app);
            $.get('pages/app_tools/components.tmpl', $.proxy(function(e) {
                this.component_template = _.template(e);
            }, this));
            $('[data-appid]').on(ui.event, function() {
                self.setAppId($(this).attr('data-appid'));
            });

            $( "#components_scroll" ).scroll(function() {
		    	clearTimeout( $.data( this, "scrollCheck" ) );
    			$.data( this, "scrollCheck", setTimeout(function() {
                    $('.lazy').lazyload({
                        scrollDirection: 'vertical',
                        visibleOnly: true,
                        onError: function(element) {
                            console.log('error loading ' + element.data('src'));
                        }
                    });
                }, 50) );
            });
            $('#open_tools').on(ui.event, function(){
                if($('#tools_scroll').position().top !== 0){
                    $('header .left_nav .head_button').css('display', 'none');
                    TweenMax.to($('#tools_scroll'), .5, {top:0, ease:Power4.easeOut});
                }else{
                    $('header .left_nav .head_button').css('display', 'block');
                    TweenMax.to($('#tools_scroll'), .5, {top:"100%", ease:Power4.easeIn});
                }
            });
            if(typeof app.selected_app.tools.length === 'undefined' || app.selected_app.tools.length === 0){
                $('.app_tools').addClass('notools');
            }
        }, this), 500);
        $(document).on('resize', function(){
            app_tools.resize();
        });
        app_tools.resize();
    },
    resize : function(){
        if(window.innerWidth <= 568){
            this.is_mobile = true;
        }else{
            this.is_mobile = false;
        }
    },
    set_events : function(){
        app_tools.tab_bar = 0;
        $('.tab_bar li').off(ui.event).on(ui.event, function(){
            $('.tab_bar li').removeClass('selected');
            $('.section_tab').css('display', 'none');
            $('#section_'+$(this).attr('id')).css('display', 'block');
            $(this).addClass('selected');
            app_tools.tab_bar = parseInt($(this).attr('id'));
            if(typeof app_tools.tab_callback !== "undefined"){
                app_tools.tab_callback(app_tools.tab_bar);   
            }
        });
    },
    setAppId : function(appid){
        app.selected_tool = app.selected_app.apps[parseInt(appid)];

        $('.column.components').html(app_tools.component_template(app.selected_tool));
        
        // ON s'assure de bien supprimer les sous componsant des apps precedentes 
        delete self.subcomponent_template;
        $('.column.components .subcomponent').html('');

        // SI ON A UNE CLASS JAVASCRIPT SPECIFIQUE ON LA CHARGE ICI 
        if(typeof app.selected_tool.javascripts !== "undefined"){
            for(var j=0; j<app.selected_tool.javascripts.length; j++){
                console.log(app.selected_tool.javascripts[j]);

                console.log("ALREADY LOADED ? ", $('script[src="'+app.selected_tool.javascripts[j]+'"]').length);

                if($('script[src="'+app.selected_tool.javascripts[j]+'"]').length === 0){
                    var scriptElement = document.createElement('script');
                    scriptElement.src = app.selected_tool.javascripts[j];
                    document.body.appendChild(scriptElement);    
                }

                // LORSQUE LE JS EST CHARGÉ on regarde si il y a des actions à executer sur le dom 
                setTimeout(function(){
                    if(typeof app.selected_tool.actions !== "undefined"){
                        for(var a=0; a<app.selected_tool.actions.length; a++){
                            var action = app.selected_tool.actions[a];
                            switch(action.type){
                                case 'javascript':
                                    window[action.class][action.function]();
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }.bind(this), 200);
            }
        }
        
        
        $('#components_scroll').scrollTop(0);

        app_tools.set_events();
        //app_tools.components_scroll.refresh();

        ui.setListeners();
        if(app_tools.is_mobile){
            $('header .left_nav .head_button').off(ui.event).on(ui.event, function(e){
                e.preventDefault();
                TweenMax.to($('#components_scroll'), .5, {
                    "left":"100%",
                    onComplete:function(){
                        ui.setListeners();
                    }
                });
                return false;
            });
            TweenMax.to($('#components_scroll'), .5, {
                "left":0,
                delay:.5
            });
        }
        /*
        $('[data-component="golden_family"]').on('click', function(){
            console.log('is golden family');
        });
        $('[data-type="response"]').on('click', function(){
            console.log('intercept hitted area');
        });
        */
    },
    destroy: function() {
        console.log('destroy app_tools');
    }
}
