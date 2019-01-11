var navigation = {
    templates: {
        header: null,
        footer: null
    },
    default_page : "page/default",
    page_infos : {
        descriptor:null,
        params:null
    },
    init:function(){
        alert('init nav');
        this.load_templates();
    },
    set_listeners : function(){
        $(window).on('hashchange', $.proxy(function(){
            this.set_params();
        }, this));
        if(window.location.hash === ""){
            window.location.hash = this.default_page;
        }else{
            this.set_params();
        }
    },
    set_params : function(){
        var param_array = window.location.hash.replace('#', '').split('/');
        var params = {};
        for(var i=0; i<param_array.length; i+=2){
            params[param_array[i]] = param_array[i+1];
        }
        this.page_infos.params = params;
        this.load_dependencies();
    },
    load_dependencies : function(){
        console.log('load dependencies');
        $.getJSON('pages/'+this.page_infos.params.page+'/descriptor.json', $.proxy(function(e){
            console.log('set page params');
            this.page_infos.descriptor = JSON.parse(JSON.stringify(e));
            console.log(this.page_infos.descriptor);
        }, this));
    },
    navigate : function(){

    },
    back : function(){
        ui.direction = ui.descriptor.header.nav_left[0].direction;
        ui.navigate(ui.descriptor.header.nav_left[0].link);
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
            this.set_listeners();
        }, this), 200);
    }
}
