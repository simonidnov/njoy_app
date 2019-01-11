var ui = {
    event : "click",
    templates: {
        header: null,
        footer: null
    },
    page_params: {
        page: "default",
        params: {}
    },
    init: function() {
        if('ontouchstart' in window){
            this.event = 'click';
        }
        if(typeof StatusBar !== "undefined"){
            StatusBar.hide();
        }
        this.load_templates();
        this.setListeners();
    },
    load_templates: function() {
        _.each(_.keys(this.templates), function(key, index) {
            $.get('views/' + key + '.tmpl', $.proxy(function(e) {
                ui.templates[key] = _.template(e);
            }, this));
        });
        if ($('#ui_layer').length === 0) {
            $('body').append('<div class="ui_layer" id="ui_layer"></div>');
        }
        if ($('#ui_templates').length === 0) {
            $('body').append('<div class="ui_templates" id="ui_templates"></div>');
            $.get('views/ui/popin.tmpl', $.proxy(function(e) {
                ui.templates.popin = _.template(e);
            }, this));
            $.get('views/ui/notification.tmpl', $.proxy(function(e) {
                ui.templates.notification = _.template(e);
            }, this));
        }
        setTimeout($.proxy(function() {
            $('body').append(this.templates.header({}));
            $('body').append(this.templates.footer({}));
            this.navigate(this.page_params.page);
            this.setListeners();
        }, this), 500);
    },
    test_popin : function(){
        ui.popin({
                "illus":"url",
                "title":"test",
                "message":"message test",
                "buttons":[
                    {"label":"button 1"},
                    {"label":"button 2"}
                ]
            }, function(e){console.log(e);});
    },
    popin : function(params, callback){
        if($('#popin_ui_content').length > 0){
            $('#popin_ui_content').remove();
        }
        ui.popin_callBack = callback;
        $('body').append(ui.templates.popin(
            params
        ));
        $('#popin_ui_content .popin').css('top', '100%');
        TweenMax.to($('#popin_ui_content .popin'), .5, {top:0, ease:Back.easeOut});
        $('[data-popbutton]').on(ui.event, function(e){
           ui.close_popin($(this).attr('data-popbutton'));
        });
        $('#close_popin').on(ui.event, function(){
            ui.close_popin();
        });
        //setTimeout(function(){ui.close_popin();}, 2000);
    },
    close_popin:function(e){
        TweenMax.to($('#popin_ui_content .popin'), .5, {top:"100%", opacity:0, ease:Back.easeIn});
        TweenMax.to($('#popin_ui_content'), .5, {opacity:0, delay:.5, onComplete:function(){
            $('#popin_ui_content').remove();
        }});
        ui.popin_callBack(e);
    },
    openTeam : function(){
      $('.teams').addClass('opened');
      $('.teams .cross_button').off('click').on('click', $.proxy(function(){
        this.closeTeam();
      },this));
        $('#add_team').off('click').on('click', function(e){
            e.preventDefault();
            if($('#team_name').val() === ""){
                 ui.popin({
                    "illus":"img/logout_illus.svg",
                    "title":"TEAM",
                    "message":"Pour ajouter une équipe vous devez indiquer un nom dans",
                    "buttons":[
                        {"label":"OK"}
                    ]
                }, function(e){
                    if(parseInt(e) === 1){
                        ui.navigate('/');
                    }
                });
                return false;
            } 
            if(_.where(app.teams, {label:$('#team_name').val()}).length > 0){
                ui.popin({
                    "illus":"img/logout_illus.svg",
                    "title":"TEAM",
                    "message":"Le nom de l'équipe "+$('#team_name').val()+" existe déjà, veuillez choisir un nom d'équipe différent",
                    "buttons":[
                        {"label":"OK"}
                    ]
                }, function(e){
                    if(parseInt(e) === 1){
                        ui.navigate('/');
                    }
                });
                return false;
            }
            app.socket.emit("njoy", {
                status:"new_team",
                new_team:{
                    label:$('#team_name').val(),
                    score:0
                }
            });
            $('#team_name').val('');
        });
    },
    closeTeam : function(){
      $('.teams').removeClass('opened');
    },
    set_teams : function(){
        $('#team_list').html('');
        if(typeof app.teams === "undefined"){
            return false;
        }
        var temp_team = _.template($('#team_template').html());
        for(var i=0; i<app.teams.length; i++){
            app.teams[i].id = i;
            $('#team_list').append(temp_team(app.teams[i]));
        }
        $('.delete_team_button').off('click').on('click', function(){
            app.socket.emit("njoy", {
                status:"delete_team", 
                id:$(this).attr('data-id')
            });
        });
        $('.less_score_button').off('click').on('click', function(){
            $(this).parent().find('.score').val(parseInt($(this).parent().find('.score').val())-1);
            app.socket.emit("njoy", {
                status:"team_score", 
                id:$(this).attr('data-id'),
                score:$(this).parent().find('.score').val()
            });
        });
        $('.more_score_button').off('click').on('click', function(){
            $(this).parent().find('.score').val(parseInt($(this).parent().find('.score').val())+1);
            app.socket.emit("njoy", {
                status:"team_score", 
                id:$(this).attr('data-id'),
                score:$(this).parent().find('.score').val()
            });
        });
        $('.set_score_input').off('blur').on('blur', function(){
            app.socket.emit("njoy", {
                status:"team_score", 
                id:$(this).attr('data-id'),
                score:$(this).parent().find('.score').val()
            });
        });
    },
    setListeners: function() {
        $('[data-navigate]').off(ui.event).on(ui.event, function(event) {
            if($(this).attr('data-navigate') === "/team"){
              ui.openTeam();
              return false;
            }
            if(typeof $(this).attr('data-direction') !== "undefined"){
                ui.direction = $(this).attr('data-direction');
            }
            if($(this).attr('data-ambiant') !== ""){
                app.socket.emit("njoy", {status:"audio", file:$(this).attr('data-ambiant'), data:"", tools:app.selected_tool});
            }
            ui.navigate($(this).attr('data-navigate'));
            event.preventDefault();
            return false;
        });
        $('[data-action]').off(ui.event).on(ui.event, function(){
            switch($(this).attr('data-action')){
                case 'drawing':
                    app.socket.emit("njoy", {status:"drawer"});
                    break;
                case 'cast':
                    var status = {};
                    if(typeof $(this).attr('data-type') !== "undefined") {
                        status['status'] = $(this).attr('data-type');
                    }
                    if(typeof $(this).attr('data-file') !== "undefined") {
                        status['file'] = $(this).attr('data-file');
                    }
                    if(typeof $(this).attr('data-size') !== "undefined") {
                        status['size'] = $(this).attr('data-size');
                    }
                    if(typeof $(this).attr('data-menu') !== "undefined") {
                        status['menu'] = $(this).attr('data-menu');
                    }
                    if(typeof $(this).attr('data-component') !== "undefined"){
                        status['component'] = $(this).attr('data-component');
                    }
                    if(typeof $(this).attr('data-componentid') !== "undefined"){
                        status['component_id'] = $(this).attr('data-componentid');
                    }
                    if(typeof $(this).attr('data-chronos') !== "undefined"){
                        status['chronos'] = $(this).attr('data-chronos');
                    }
                    if(typeof $(this).attr('data-data') !== "undefined"){
                        status['data'] = $(this).attr('data-data');
                    }
                    if(typeof $(this).attr('data-chronostype') !== "undefined"){
                        status['chronos_type'] = $(this).attr('data-chronostype');
                    }
                    if($(this).attr('data-type') === "audio"){
                        if($(this).find('img').attr('src') === "img/pause_icon.svg"){
                            $(this).find('img').attr('src', "img/play_icon.svg");
                            status['status'] = "pause_audio";
                        }else{
                            $('[data-type="audio"] img').attr('src', "img/play_icon.svg");
                            $(this).find('img').attr('src', "img/pause_icon.svg");
                        }
                    }
                    if(typeof $(this).attr('data-selectedapp') !== "undefined" && $(this).attr('data-selectedapp') === "true") {
                        //delete app.selected_tool;
                        status['tools'] = app.selected_app;
                    }else{
                        status['tools'] = app.selected_tool;    
                    }
                    //console.log('EMIT ::::::::: status ', status);
                    app.socket.emit("njoy", status);
                    /*switch($(this).attr('data-type')){
                        case 'video':
                            app.socket.emit("njoy", {"status":"video", "file":$(this).attr('data-file')});
                            break;
                        case 'audio':
                            app.socket.emit("njoy", {"status":"audio", "file":$(this).attr('data-file')});
                            break;
                        case 'picture':
                            app.socket.emit("njoy", {"status":"picture", "file":$(this).attr('data-file')});
                            break;
                        case 'object':
                            status = {
                                "status":"object",
                                "menu":$(this).attr('data-menu'),
                                "component":$(this).attr('data-component'),
                                "component_id":$(this).attr('data-componentid'),
                                "tools":app.selected_tool
                            }

                            app.socket.emit("njoy", status);
                            //,"selected_app":app.selected_app
                            break;
                        case 'response':
                            console.log('response');
                            break;
                    }*/
                    $('.choices').css('display', 'none');
                    if($(this).parent().find('.choices').length > 0){
                        $(this).parent().find('.choices').css('display', 'block');
                    }
                    break;
                case 'response':
                    $(this).addClass('checked');
                    app.socket.emit("njoy", {
                        "status":$(this).attr('data-type'),
                        "response":$(this).attr('data-id'),
                        "type":$(this).attr('data-type'),
                        "attributs":$(this).attr('data-attributs'),
                        "word":$(this).attr('data-word')
                    });
                    break;
                default:
                    break;
            }
            //app_tools.components_scroll.refresh();
            //app.socket.emit("njoy", {"status":"video", "file":"ressources/1703_NJOY_ANIM_LOGO_FB.mp4"});
        });
    },
    navigate: function(url) {
        /*var uri = url.split('/')[0];
        if(URIError === "app_dashboard"){
            app.selected_app = app.activities.activities[url.split('/')[1]];
        }*/
        app.socket_callback = null;
        console.log('socket_callback UI');
        app.socket_callback = function(e) {
            //console.log(e);
        }
        if(url.indexOf('logout') !== -1){
            ui.popin({
                "illus":"img/logout_illus.svg",
                "title":"Déconnexion",
                "message":"Si vous continuez vous allez vous déconnecter du serveur.<br/>Êtes vous certain de vouloir continuer ?",
                "buttons":[
                    {"label":"Annuler"},
                    {"label":"Déconnexion", "class":"error"}
                ]
            }, function(e){
                if(parseInt(e) === 1){
                    ui.navigate('/');
                }
            });
            return false;
        }
        //window.history.pushState("", "", url);
        this.setParams(url);
        this.load_dependencies();
        /*switch(url){
          case "/":
            $('body main.app').append(this.templates.default({}));
            break;
          default:
            $('body main.app').append(this.templates.default({}));
            break;
        }*/
    },
    load_dependencies: function() {
        //alert(this.page_params.page);
        (this.page_params.page === "") ? this.page_params.page = "default": this.page_params.page = this.page_params.page;
        /* get descriptor */
        $.getJSON('pages/' + this.page_params.page + '/descriptor.json', function(e) {
            ui.descriptor = JSON.parse(JSON.stringify(e));
            /* load content template */
            $.get('pages/' + ui.page_params.page + '/' + ui.descriptor.content.uri, function(e) {
                $('body').append('<div class="blocker"></div>');
                ui.templates[ui.page_params.page] = _.template(e);
                /* TODO create transitions */
                //$('body main.app').html('');
                $('body main.app').append(ui.templates[ui.page_params.page](ui.descriptor.content.datas));
                $('body main.app .screen').last().css('left', '100%');
                /* load css dependencies */
                for (var c = 0; c < ui.descriptor.dependencies.css.length; c++) {
                    if ($('link[href="pages/' + ui.page_params.page + '/' + ui.descriptor.dependencies.css[c] + '"]').length === 0) {
                        var head = document.getElementsByTagName('head')[0],
                            link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.type = 'text/css';
                        link.href = 'pages/' + ui.page_params.page + '/' + ui.descriptor.dependencies.css[c];
                        link.media = 'all';
                        head.appendChild(link);
                    }
                }
                /* load js class and dependencies */
                for (var j = 0; j < ui.descriptor.dependencies.js.length; j++) {
                    $.getScript('pages/' + ui.page_params.page + '/' + ui.descriptor.dependencies.js[j], function(e) {
                    });
                }
                /* load default page class then init there */
                $.getScript('pages/' + (ui.page_params.page) + '/' + (ui.descriptor.class) + '.js', function(e) {
                    if($('body main.app .screen').length > 2){
                        for(var i=0; i<$('body main.app .screen').length-1; i++){
                            $('body main.app .screen').eq(i).remove();
                        }
                    }
                    if ($('body main.app .screen').length > 1) {
                        if(ui.direction === "back"){
                            TweenMax.to($('body main.app .screen').first(), .5, {
                                left: '100%'
                            });
                            TweenMax.set($('body main.app .screen').last(), {left:"-100%"});
                        }else{
                            TweenMax.to($('body main.app .screen').first(), .5, {
                                left: '-100%'
                            });
                        }
                        TweenMax.to($('body main.app .screen').last(), .5, {
                            left: '0%',
                            onComplete: function() {
                                window[ui.descriptor.class].init();
                                $('body main.app .screen').first().remove();
                                ui.init_scroll_view();
                                $('.blocker').remove();
                            }
                        });
                        ui.direction = "";
                    } else {
                        $('body main.app .screen').last().css('left', '0%');
                        window[ui.descriptor.class].init();
                        $('.blocker').remove();
                        ui.init_scroll_view();
                    }
                });
                /* setting header */
                if (!_.isUndefined(ui.descriptor.header) && ui.descriptor.header.display === true) {
                    $('header').css('top', '0px');
                    ui.init_navbar();
                } else {
                    $('header').css('top', '-80px')
                        .remove('.header-navbar');
                }
                /* set footer */
                if (ui.descriptor.footer.display !== true) {
                    $('footer').css('bottom', '-80px');
                } else {
                    $('footer').css('bottom', '0px');
                }
                ui.setListeners();

            });
        });
    },
    display_error: function(datas) {
        $('.ui_layer').append(ui.templates.notification(datas));
        $('.cross_close').off(ui.event).on(ui.event, function() {
            $(this).parent().remove();
        });
        TweenMax.to($('.notification'), .5, {opacity:0, delay:1.5, onComplete:function(){
            $('.notification').remove();
        }})
    },
    setParams: function(url) {
        url = url.replace('/', '').split('/');
        this.page_params.page = url[0];
        this.page_params.params = {};
        for (var i = 1; i < url.length; i += 2) {
            this.page_params.params[url[i]] = url[i + 1];
        }
    },
    init_navbar: function() {
        if(typeof ui.descriptor.header.nav_left !== "undefined"){
            $('header .left_nav').remove();
            for(var i=0; i<ui.descriptor.header.nav_left.length; i++){
                $('header').append('<div class="left_nav"><div class="head_button" data-navigate="'+ui.descriptor.header.nav_left[i].link+'"><div class="icon" style="background-image:url(img/'+ui.descriptor.header.nav_left[i].icon+'.svg);"></div><span>'+ui.descriptor.header.nav_left[i].label+'</span></div></div>');
                if(typeof ui.descriptor.header.nav_left[i].direction !== "undefined"){
                    $('[data-navigate="'+ui.descriptor.header.nav_left[i].link+'"]').attr('data-direction', ui.descriptor.header.nav_left[i].direction);
                }
            }
            for(var i=0; i<ui.descriptor.header.nav_right.length; i++){
                if($('.right_nav').length === 0){
                    $('header').append('<div class="right_nav"></div>');
                }else{
                    $('header .right_nav').html('');
                }
                $('header .right_nav').append('<div class="head_button" data-navigate="'+ui.descriptor.header.nav_right[i].link+'"><div class="icon" style="background-image:url(img/'+ui.descriptor.header.nav_right[i].icon+'.svg);"></div><span>'+ui.descriptor.header.nav_right[i].label+'</span></div>');
                if(typeof ui.descriptor.header.nav_right[i].direction !== "undefined"){
                    $('[data-navigate="'+ui.descriptor.header.nav_right[i].link+'"]').attr('data-direction', ui.descriptor.header.nav_right[i].direction);
                }
            }
        }
        if (!_.isUndefined(ui.descriptor.header.tab_bar) && ui.descriptor.header.tab_bar.length > 0) {
            $.get('views/header-navbar.tmpl', $.proxy(function(e) {
                var temp = _.template(e);
                $('header').append(temp(ui.descriptor.header));
                $('header .select_bar').css({
                    'width': $('.header-navbar ul li').first().width(),
                    'left': $('.header-navbar ul li').first().position().left
                });
                //$(window).on('resize', function(){
                //  resizeTabNav();
                //});
                resizeTabNav();

                function resizeTabNav() {
                    $('header .select_bar').css({
                        'width': $('.header-navbar ul li.selected').first().outerWidth(),
                        'left': $('.header-navbar ul li.selected').first().position().left
                    });
                }
                $('header .header-navbar li').off(ui.event).on(ui.event, function() {
                    $('header .header-navbar li').removeClass('selected');
                    $(this).addClass('selected');
                    resizeTabNav();
                });
                /*
                ui.navbar_scroll = new IScroll('#header_navbar_wrapper',{
                    mouseWheel:true,
                    click: true,
                    useTransition: true
                });
                */
            }, this));
        }
    },
    init_scroll_view: function() {
        $('.screen').css({'height':window.innerHeight-$('header').height(), "overflow":"hidden"});
        $('.screen .wrapper').css({'height':"100%", 'width':"100%", "overflow":"hidden"});
        $('.screen .wrapper .scroller').css({'display':"block", "width":"100%"});
        /*if($('.screen .wrapper .scroller').length === 1){
            if(typeof IScroll !== "undefined"){
                
                ui.page_scroll = new IScroll('#screen_wrapper',{
                    mouseWheel:true,
                    click: true,
                    useTransition: true
                });
            }
        }*/
    },
    open_wifi_settings : function(){
        if (window.cordova && window.cordova.plugins.settings) {
            console.log('openNativeSettingsTest is active');
            window.cordova.plugins.settings.open(
                "wifi",
                function() {
                    console.log('opened settings');
                },
                function () {
                    console.log('failed to open settings');
                }
            );
        } else {
            console.log('openNativeSettingsTest is not active!');
        }
    },
    check_wifi : function() {
        if(typeof navigator.connection !== "undefined") {
            if(navigator.connection.type !== "wifi") {
                ui.popin({
                    "illus":"img/logout_illus.svg",
                    "title":"WIFI",
                    "message":"Pour utiliser l'application vous devez activer la WIFI et vous connecter sur le réseau NJOY avec le mot de passe njoynjoy.",
                    "buttons":[
                        {
                            "label": "Activer la WIFI", 
                            "class": "error"
                        }
                    ]
                }, function(e) {
                    ui.open_wifi_settings();
                });
            }
        }
    },
    reboot_server : function(){
        app.socket.emit("njoy", {"status":"reboot"});
    },
    battery_low : function(){
        ui.popin({
            "illus":"img/energy.svg",
            "title":"BATTERIE",
            "message":"Attention votre batterie est bientôt vide, veuillez brancher votre appareil.",
            "buttons":[
                {"label":"J'ai compris", class:"success"}
            ]
        }, function(e){
        });
    },
    open_webview : function(){
        if (cordova && cordova.InAppBrowser) {
            cordova.InAppBrowser.open(url, target, options);
        }else{
            ui.popin({
                "title":"INFOS",
                "message":"Nous avons un problème avec le chargement de ce contenu, veuillez contacter NJOY pour en savoir plus.",
                "buttons":[
                    {"label":"J'ai compris", class:"success"}
                ]
            }, function(e){
            });
        }
    }
}

