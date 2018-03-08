/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    ip : "http://10.3.141.1:3000",
    activities : null,
    callback:null,
    infos: {
        user_name: "",
        uuid: "",
        regis: false,
        users: []
    },
    socket: null,
    initialize: function() {
        if(typeof cordova == "undefined"){
            this.onDeviceReady();
        }else{
            document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        }
    },
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
        //this.load_activities();
        //navigation.init();
        ui.init();
        document.addEventListener("offline", this.is_offline, false);
        window.addEventListener("batterylow", this.onBatteryLow, false);
    },
    load_activities : function(call){
        /*$.getJSON(app.ip+'/activities.json', function(e){
            app.activities = e;
        });*/
        $.getJSON( app.ip+'/activities.json', function() {
            console.log( "success" );
        }).done(function() {
            console.log( "second success" );
        }).fail(function() {
            console.log( "error" );
        }).always(function(e) {
            console.log( "complete" );
            if(typeof e.activities !== "undefined"){
                app.activities = e;
                call("success");
            }else{
                if(typeof e.responseText !== "undefined"){
                    try {
                        console.log("e.responseText ", e.responseText);
                        a = JSON.parse(e.responseText);
                        call("success");
                        console.log("a ", a);
                    } catch(e) {
                        call("fail"); // error in the above string (in this case, yes)!
                        return false;
                    }
                    app.activities = a;
                }
            }
            
        });
    },
    is_offline : function(){
        ui.check_wifi();
    },
    onBatteryLow : function(){
        ui.battery_low();
    },
    init_socket:function(callback){
        this.callback = callback;
        //this.ip = window.location.origin;
        app.infos.uuid = new Date().getTime();
        app.socket_callback = function(e) {
            console.log(e);
        }
        app.socket = io(this.ip, {
            transports: ['websocket', 'xhr-polling']
        });
        app.socket.on('error', function(e) {
            app.callback({
                status: "error_socket",
                datas: e
            });
        });
        app.socket.on('connect_failed', function(e) {
            app.callback({
                status: "connect_failed"
            });
        });
        app.socket.on('connect', function(e) {
            app.callback({
                status: "socket_connected"
            });
        });
        
        /* VIDEO ASSETS EVENTS */
        $('.video_asset #play_pause_button').off(ui.event).on(ui.event, function(){
          if($('.video_asset #play_pause_button img').attr('src') === "img/play_icon.svg"){
            app.socket.emit("njoy", {status:"pause_video"});
          }else{
            app.socket.emit("njoy", {status:"play_video"});
          }
          //app.socket.emit("njoy", {status:"pause_video"});
          console.log('play pause');
        });
        $('.video_asset #mute_button').off(ui.event).on(ui.event, function(){
          if($('.video_asset #mute_button img').attr('src') === "img/audio_icon.svg"){
            app.socket.emit("njoy", {status:"mute_video"});
          }else{
            app.socket.emit("njoy", {status:"audio_video"});
          }
          console.log('mute');
        });
        $('.video_asset #quit_video_button').off(ui.event).on(ui.event, function(){
            app.socket.emit("njoy", {status:"stop_video"});
        });
        
        $('.video_asset #fast_forward').off(ui.event).on(ui.event, function(){
            app.socket.emit("njoy", {status:"fast_forward_video"});
        });
        
        $('.video_asset #fast_backward').off(ui.event).on(ui.event, function(){
            app.socket.emit("njoy", {status:"fast_backward_video"});
        });
        
        /* AUDIO ASSETS EVENTS */
        $('.audio_asset #play_pause_button').off(ui.event).on(ui.event, function(e){
          if($('.audio_asset #play_pause_button img').attr('src') === "img/play_icon.svg"){
            app.socket.emit("njoy", {status:"audio_resume"});
          }else{
            app.socket.emit("njoy", {status:"audio_pause"});
          }
          e.preventDefault();
          //app.socket.emit("njoy", {status:"pause_video"});
          console.log('play pause audio');
        });
        $('.audio_asset #mute_button').off(ui.event).on(ui.event, function(e){
          if($('.audio_asset #mute_button img').attr('src') === "img/audio_icon.svg"){
            app.socket.emit("njoy", {status:"audio_volume"});
          }else{
            app.socket.emit("njoy", {status:"audio_mute"});
          }
          e.preventDefault();
        });
        $('.audio_asset #stop_audio_button').off(ui.event).on(ui.event, function(){
            app.socket.emit("njoy", {status:"audio_stop"});
        });
        
        $('.audio_asset #fast_forward').off(ui.event).on(ui.event, function(){
            app.socket.emit("njoy", {status:"fast_forward_audio"});
        });
        
        $('.audio_asset #fast_backward').off(ui.event).on(ui.event, function(){
            app.socket.emit("njoy", {status:"fast_backward_audio"});
        });
        
        app.socket.on('njoy', function(datas) {
            console.log('datas :::: ', datas);
            switch (datas.status) {
                case 'activities':
                    app.infos.activities = datas.activities;
                    break;
                case 'video_started':
                    $('.video_asset #mute_button img').attr('src', "img/audio_icon.svg");
                    $('.video_asset #play_pause_button img').attr('src', "img/pause_icon.svg");
                    $('.video_asset').addClass('started');
                    $('.screen').css({'height':window.innerHeight-$('header').height()-60, "overflow":"hidden"});
                    break;
                case 'video_pause':
                    if($('.video_asset #play_pause_button img').attr('src') === "img/play_icon.svg"){
                        $('.video_asset #play_pause_button img').attr('src', "img/pause_icon.svg");
                    }else{
                        $('.video_asset #play_pause_button img').attr('src', "img/play_icon.svg");
                    }
                    break;
                case 'video_play':
                    if($('.video_asset #play_pause_button img').attr('src') === "img/play_icon.svg"){
                        $('.video_asset #play_pause_button img').attr('src', "img/pause_icon.svg");
                    }else{
                        $('.video_asset #play_pause_button img').attr('src', "img/play_icon.svg");
                    }
                    break;
                case 'video_closed':
                    $('.screen').css({'height':window.innerHeight-$('header').height(), "overflow":"hidden"});
                    $('.video_asset').removeClass('started');
                    break;
                case 'video_muted':
                    if($('.video_asset #mute_button img').attr('src') === "img/audio_icon.svg"){
                        $('.video_asset #mute_button img').attr('src', "img/mute_icon.svg");
                    }else{
                        $('.video_asset #mute_button img').attr('src', "img/audio_icon.svg");
                    }
                    break;
                    
                case 'audio_played':
                    $('.audio_asset #mute_button img').attr('src', "img/audio_icon.svg");
                    $('.audio_asset #play_pause_button img').attr('src', "img/pause_icon.svg");
                    $('.audio_asset').addClass('started');
                    $('.screen').css({'height':window.innerHeight-$('header').height()-60, "overflow":"hidden"});
                    break;
                case 'audio_paused':
                    $('.audio_asset #play_pause_button img').attr('src', "img/play_icon.svg");
                    break;
                case 'audio_play':
                    $('.audio_asset #play_pause_button img').attr('src', "img/pause_icon.svg");
                    break;
                case 'audio_stopped':
                    $('.screen').css({'height':window.innerHeight-$('header').height(), "overflow":"hidden"});
                    $('.audio_asset').removeClass('started');
                    break;
                case 'audio_muted':
                    $('.audio_asset #mute_button img').attr('src', "img/audio_icon.svg");
                    break;
                case 'audio_volumed':
                    $('.audio_asset #mute_button img').attr('src', "img/mute_icon.svg");
                    break;
                    
                case 'drawer':
                    /* TODO CREATE DRAWING CANVAS draing page load */
                    break;
                case 'fast_forward':
                    
                    break;
                case 'fast_backward':
                    
                    break;
                case 'video_audio':
                    //$('.video_asset').removeClass('started');
                    //$('.screen').css({'height':window.innerHeight-$('header').height(), "overflow":"hidden"});
                    break;
                case 'teams':
                    app.teams = datas.datas.teams;
                    ui.set_teams();
                    console.log("teams ", datas.datas.teams);
                    //$('.video_asset').removeClass('started');
                    //$('.screen').css({'height':window.innerHeight-$('header').height(), "overflow":"hidden"});
                    break;
                case 'error':
                    ui.popin({
                        "title":datas.datas.title,
                        "message":datas.datas.message,
                        "buttons":[
                            {"label":"OK"}
                        ]
                    }, function(e){
                    });
                    break;
                default:
                    break;
            }
            if(typeof datas.teams !== "undefined"){
                console.log("teams is defined :::: ", datas.teams);
                app.teams = datas.teams;
                ui.set_teams();
            }
            app.socket_callback(datas);
        });
        app.socket.on('njoy_' + app.infos.uuid, function(datas) {
            switch (datas.status) {
                case 'animations':
                    break;
                case 'login_success':
                    app.infos.users = datas.datas.users;
                    if (_.where(app.infos.users, {
                            uuid: app.infos.uuid
                        })[0].regis !== "undefined" && _.where(app.infos.users, {
                            uuid: app.infos.uuid
                        })[0].regis === "true") {
                        app.infos.regis = true;
                    }
                    break;
                case 'login_error':
                    app.infos.users = datas.datas.users;
                    break;
                default:
                    break;
            }
            if (typeof datas.datas.animations !== "undefined") {
                animations = datas.datas.animations;
            }
            app.socket_callback(datas);
        });
        app.socket.emit('njoy', {
            status: "new"
        });
        app.socket.on('chat_message', function(msg) {
            $('#messages').append($('<li>').text(JSON.stringify(msg)));
        });
        window.onbeforeunload = function(e) {
            app.socket.emit('njoy', {
                status: "disconnect",
                user_name: app.infos.user_name,
                uuid: app.infos.uuid
            });
        };
    },
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};
app.initialize();