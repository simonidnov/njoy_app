var app_tools = {
    component_template: null,
    is_mobile : false,
    init: function() {
        setTimeout($.proxy(function() {
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
            $.get('pages/app_tools/components.tmpl', $.proxy(function(e) {
                this.component_template = _.template(e);
            }, this));
            $('[data-appid]').on('click', function() {
                app.selected_tool = app.selected_app.apps[parseInt($(this).attr('data-appid'))];
                $('.column.components').html(app_tools.component_template(app.selected_app.apps[parseInt($(this).attr('data-appid'))]));
                app_tools.set_events();
                app_tools.components_scroll.refresh();
                
                ui.setListeners();
                if(app_tools.is_mobile){
                    $('header .left_nav .head_button').off('click').on('click', function(e){
                        e.preventDefault();
                        TweenMax.to($('#components_scroll'), .5, {
                            "left":"100%",
                            ease:Power4.easeIn,
                            onComplete:function(){
                                ui.setListeners();
                            }
                        });
                        return false;
                    });
                    TweenMax.to($('#components_scroll'), .5, {
                        "left":0,
                        delay:.5,
                        ease:Power4.easeOut
                    });
                }
                /*$('[data-component="golden_family"]').on('click', function(){
                    console.log('is golden family');
                });
                $('[data-type="response"]').on('click', function(){
                    console.log('intercept hitted area');
                });*/
            });
            $('#open_tools').on('click', function(){
                if($('#tools_scroll').position().top !== 0){
                    $('header .left_nav .head_button').css('display', 'none');
                    TweenMax.to($('#tools_scroll'), .5, {top:0, ease:Power4.easeOut}); 
                }else{
                    $('header .left_nav .head_button').css('display', 'block');
                    TweenMax.to($('#tools_scroll'), .5, {top:"100%", ease:Power4.easeIn}); 
                }
            });
            
            $('#connexion_check').off('click').on('click', function(){
                ui.open_wifi_settings();
            });
            $('#server_reboot').off('click').on('click', function(){
                ui.reboot_server();
                ui.navigate('/');
            });
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
        $('.tab_bar li').off('click').on('click', function(){
            $('.tab_bar li').removeClass('selected');
            $('.section_tab').css('display', 'none');
            $('#section_'+$(this).attr('id')).css('display', 'block');
            $(this).addClass('selected');
            app_tools.components_scroll.refresh();
        });
    },
    destroy: function() {
        console.log('destroy app_tools');
    }
}