/* UI SERVER VERSION 20 11 2018
var ui = {
    templates: {
        header: null,
        footer: null
    },
    page_params: {
        page: "default",
        params: {}
    },
    init: function() {
        this.load_templates();
        this.setListeners();
    },
    load_templates: function() {
        _.each(_.keys(this.templates), function(key, index) {
            $.get('views/' + key + '.tmpl', $.proxy(function(e) {
                ui.templates[key] = _.template(e);
            }, this));
        });
        if ($('#ui_layer').length === 0) {
            $('body').append('<div class="ui_layer" id="ui_layer"></div>');
        }
        if ($('#ui_templates').length === 0) {
            $('body').append('<div class="ui_templates" id="ui_templates"></div>');
            $.get('views/ui/popin.tmpl', $.proxy(function(e) {
                ui.templates.popin = _.template(e);
            }, this));
            $.get('views/ui/notification.tmpl', $.proxy(function(e) {
                ui.templates.notification = _.template(e);
            }, this));
        }
        setTimeout($.proxy(function() {
            $('body').append(this.templates.header({}));
            $('body').append(this.templates.footer({}));
            this.navigate(window.location.pathname);
            this.setListeners();
        }, this), 200);
    },
    test_popin : function(){
        ui.popin({
                "illus":"url",
                "title":"test",
                "message":"message test",
                "buttons":[
                    {"label":"button 1"},
                    {"label":"button 2"}
                ]
            }, function(e){console.log(e);});
    },
    popin : function(params, callback){
        if($('#popin_ui_content').length > 0){
            $('#popin_ui_content').remove();
        }
        ui.popin_callBack = callback;
        $('body').append(ui.templates.popin(
            params
        ));
        $('#popin_ui_content .popin').css('top', '100%');
        TweenMax.to($('#popin_ui_content .popin'), .5, {top:0, ease:Back.easeOut});
        $('[data-popbutton]').on('click', function(e){
           ui.close_popin($(this).attr('data-popbutton'));
        });
        $('#close_popin').on('click', function(){ui.close_popin();})
    },
    close_popin:function(e){
        TweenMax.to($('#popin_ui_content .popin'), .5, {top:"100%", opacity:0, ease:Back.easeIn});
        TweenMax.to($('#popin_ui_content'), .5, {opacity:0, delay:.5, onComplete:function(){
            $('#popin_ui_content').remove();
        }});
        ui.popin_callBack(e);
    },
    setListeners: function() {
        $('[data-navigate]').off('click').on('click', function(event) {
            if(typeof $(this).attr('data-direction') !== "undefined"){
                ui.direction = $(this).attr('data-direction');
            }
            ui.navigate($(this).attr('data-navigate'));
            event.preventDefault();
            return false;
        });
        $('[data-action]').off('click').on('click', function(){
            switch($(this).attr('data-action')){
                case 'cast':
                    var status = {};
                    if(typeof $(this).attr('data-type') !== "undefined"){
                        status['status'] = $(this).attr('data-type');
                    }
                    if(typeof $(this).attr('data-file') !== "undefined"){
                        status['file'] = $(this).attr('data-file');
                    }
                    if(typeof $(this).attr('data-menu') !== "undefined"){
                        status['menu'] = $(this).attr('data-menu');
                    }
                    if(typeof $(this).attr('data-component') !== "undefined"){
                        status['component'] = $(this).attr('data-component');
                    }
                    if(typeof $(this).attr('data-componentid') !== "undefined"){
                        status['component_id'] = $(this).attr('data-componentid');
                    }
                    if(typeof $(this).attr('data-chronos') !== "undefined"){
                        status['chronos'] = $(this).attr('data-chronos');
                    }
                    if(typeof $(this).attr('data-chronostype') !== "undefined"){
                        status['chronos_type'] = $(this).attr('data-chronostype');
                    }

                    status['tools'] = app.selected_tool;
                    app.socket.emit("njoy", status);
                    
                    $('.choices').css('display', 'none');
                    if($(this).parent().find('.choices').length > 0){
                        $(this).parent().find('.choices').css('display', 'block');
                    }
                    break;
                case 'response':
                    $(this).addClass('checked');
                    app.socket.emit("njoy", {
                        "status":$(this).attr('data-type'),
                        "response":$(this).attr('data-id'),
                        "type":$(this).attr('data-type')
                    });
                    break;
                default:
                    break;
            }
            app_tools.components_scroll.refresh();
            //app.socket.emit("njoy", {"status":"video", "file":"ressources/1703_NJOY_ANIM_LOGO_FB.mp4"});
        });
    },
    navigate: function(url) {
        
        app.socket_callback = null;
        app.socket_callback = function(e) {
            console.log(e);
        }
        if(url.indexOf('logout') !== -1){
            ui.popin({
                "illus":"img/logout_illus.svg",
                "title":"Déconnexion",
                "message":"Si vous continuez vous allez vous déconnecter du serveur.<br/>Êtes vous certain de vouloir continuer ?",
                "buttons":[
                    {"label":"Annuler"},
                    {"label":"Déconnexion", class:"error"}
                ]
            }, function(e){
                if(parseInt(e) === 1){
                    ui.navigate('/');
                }
            });
            return false;
        }
        window.history.pushState("", "", url);
        this.setParams(url);
        this.load_dependencies();
        
    },
    load_dependencies: function() {
        //alert(this.page_params.page);
        (this.page_params.page === "") ? this.page_params.page = "default": this.page_params.page = this.page_params.page;
        // get descriptor 
        $.get('/pages/' + this.page_params.page + '/descriptor.json', function(e) {
            ui.descriptor = e;
            // load content template 
            $.get('pages/' + ui.page_params.page + '/' + ui.descriptor.content.uri, function(e) {
                $('body').append('<div class="blocker"></div>');
                ui.templates[ui.page_params.page] = _.template(e);
                // TODO create transitions 
                //$('body main.app').html('');
                $('body main.app').append(ui.templates[ui.page_params.page](ui.descriptor.content.datas));
                $('body main.app .screen').last().css('left', '100%');
                // load css dependencies 
                for (var c = 0; c < ui.descriptor.dependencies.css.length; c++) {
                    if ($('link[href="pages/' + ui.page_params.page + '/' + ui.descriptor.dependencies.css[c] + '"]').length === 0) {
                        var head = document.getElementsByTagName('head')[0],
                            link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.type = 'text/css';
                        link.href = 'pages/' + ui.page_params.page + '/' + ui.descriptor.dependencies.css[c];
                        link.media = 'all';
                        head.appendChild(link);
                    }
                }
                // load js class and dependencies 
                for (var j = 0; j < ui.descriptor.dependencies.js.length; j++) {
                    $.getScript('pages/' + ui.page_params.page + '/' + ui.descriptor.dependencies.js[j], function(e) {
                    });
                }
                // load default page class then init there 
                $.getScript('pages/' + ui.page_params.page + '/' + ui.descriptor.class + '.js', function(e) {
                    if ($('body main.app .screen').length > 1) {
                        if(ui.direction === "back"){
                            TweenMax.to($('body main.app .screen').first(), .5, {
                                left: '100%',
                                ease: Power4.easeInOut
                            });
                            TweenMax.set($('body main.app .screen').last(), {left:"-100%"});
                        }else{
                            TweenMax.to($('body main.app .screen').first(), .5, {
                                left: '-100%',
                                ease: Power4.easeInOut
                            });
                        }
                        TweenMax.to($('body main.app .screen').last(), .5, {
                            left: '0%',
                            ease: Power4.easeInOut,
                            onComplete: function() {
                                window[ui.descriptor.class].init();
                                $('body main.app .screen').first().remove();
                                ui.init_scroll_view();
                                $('.blocker').remove();
                            }
                        });
                        ui.direction = "";
                    } else {
                        $('body main.app .screen').last().css('left', '0%');
                        window[ui.descriptor.class].init();
                        $('.blocker').remove();
                        ui.init_scroll_view();
                    }
                });
                // setting header 
                if (!_.isUndefined(ui.descriptor.header) && ui.descriptor.header.display === true) {
                    $('header').css('top', '0px');
                    ui.init_navbar();
                } else {
                    $('header').css('top', '-80px')
                        .remove('.header-navbar');
                }
                // set footer 
                if (ui.descriptor.footer.display !== true) {
                    $('footer').css('bottom', '-80px');
                } else {
                    $('footer').css('bottom', '0px');
                }
                ui.setListeners();

            });
        });
    },
    display_error: function(datas) {
        $('.ui_layer').append(ui.templates.notification(datas));
        $('.cross_close').off('click').on('click', function() {
            $(this).parent().remove();
        });
    },
    setParams: function(url) {
        url = url.replace('/', '').split('/');
        this.page_params.page = url[0];
        this.page_params.params = {};
        for (var i = 1; i < url.length; i += 2) {
            this.page_params.params[url[i]] = url[i + 1];
        }
    },
    init_navbar: function() {
        if(typeof ui.descriptor.header.nav_left !== "undefined"){
            $('header .left_nav').remove();
            for(var i=0; i<ui.descriptor.header.nav_left.length; i++){
                $('header').append('<div class="left_nav"><div class="head_button" data-navigate="'+ui.descriptor.header.nav_left[i].link+'"><div class="icon" style="background-image:url(img/'+ui.descriptor.header.nav_left[i].icon+'.svg);"></div><span>'+ui.descriptor.header.nav_left[i].label+'</span></div></div>');
                if(typeof ui.descriptor.header.nav_left[i].direction !== "undefined"){
                    $('[data-navigate="'+ui.descriptor.header.nav_left[i].link+'"]').attr('data-direction', ui.descriptor.header.nav_left[i].direction);
                }
            }
        }
        if (!_.isUndefined(ui.descriptor.header.tab_bar) && ui.descriptor.header.tab_bar.length > 0) {
            $.get('views/header-navbar.tmpl', $.proxy(function(e) {
                var temp = _.template(e);
                $('header').append(temp(ui.descriptor.header));
                $('header .select_bar').css({
                    'width': $('.header-navbar ul li').first().width(),
                    'left': $('.header-navbar ul li').first().position().left
                });
                //$(window).on('resize', function(){
                //  resizeTabNav();
                //});
                resizeTabNav();

                function resizeTabNav() {
                    $('header .select_bar').css({
                        'width': $('.header-navbar ul li.selected').first().outerWidth(),
                        'left': $('.header-navbar ul li.selected').first().position().left
                    });
                }
                $('header .header-navbar li').off('click').on('click', function() {
                    $('header .header-navbar li').removeClass('selected');
                    $(this).addClass('selected');
                    resizeTabNav();
                });
                ui.navbar_scroll = new IScroll('#header_navbar_wrapper',{
                    mouseWheel:true,
                    click: true,
                    useTransition: true
                });
            }, this));
        }
    },
    init_scroll_view: function() {
        $('.screen').css({'height':window.innerHeight-$('header').height(), "overflow":"hidden"});
        $('.screen .wrapper').css({'height':"100%", 'width':"100%", "overflow":"hidden"});
        $('.screen .wrapper .scroller').css({'display':"table", "width":"100%"});
        if($('.screen .wrapper .scroller').length === 1){
            if(typeof IScroll !== "undefined"){
                ui.page_scroll = new IScroll('#screen_wrapper',{
                    mouseWheel:true,
                    click: true,
                    useTransition: true
                });
            }
        }
    }
}

*/
