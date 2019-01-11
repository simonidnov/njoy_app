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
    current_video:{
        name:"",
        position:0,
        duration:0,
        volume:1
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
    set_video_assets:function(){
        
        $(".video_asset #seeker").off("change").on("change", function(e) { 
            var sec = Math.round((app.current_video.duration/100)*$('.video_asset #seeker').val());
            console.log("seek to ", sec);
            //app.socket.emit("njoy", {status:"seek_video", seek:sec});
            app.socket.emit("njoy", {status:"position_video", position:sec});
        });
        $(".video_asset #volume").off("change").on("change", function(e) { 
            var vol = Math.abs($(".video_asset #volume").val()/100).toFixed(1);
            console.log("set volume ::::::::::::::::: ", vol);
            app.socket.emit("njoy", {status:"volume_video", volume:vol});
        });
        
        $('.video_asset #play_pause_button').off(ui.event).on(ui.event, function(e){
            if($('.video_asset #play_pause_button img').attr('src') === "img/play_icon.svg"){
                app.socket.emit("njoy", {status:"resume_video"});
            }else{
                app.socket.emit("njoy", {status:"pause_video"});
            }
            e.preventDefault();
            //app.socket.emit("njoy", {status:"pause_video"});
            console.log('play pause video');
        });
        
        $('.video_asset #quit_video_button').off(ui.event).on(ui.event, function(){
            app.socket.emit("njoy", {status:"stop_video"});
        });
    },
    set_audio_assets:function(){
        
        $(".audio_asset #seeker").off("change").on("change", function(e) { 
            var sec = Math.round((app.current_video.duration/100)*$('.audio_asset #seeker').val());
            console.log("seek to ", sec);
            //app.socket.emit("njoy", {status:"seek_video", seek:sec});
            app.socket.emit("njoy", {status:"position_audio", position:sec});
        });
        $(".audio_asset #volume").off("change").on("change", function(e) { 
            var vol = Math.abs($(".audio_asset #volume").val()/100).toFixed(1);
            console.log("set volume ::::::::::::::::: ", vol);
            app.socket.emit("njoy", {status:"volume_audio", volume:vol});
        });
        
        $('.audio_asset #play_pause_button').off(ui.event).on(ui.event, function(e){
            if($('.audio_asset #play_pause_button img').attr('src') === "img/play_icon.svg"){
                app.socket.emit("njoy", {status:"resume_audio"});
            }else{
                app.socket.emit("njoy", {status:"pause_audio"});
            }
            e.preventDefault();
            //app.socket.emit("njoy", {status:"pause_video"});
            console.log('play pause audio');
        });
        
        $('.audio_asset #quit_video_button').off(ui.event).on(ui.event, function(){
            app.socket.emit("njoy", {status:"stop_audio"});
        });
    },
    init_socket:function(callback){
        this.callback = callback;
        //this.ip = window.location.origin;
        app.infos.uuid = new Date().getTime();
        console.log('LE socket_callback est initialisé');
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
        app.set_video_assets();
        app.set_audio_assets();
        app.socket.on('boardingpass', function(datas){
            app.socket_callback(datas);
        });
        app.socket.on('njoy', function(datas) {
            switch (datas.status) {
                case 'activities':
                    app.infos.activities = datas.activities;
                    break;
                case 'video_started':
                    app.set_video_assets();
                    $('.video_asset #play_pause_button img').attr('src', "img/pause_icon.svg");
                    $('.video_asset').addClass('started');
                    $('.audio_asset').removeClass('started');
                    $('.screen').css({'height':window.innerHeight-$('header').height()-$('.video_asset').height(), "overflow":"hidden"});
                    break;
                case 'video_pause':
                    $('.video_asset #play_pause_button img').attr('src', "img/play_icon.svg");
                    break;
                case 'video_resume':
                    $('.video_asset #play_pause_button img').attr('src', "img/pause_icon.svg");
                    break;
                case 'video_stopped':
                    $('.screen').css({'height':window.innerHeight-$('header').height(), "overflow":"hidden"});
                    $('.video_asset').removeClass('started');
                    $('.audio_asset').removeClass('started');
                    console.log('VIDEO STOPPED');
                    break;
                case 'video_position':
                    console.log("position_video ", datas);
                    break;
                case 'video_seek':
                    console.log("video_seek ", datas);
                    break;
                case 'video_volume':
                    console.log("video_volume :::: ", datas.volume);
                    app.current_video.volume = datas.volume;
                    $('.video_asset #volume').val(parseFloat(datas.volume)*100);
                    $('.audio_asset #volume').val(parseFloat(datas.volume)*100);
                    break;
                case 'progress_video':
                    //datas.position;
                    //datas.duration;
                    //datas.volume;
                    app.current_video.position = datas.position;
                    app.current_video.duration = datas.duration;
                    //app.current_video.volume = datas.volume;
                    $('.video_asset #seeker').val(((datas.position/datas.duration)*100));
                    //$('#volume').val((datas.volume*100));
                    break;
                    
                case 'audio_started':
                    app.set_audio_assets();
                    $('.audio_asset #play_pause_button img').attr('src', "img/pause_icon.svg");
                    $('.audio_asset').addClass('started');
                    $('.video_asset').removeClass('started');
                    $('.screen').css({'height':window.innerHeight-$('header').height()-$('.audio_asset').height(), "overflow":"hidden"});
                    break;
                case 'audio_pause':
                    $('.audio_asset #play_pause_button img').attr('src', "img/play_icon.svg");
                    break;
                case 'audio_resume':
                    $('.audio_asset #play_pause_button img').attr('src', "img/pause_icon.svg");
                    break;
                case 'audio_stopped':
                    $('.screen').css({'height':window.innerHeight-$('header').height(), "overflow":"hidden"});
                    $('.audio_asset').removeClass('started');
                    $('.video_asset').removeClass('started');
                    console.log('AUDIO STOPPED');
                    break;
                case 'audio_position':
                    console.log("position_audio ", datas);
                    break;
                case 'audio_seek':
                    console.log("audio_seek ", datas);
                    break;
                case 'audio_volume':
                    console.log("audio_volume :::: ", datas.volume);
                    app.current_video.volume = datas.volume;
                    $('.audio_asset #volume').val(parseFloat(datas.volume)*100);
                    $('.video_asset #volume').val(parseFloat(datas.volume)*100);
                    break;
                case 'progress_audio':
                    //datas.position;
                    //datas.duration;
                    //datas.volume;
                    app.current_video.position = datas.position;
                    app.current_video.duration = datas.duration;
                    //app.current_video.volume = datas.volume;
                    $('.audio_asset #seeker').val(((datas.position/datas.duration)*100));
                    //$('#volume').val((datas.volume*100));
                    break;
                    
                case 'drawer':
                    /* TODO CREATE DRAWING CANVAS drawing page load */
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
        //console.log('Received Event: ' + id);
    }
};
app.initialize();