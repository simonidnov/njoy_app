var labofolies_status = {
  teams: [
    { id: 0, label: "blue", score: 0, molecules: [], isActive: false },
    { id: 1, label: "orange", score: 0, molecules: [], isActive: false },
    { id: 2, label: "pink", score: 0, molecules: [], isActive: false },
    { id: 3, label: "green", score: 0, molecules: [], isActive: false },
    { id: 4, label: "red", score: 0, molecules: [], isActive: false }
  ],
  display: 'default',
  currentTeamScan: null,
  screener: 'default',
  date: new Date().getTime()
};
var removeLink = function (evt) {
  console.log(evt.target);
  // $(evt.target).remove();
  evt.target.parentNode.removeChild(evt.target);
}
var createQRcodes = function (data) {
  setTimeout(async function () {
    var target = document.getElementById('qrcodes');
    for (i = 0; i < data.length; i++) {
      delete data[i].description;
      var url = "http://10.3.141.85:4000/api/barcode?text=" + data[i].formula + "&bcid=qrcode&textxalign=center&scale=1&width=500&height=500&contentType=download&showborder=false&borderleft=1&borderright=1&bordertop=1&borderbottom=1&guardwhitespace=false";
      var myHeaders = new Headers();

      await fetch(url, {
        method: 'GET',
        headers: myHeaders,
        mode: 'cors',
        cache: 'default'
      }).then(async function (response) {
        var myBlob = await response.blob();
        var objURL = await URL.createObjectURL(myBlob);
        target.innerHTML += '<a class="toremove" href="' + objURL + '" download="' + data[i].formula + '.png"><img src="' + objURL + '"/></a>';
        // target.innerHTML += '<a href="' + response + '" download="' + data[i].formula + '.png"><img name="' + data[i].formula + '.png" alt="' + data[i].formula + '" src="' + url + '"></a><br/>';
        $('.toremove').off('click').on('click', function (evt) {
          $(this).remove();
        });
        /* await response.blob().then(function (myBlob) {
          console.log('myBlob ', myBlob);
          var objectURL = URL.createObjectURL(myBlob);
          // myImage.src = objectURL;
          console.log('objectURL ', objectURL);
        }); */

      });
    };
  }, 3000);
}
function labofolies(datas) {
  console.log('labofolies WILL BE LOAD PLEASE WAIT...');
  console.log('WE RECEIVED DATAS FROM ACTIVITIES => ', datas);
}
labofolies.init = function (datas) {
  $.get(app.ip + '/ressources/labofolies/molecules.json', function (data, status) {
    labofolies.molecules = data;
    labofolies_status.molecules = data;
    // uncomment to generate QR images in pages for download tell to simon to run the toolkit api before
    // createQRcodes(data);
  }.bind(this));
  this.setState();
  this.datas = datas;
  // define modes screens
  this.modes = ['teams', 'enigma', 'scanner'];
  this.datas.mode = this.modes[0];
  this.datas.teams = labofolies_status.teams;
  // ON SET LE TAB CALLBACK DE L'APP TOOLS POUR CHANGER DE NIVEAU DE QUESTION
  app_tools.tab_callback = $.proxy(function (id) {
    // IMPORTANT : intercepte et retourne l'ID de l'onglet sélectionné
    this.datas.mode = this.modes[id];
    this.reset_template();
  }, this);

  // ON RESET LE SOCKET CALLBACK GLOBAL ET ON CATCH LES EVENEMENTS
  app.socket_callback = function (e) {
    switch (e.status) {
      case 'EVENT_NAME_TO_DEFINE':
        // ON NE FAIT RIEN DE CE COTÉ, LORSQUE LE CALL EST ENVOYÉ ON ATTEND UN SENDQUESTION DEPUIS LE RECEPTOR
        break;
      default:
        console.log('we receive an unknow event from labofolies websocket server');
        break;
    }
  }.bind(this);

  // On charge le ou les templates recquis pour cette animation not dans ces templates on fait ce qu'on veux c'est open bar
  $.get("pages/labofolies/labofolies.tmpl", $.proxy(function (e) {
    labofolies.subcomponent_template = _.template(e);
    labofolies.reset_template();
  }, this));
}
labofolies.resetTeams = function () {
  labofolies_status.teams = [
    { id: 0, label: "blue", score: 0, molecules: [], isActive: false },
    { id: 1, label: "orange", score: 0, molecules: [], isActive: false },
    { id: 2, label: "pink", score: 0, molecules: [], isActive: false },
    { id: 3, label: "green", score: 0, molecules: [], isActive: false },
    { id: 4, label: "red", score: 0, molecules: [], isActive: false }
  ];
  this.reset_template();
}
labofolies.reset_template = function () {
  // on bourre le template dans la colonne de droite
  this.datas.teams = labofolies_status.teams;
  $('.column.components .subcomponent').html(this.subcomponent_template(this.datas));
  setTimeout($.proxy(function () {
    this.set_events();
  }, this), 200);
}
labofolies.setIframes = function () {
  for (i = 0; i < window.document.getElementsByTagName('iframe').length; i++) {
    var id = window.document.getElementsByTagName('iframe')[i].getAttribute('id');
    this.setIframe(id, i);
  }
}
labofolies.setIframe = function (name, id) {
  var cssLink = document.createElement("link");
  cssLink.href = app.ip + "/pages/labofolies/css/labofolies.css";
  cssLink.rel = "stylesheet";
  cssLink.type = "text/css";
  if (typeof window.frames[name] !== "undefined" && window.frames[name].contentDocument !== "undefined") {
    window.frames[name].contentDocument.head.appendChild(cssLink);
  }
  if (typeof window.frames[id].window.comp !== "undefined") {
    if (typeof window.frames[id].window.comp.mc !== "undefined") {
      window.frames[id].window.comp.mc.loops = false;
      setTimeout($.proxy(function () {
        this.update_jauge(name, id, labofolies_status.teams[id].score);
      }, this), 500);
    }
  }
  // this.update_jauge(name, id, labofolies_status.teams[id].score);
}
labofolies.set_events = function () {
  var self = this;
  // Dans le template on utiliera data-labofolies pour gérer les events et sockets...
  $('[data-labofolies]').off(ui.event).on(ui.event, (event) => {
    switch ($(this).attr('data-labofolies')) {
      case 'refresh':
        console.log('Want to refresh labofolies');
        break;
      default:
        console.log('receive unknow labofolies action');
        break;
    }
  });

  // ON INTERCEPTE LE BOUTON BACK POUR NE PAS PERDRE LE STATUS DE L'APP
  $('[data-direction="back"]').off(ui.event).on(ui.event, function (event) {
    if ($('.labofolies_scan').hasClass('opened')) {
      labofolies.closeScanner();
      event.preventDefault();
      return false;
    }
    ui.popin({
      "title": "Attention",
      "message": "Si vous revenez en arrière, la partie sera terminée, êtes-vous sure de vouloir continuer ?",
      "buttons": [
        { "label": "Oui", "class": "error" },
        { "label": "Non", "class": "success" }
      ]
    }, (e) => {
      if (parseInt(e) === 0) {
        ui.navigate($('[data-direction="back"]').attr('data-navigate'));
        event.preventDefault();
        return false;
      }
    });
  });

  // TEAMS EVENTS 
  for (var i = 0; i < $('.team').length; i++) {
    $('.team').eq(i).find('.active_team').off('click').on('click', function () {
      labofolies_status.teams[$(this).attr('data-team')].isActive = !labofolies_status.teams[$(this).attr('data-team')].isActive;
      if (labofolies_status.teams[$(this).attr('data-team')].isActive) {
        $(this).find('.label').html('Désactiver');
        $(this).find('.radio_ui').addClass('checked');
      } else {
        $(this).find('.label').html('Activer');
        $(this).find('.radio_ui').removeClass('checked');
      }
      labofolies.saveState();
    });
  }
  $('.more').off('click').on('click', function (e) {
    labofolies_status.teams[$(this).attr('data-team')].score += 10;
    labofolies.update_scores();
  });
  $('.less').off('click').on('click', function (e) {
    labofolies_status.teams[$(this).attr('data-team')].score -= 10;
    labofolies.update_scores();
  });
  $('#gotTolabo').off('click').on('click', function (e) {
    // set screener laboratory then emmit labofolies_status
    labofolies_status.display = 'default';
    labofolies_status.screener = 'laboratory';
    setTimeout(function () {
      labofolies.saveState();
    }, 1000);
    // labofolies_status.date = new Date().getTime();
    // app.socket.emit('labofolies', labofolies_status);
  });
  $('#resetTeams').off('click').on('click', function () {
    labofolies_status.display = 'default';
    labofolies_status.screener = 'laboratory';
    labofolies.resetTeams();
  })
  $('#synthetisation').off('click').on('click', function (e) {
    // set screener laboratory then emmit labofolies_status
    labofolies_status.screener = 'synthetisation';
    // labofolies_status.date = new Date().getTime();
    labofolies.saveState();
    // app.socket.emit('labofolies', labofolies_status);
    setTimeout(function () {
      app.socket.emit("njoy", {
        file: "/ressources/labofolies/video/labofolies_synthetisation.mp4",
        status: "video"
      });
    }, 1500);
    setTimeout(function () {
      labofolies_status.screener = 'default';
      app.socket.emit('labofolies', labofolies_status);
    }, 10000);
  });
  $('#openScan').off('click').on('click', function () {
    if (labofolies_status.currentTeamScan === null || $('#openScan').hasClass('disabled')) {
      // ERROR YOU NEED TO SELECT A TEAM
      ui.popin({
        "title": "Sélectionner une équipe",
        "message": "Pour valider un scan, vous devez sélectionner l'équipe à laquelle nous allons attribuer des points !",
        "buttons": [
          { "label": "J'ai compris", "class": "success" }
        ]
      }, (e) => {
        if (parseInt(e) === 0) {
          event.preventDefault();
          return false;
        }
      });
    } else {
      labofolies.openScanner();
    }
  });
  $('.labofolies_scan .cross').off('click').on('click', function () {
    labofolies.closeScanner();
  });
  $('#team_picker li').off('click').on('click', function () {
    $('#team_picker li').removeClass('selected');
    if (!$(this).hasClass('selected')) {
      $(this).addClass('selected');
      $('#openScan').removeClass('disabled');
      labofolies_status.currentTeamScan = parseInt($(this).attr('id').replace('team', ''));
    } else {
      $(this).removeClass('selected');
      $('#openScan').addClass('disabled');
      labofolies_status.currentTeamScan = null;
    }
  });
}
labofolies.openScanner = function () {
  var team = labofolies_status.currentTeamScan;
  // labofolies_status.currentTeamScan = null;
  // console.log('open scanner ', team);
  $('.labofolies_scan').addClass('opened');
  /* OPEN SCAN BARCODE ON MOBILE ONLY */
  if (typeof cordova !== "undefined") {
    cordova.plugins.barcodeScanner.scan(
      function (result) {
        if (typeof result !== "undefined" && result !== null && result !== '') {
          var code = result.text;
          if (typeof code === 'undefined' || team === null) {
            ui.popin({
              "title": "ERREUR DE QRCODE",
              "message": "Le format de ce QRCODE n'est pas reconnu, impossible de charger la molecule.",
              "buttons": [
                { "label": "j'ai compris", "class": "error" }
              ]
            }, (e) => {
              if (parseInt(e) === 0) {
                event.preventDefault();
                return false;
              }
            });
          } else {
            // var team = labofolies_status.currentTeamScan;
            console.log(code);
            // console.log('SEARCH MOLECULE CODE => ', code);
            var already = false;
            var MOLECULE = _.where(JSON.parse(labofolies.molecules), { formula: code })[0];
            // On check si l'équipe n'a pas déjà scanné cette molécule avant d'attribuer les points
            if (typeof labofolies_status.teams[team].molecules === 'undefined') {
              labofolies_status.teams[team].molecules = [];
            }
            if (_.where(labofolies_status.teams[team].molecules, { formula: code }).length === 0) {
              labofolies_status.teams[team].molecules.push(MOLECULE);
              // on attribu 10 points à l'équipe en question
              labofolies_status.teams[team].score += 10;
            } else {
              already = true;
              // ATTENTION  CETTE EQUIPE A DEJA LA MOLECULE, IL FAUT SCANNER UNE AUTRE CARTE SI CE N EST PAS DE LA GRUGE
              ui.popin({
                "title": "Déjà scanné",
                "message": "L'équipe " + labofolies_status.teams[team].label + " a déjà scanné cette carte et obtenu les points, pour lui attribuer des points veuiillez lui attribuer une autre carte à scanner...",
                "buttons": [
                  { "label": "OK", "class": "success" },
                  { "label": "C'est de la triche", "class": "error" }
                ]
              }, (e) => {
                if (parseInt(e) === 0) {
                  event.preventDefault();
                  return false;
                }
              });
            }
            // alert(MOLECULE.folder);
            // On set le display pour afficher sur le tableau côté PI
            labofolies_status.display = MOLECULE.folder;// app.ip + "/ressources/labofolies/molecules/" + code + ".png";
            // On sauvegarde l'état de l'application
            labofolies.saveState();
            // on envois le status de l'appli au PI avec une nouvelle date et surtout le nouveau display sauvegardé
            // app.socket.emit('labofolies', labofolies_status);
            // play audio file
            app.socket.emit("njoy", {
              file: "/ressources/labofolies/molecules_voices/" + MOLECULE.folder + ".mp3",
              status: "FX"
            });
            // On set la config du MOL sur le target display qui est 
            setTimeout(function () {
              labofolies_status.display = "default";
              labofolies.configJMOL(MOLECULE.folder, MOLECULE, already);
            }, 1000);
          }
        } else {
          ui.popin({
            "title": "ERREUR DE QRCODE",
            "message": "Le QrCode que vous avez scanné n'est pas reconnu.",
            "buttons": [
              { "label": "j'ai compris", "class": "error" }
            ]
          }, (e) => {
            if (parseInt(e) === 0) {
              event.preventDefault();
              return false;
            }
          });
        }
      },
      function (error) {
        ui.popin({
          "title": "ERREUR DE SCAN",
          "message": "Nous ne parvenons pas à scanner la carte, si le problème perciste, veuillez attribuer les points manuellement via l'écran équipes et scores.<br>Nous en sommes désolé et tâcherons d'en savoir plus pour la prochaine mise à jour.",
          "buttons": [
            { "label": "j'ai compris", "class": "error" }
          ]
        }, (e) => {
          if (parseInt(e) === 0) {
            event.preventDefault();
            return false;
          }
        });
      }
    );
  } else {
    // ERROR SCAN CORDOVA PLUGIN ANDROID ONLY CATCH IOS ERROR
    ui.popin({
      "title": "Aïe",
      "message": "Le scanner de QR code ne fonctionne pas :-|<br> impossible de scanner les Qrcodes, vous devez entrer le code dans le formulaire manuellement...",
      "buttons": [
        { "label": "j'ai compris", "class": "error" }
      ]
    }, (e) => {
      if (parseInt(e) === 0) {
        event.preventDefault();
        return false;
      }
    });
  }
}
labofolies.closeScanner = function () {
  $('.labofolies_scan').removeClass('opened');
  setTimeout(function () { $('.labofolies_scan .content').html(''); }, 1500);
}
labofolies.update_scores = function () {
  for (var t = 0; t < labofolies_status.teams.length; t++) {
    if (labofolies_status.teams[t].score < 0) { labofolies_status.teams[t].score = 0; };
    if (labofolies_status.teams[t].score > 100) { labofolies_status.teams[t].score = 100; };
    $('#team' + t).find('input')[0].value = labofolies_status.teams[t].score;
    this.update_jauge(labofolies_status.teams[t].label, t, labofolies_status.teams[t].score);
  }
  this.saveState();
}
labofolies.update_jauge = function (teamName, teamId, score) {
  var jauge = window
    .frames[teamName]
    .contentDocument.body.getElementsByClassName('maskGroup')[0]
    .getElementsByClassName('movieclip')[0];

  if (typeof window.frames[teamName + '_big'] !== 'undefined') {
    var jaugeBig = window
      .frames[teamName + '_big']
      .contentDocument.body.getElementsByClassName('maskGroup')[0]
      .getElementsByClassName('movieclip')[0];
  }

  var height = $(window
    .frames[teamName]
    .contentDocument.body.getElementsByTagName('svg')[0]).height();
  height = 220;
  var percent = Math.round(score * height) / 100;
  // on change sa position en fonction du score
  var transform = $(jauge).attr('transform'),
    transformSplitted = transform.split(','),
    lastAttr = transformSplitted[transformSplitted.length - 1];

  var updated = transform.replace(lastAttr, (height - percent) + ')');

  jauge.setAttribute('transform', updated);
  if (jaugeBig) {
    jaugeBig.setAttribute('transform', updated);
  }
}
labofolies.saveState = function () {
  labofolies_status.date = new Date().getTime();
  app.socket.emit('labofolies', labofolies_status);
  /* labofolies_status.screener = "default";
  labofolies_status.display = "default"; */
  window.localStorage.setItem('labofolies', JSON.stringify(labofolies_status));
}
labofolies.setState = function () {
  var saved = window.localStorage.getItem('labofolies');
  if (typeof saved !== 'undefined' && saved !== '' && saved !== null) {
    labofolies_status = JSON.parse(saved);
    labofolies_status.display = 'default';
    labofolies_status.screener = 'laboratory';
  }
  // labofolies_status.screener = "default";
  // labofolies_status.display = "default";
  labofolies_status.date = new Date().getTime();
  app.socket.emit('labofolies', labofolies_status);
}
labofolies.configJMOL = function (mol, MOLECULE, already) {

  console.log(mol, MOLECULE, already);
  // MOLECULE est issu du json modelcules.json depuis le folder
  // already est = à true dans le cas ou la molécule a déjà étée scannée par l'équipe, dans ce cas on ne lui attribu pas de points 
  // l'idée est de créer une animation lorsque des points sont attribués et de parmettre de scanner de nouveau pour visualiser la molécule
  // mol est en fait le nom du folder contenu dans le QRCODE, ça correspond au chemin du .mol à charger depuis les ressources.
  var Info;
  // labofolies.molecules IS PRELOADED ON INIT
  // labofolies/molecules.json
  var ext = ".mol";

  if (mol === 'DNA') {
    ext = ".pdb";
  }

  var cif = ['Gold', 'Diamond', 'Hydroxylapatite', 'Talc'];
  if (cif.includes(mol)) {
    ext = '.cif';
  }
  console.log(app.ip + "/ressources/labofolies/molecules/" + mol.replace(' ', "_") + "/" + mol.replace(' ', "_") + ext);
  var myMolInfos = MOLECULE;
  ; (function () {
    Info = {
      width: window.innerWidth / 2,
      height: window.innerHeight,
      debug: false,
      color: "0xc8d4ea",
      addSelectionOptions: true,
      // serverURL: "https://chemapps.stolaf.edu/jmol/jsmol/php/jsmol.php",
      use: "HTML5",
      readyFunction: null,
      src: app.ip + "/ressources/labofolies/molecules/" + mol.replace(' ', "_") + "/" + mol.replace(' ', "_") + ext,
      bondWidth: 4,
      zoomScaling: 1.5,
      pinchScaling: 2.0,
      mouseDragFactor: 0.5,
      touchDragFactor: 0.15,
      multipleBondSpacing: 4,
      shadeAtoms: true,
      spinRateX: 0.2,
      spinRateY: 0.5,
      spinFPS: 20,
      spin: false,
      debug: false
    }
  })();
  var myMol = {};
  try {
    myMol = Jmol.getTMApplet("jmol", Info);
  } catch (err) {
  }


  var temp = '';
  if (ext === '.mol') {
    temp += '<div class="left">' + myMol._code + '</div>';
  } else {
    temp += '<div class="left" style="width:50%; height:100%; background-image:url(' + app.ip + '/ressources/labofolies/molecules/' + MOLECULE.folder + '/' + MOLECULE.folder + '_model.png)"></div>';
  }
  temp += '<div class="right">';
  temp += '<div class="logo_labofolies"></div>';
  temp += '<h1>' + myMolInfos.name + '</h1>';
  temp += '<p>' + myMolInfos.description + '</p>';
  temp += '<div class="formulae">' + myMolInfos.formula + '</div>';
  temp += '</div>';
  temp += '<div class="points"><iframe id="' + labofolies_status.teams[labofolies_status.currentTeamScan].label + '_big" onload="labofolies.setIframes()" src="' + app.ip + '/pages/labofolies/motions/' + labofolies_status.teams[labofolies_status.currentTeamScan].label + '.html"></iframe></div>';

  $('.labofolies_scan').html(temp);
  // if (!already) {
  // TODO : add points motion with jauger !
  // }v
  /* $('.labofolies_scan .left').html(myMol._code);
  $('.labofolies_scan .right h1').html(myMolInfos.name);
  $('.labofolies_scan .right .formula').html(myMolInfos.formula);
  $('.labofolies_scan .right p').html(myMolInfos.description); */
}
function str_pad_left(string, pad, length) {
  return (new Array(length + 1).join(pad) + string).slice(-length);
}

/* NOTE : remember to play an FX file you can emit somthing like :
this.socket.emit("njoy", {
    file: "pages/labofolies/audio/fx/success.mp3",
    status: "FX"
});
*/