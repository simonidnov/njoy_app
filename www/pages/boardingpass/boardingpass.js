function boardingpass(){
    console.log('boardingpass WILL BE LOAD PLEASE WAIT...');
}
boardingpass.init = function(){
    // ON DEFINI LE WORDING DES LEVELS POUR CHERCHER DANS LE JSON COTE RECEPTOR BOARDINGPAS
    this.levels = ["co-pilote", "pilote", "expert"];
    // ON CREE UN ARRAY DE QUESTIONS VIDE EN ATTENTE DE RECEPTION DE LA SELECTIOND DU RECEPTOR
    this.questions = [];
    // LORSUQ'ON LANCE L'APPLI PAR DEFAUT ON EST SUR LA PREMIERE TAB DONC ON SET LE LEVEL SUR ZERO
    this.level = 0;
    // ON ENREGISTRE LES SETTINGS AU PREMIER LANCEMENT
    this.settings = {
        chronoline:false,
        chronolineduration:"00:00",
        chronolap:false,
        chronolapduration:"00:00"
    }
    var self = this;
    // ON SET LE TAB CALLBACK DE L'APP TOOLS POUR CHANGER DE NIVEAU DE QUESTION
    app_tools.tab_callback = function(level){
        ui.popin({
            "title":"Attention",
            "message":"êtes vous certain de vouloir réinitialiser le jeu en mode niveau "+self.levels[parseInt(level)]+" ?",
            "buttons":[
                {"label":"Oui", "color":"orange"},
                {"label":"Non", "color":"green"}
            ]
        }, function(e){
            if(parseInt(e) === 0){
                self.level = level;
                // TODO, AVANT DE RAFRAICHIR ON AFFICHE UNE POPIN CAR LES QUESTIONS PRÉCÉDENTES SERONT PERDUES
                // LORSQU'ON CHANGE DE NIVEAU ON DEMANDE LES QUESTION DU NIVEAU SSELECTIONNÉ
                app.socket.emit('boardingpass', {"status":"boarding"});
                this.questions = [];
                this.reset_template();
            }
        }.bind(this));
        
    }.bind(this);
    // ICI ON UTILISE UN SUB COMPONENT QUI N'EST PAS PAR DEFAULT 
    $.get("pages/boardingpass/boardingpass.tmpl", $.proxy(function(e) {
        this.subcomponent_template = _.template(e);
        this.reset_template();
    }, this));
    // ON RESET LE SOCKET CALLBACK GLOBAL ET ON CATCH LES EVENEMENTS
    app.socket_callback = function(e) {
        //console.log("socket callback boardingpass :::: ", e);
        switch(e.status){
            case 'getQuestions':
                // ON NE FAIT RIEN DE CE COTÉ, LORSQUE LE CALL EST ENVOYÉ ON ATTEND UN SENDQUESTION DEPUIS LE RECEPTOR
                return false;
                break;
            case 'sendQuestions':
                // SEND QUESTION EST ENVOYÉ DEPUIS LE RECEPTOR, LORSQU'ON LE RECOIS ON MET À JOUR TOUT LE TEMPLATE
                this.questions = e.questions;
                this.reset_template();
                break;
            case 'refreshLine':
                // ICI ON NE FAIT RIEN, ON ATTEND QUE LE RECEPTOR ENVOIE UN EVENEMENT SEND LINE
                break;
            case 'valideLine':
                // ICI ON NE FAIT RIEN, ON ATTEND QUE LE RECEPTOR ENVOIE UN EVENEMENT SEND LINE
                break;
            case 'sendLine':
                // Lorsqu'on reçois une nouvelle ligne, on met à jour la ligne dans le template :
                this.update_line();
                break;
            case 'questionRefreshed':
                //console.log(e.id, e.question);
                this.questions[e.id] = e.question;
                var element = $('.destinations li[data-line="'+e.id+'"]').eq(0);
                element[0].setAttribute('data-id', e.question.id);
                element.find('.ID').html(e.question.id);
                element.find('.question').html(e.question.question);
                element.find('.answer').html('<span>réponse : </span>'+e.question.answer);
                element.find('[data-bpaction="refresh"]').eq(0)[0].setAttribute('data-id', e.question.id);
                element.find('[data-bpaction="validate"]').eq(0)[0].setAttribute('data-id', e.question.id);
                //element.find('[data-line]').setAttribute(e.id);
                break;
        }
    }.bind(this);
    // PAR DEFAUT ON DEMANDE LES QUESTIONS DU NIVEAU ZERO (OU CO-PILOTE) AU RECEPTOR
    // app.socket.emit('boardingpass', {"status":"getQuestions", "level":this.level});
    this.questions = [];
    $.get("pages/boardingpass/boardingpass.tmpl", $.proxy(function(e) {
        this.subcomponent_template = _.template(e);
        this.reset_template();
    }, this));
}
boardingpass.reset_template = function(){
    console.log('reset template ', this.questions);
    $('.column.components .subcomponent').html(this.subcomponent_template({"questions":this.questions}));
    this.set_events();
}
boardingpass.set_events = function(){
    var self = this;
    $('[data-bpaction]').off(ui.event).on(ui.event, function(event){
        // ON CHECK LA DEMANDE DU REGISSEUR
        var ID = $(this).attr('data-id'),
            LINE = $(this).attr('data-line');

        var QUESTION = self.questions[LINE];

        console.log('QUESTION ::: ', QUESTION, " ID ::: ", ID, " :::  WHERE :::: ", QUESTION);
        
        switch($(this).attr('data-bpaction')){
            case 'refresh':
                // LE REGISSEUR A APPUYÉ SUR LA DEMANDE DE RAFRAICHISSEMENT D'UNE LIGNE
                ui.popin({
                    "title":"Rafraîchir",
                    "message":"Êtes-vous sure de vouloir rafraîchir la ligne "+ LINE+ " : "+ ID+ " ?",
                    "buttons":[
                        {"label":"Oui", "class":"error"},
                        {"label":"Annuler", "class":"success"}
                    ]
                }, function(e){
                    if(parseInt(e) === 0){
                        app.socket.emit('boardingpass', {"status":"refreshLine", "id":ID, "line":LINE, "value":""});
                        event.preventDefault();
                        return false;
                    }
                });
                break;
            case 'validate':
                // LE REGISSEUR A VALIDÉ UNE DESTINATION

                ui.popin({
                    "title":"Valider la réponse",
                    "message":"êtes-vous sure de valider cette réponse : <b>"+QUESTION.answer+"</b> ?",
                    "buttons":[
                        {"label":"Oui", "class":"error"},
                        {"label":"Annuler", "class":"success"}
                    ]
                }, function(e){
                    if(parseInt(e) === 0){
                        app.socket.emit('boardingpass', {"status":"updateLine", "id":ID, "line":LINE, "value":QUESTION.answer, "question":QUESTION});
                        event.preventDefault();
                        return false;
                    }
                });
                break;
            case 'start':
                console.log(self.settings);
                app.socket.emit('boardingpass', {"status":"getQuestions", "level":self.level, "settings":self.settings});
                break;
        }
    });
    $('#linechronocheck').on(ui.event, function(){
        if($(this).find('.radio_ui').hasClass('checked')){
            $(this).find('.radio_ui').removeClass('checked');
        }else{
            $(this).find('.radio_ui').addClass('checked');
        }
        var enable = $(this).find('.radio_ui').hasClass('checked');
        if(enable){
            $('#linechrono').css('display', "block");
        }else{
            $('#linechrono').css('display', "none");
        }
        self.settings.chronoline = enable;
        self.settings.chronolineduration = $('#chronoline').val();
    });
    $('#globalchronocheck').on(ui.event, function(){
        if($(this).find('.radio_ui').hasClass('checked')){
            $(this).find('.radio_ui').removeClass('checked');
        }else{
            $(this).find('.radio_ui').addClass('checked');
        }
        var enable = $(this).find('.radio_ui').hasClass('checked');
        if(enable){
            $('#globalchrono').css('display', "block");
        }else{
            $('#globalchrono').css('display', "none");
        }
        self.settings.chronolap = enable;
        self.settings.chronolapduration = $('#chronotime').val();
    });
    
    $('#chronotime').on('change', function(){
        self.settings.chronolapduration = $(this).val();
    });
    $('#chronoline').on('change', function(){
        self.settings.chronolineduration = $(this).val();
    });
    

    // ON INTERCEPTE LE BOUTON BACK
    $('[data-direction="back"]').off(ui.event).on(ui.event, function(event){
        ui.popin({
            "title":"Attention",
            "message":"Si vous revenez en arrière, la partie sera terminée, êtes-vous sure de vouloir continuer ?",
            "buttons":[
                {"label":"Oui", "class":"error"},
                {"label":"Non", "class":"success"}
            ]
        }, function(e){
            if(parseInt(e) === 0){
                // self.level = level;
                // TODO, AVANT DE RAFRAICHIR ON AFFICHE UNE POPIN CAR LES QUESTIONS PRÉCÉDENTES SERONT PERDUES
                // LORSQU'ON CHANGE DE NIVEAU ON DEMANDE LES QUESTION DU NIVEAU SSELECTIONNÉ
                // app.socket.emit('boardingpass', {"status":"getQuestions", "level":self.level});
                ui.navigate($('[data-direction="back"]').attr('data-navigate'));
                event.preventDefault();
                return false;
            }
        });
    });

    $('[data-appid]').off(ui.event).on(ui.event, function(event) {
        var appid = $(this).attr('data-appid'),
            self = this;
        ui.popin({
            "title":"Attention",
            "message":"Vous allez réinitialiser l'état du jeu, êtes-vous certain de vouloir quitter le jeu actuel ?",
            "buttons":[
                {"label":"Oui", "class":"error"},
                {"label":"Non", "class":"success"}
            ]
        }, function(e){
            if(parseInt(e) === 0){
                // self.level = level;
                // TODO, AVANT DE RAFRAICHIR ON AFFICHE UNE POPIN CAR LES QUESTIONS PRÉCÉDENTES SERONT PERDUES
                // LORSQU'ON CHANGE DE NIVEAU ON DEMANDE LES QUESTION DU NIVEAU SSELECTIONNÉ
                // app.socket.emit('boardingpass', {"status":"getQuestions", "level":self.level});
                self.settings = {
                    chronoline:false,
                    chronolineduration:"00:00",
                    chronolap:false,
                    chronolapduration:"00:00"
                }
                app_tools.setAppId(appid);
                event.preventDefault();
                return false;
            }
        });
    });
}
boardingpass.update_line = function(){
    
}

function str_pad_left(string, pad, length) {
    return (new Array(length+1).join(pad)+string).slice(-length);
}