// Copyright 2016 Google Inc.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var apiKey = "&client_id=22J27e1CHN";
var imageURL = "http://widgets01.cms-ds.com/uploads/temp/sportlink/";
var teamCodes = {
  "SVC 2000 1": 150850,
  "SVC 2000 2": 150851,
  "SVC 2000 3": 150852,
  "SVC 2000 4": 150853,
  "SVC 2000 VR1": 150860,
};

var initialMatch = {
  wedstrijddatum: "2019-02-24T11:30:00+0100",
  wedstrijdcode: 13002866,
  wedstrijdnummer: 49712,
  teamnaam: "SVC 2000 2",
  thuisteamclubrelatiecode: "BBJS05L",
  uitteamclubrelatiecode: "BBJV25C",
  thuisteamid: 150644,
  thuisteam: "Sporting Sittard'13 2",
  uitteamid: 150851,
  uitteam: "SVC 2000 2",
  teamvolgorde: 2,
  competitiesoort: "regulier",
  competitie: "0519 Mannen Zondag reserve",
  klasse: "4e klasse",
  poule: "04",
  klassepoule: "4e klasse 04",
  kaledatum: "2019-02-24 00:00:00.00",
  datum: "24 feb.",
  vertrektijd: "",
  verzameltijd: "",
  aanvangstijd: "11:30",
  wedstrijd: "Sporting Sittard'13 2 - SVC 2000 2",
  status: "Te spelen",
  scheidsrechters: "M.J.C. (Maikel) Giesbers (Assistent-scheidsrechter), Afgeschermd (Assistent-scheidsrechter)",
  scheidsrechter: "",
  accommodatie: "Sportpark het BOSSpark",
  veld: "veld 1",
  locatie: "Veld",
  plaats: "SITTARD",
  rijders: "",
  kleedkamerthuisteam: "",
  kleedkameruitteam: "",
  kleedkamerscheidsrechter: "",
  meer: "wedstrijd-informatie?wedstrijdcode=13002866"
};

(function() {
  'use strict';

  var app = {
    isLoading: true,
    visibleCards: {},
    selectedTeams: [],
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container'),
  };

  document.getElementById('butRefresh').addEventListener('click', function() {
    app.updateSchedule();
  });

  document.getElementById('butAdd').addEventListener('click', function() {
    app.toggleAddDialog(true);
  });

  document.getElementById('butAddCity').addEventListener('click', function() {
    var select = document.getElementById('selectTeamToAdd');
    var selected = select.options[select.selectedIndex];
    var teamcode = selected.value;
    var teamnaam = selected.textContent;

    if (!app.selectedTeams) {
      app.selectedTeams = [];
    }

    app.getSchedule(teamcode, teamnaam);
    app.selectedTeams.push({teamnaam: teamnaam});
    app.saveSelectedTeams();
    app.toggleAddDialog();
  });

  document.getElementById('butAddCancel').addEventListener('click', function() {
    app.toggleAddDialog(false);
  });


  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  // Toggle Dialog
  app.toggleAddDialog = function(visible) {
    if (visible) {
      app.addDialog.classList.add('dialog-container--visible');
    } else {
      app.addDialog.classList.remove('dialog-container--visible');
    }
  };

  app.updateScheduleCard = function(data) {

    if(data.wedstrijdcode == 13377185) return;

    var card;
    var match = app.visibleCards[data.wedstrijdcode];

    if(!match) {
      card = app.cardTemplate.cloneNode(true);
      card.classList.remove('cardTemplate');
      card.querySelector('.title').textContent = data.teamnaam;
      card.removeAttribute('hidden');
      app.container.appendChild(card);
      app.visibleCards[data.wedstrijdcode] = {teamcode: teamCodes[data.teamnaam], teamnaam: data.teamnaam, card: card};
    } else {
      card = match.card;
    }

    card.querySelector('.card-wedstrijdcode').textContent = data.wedstrijdcode;
    card.querySelector('.matchTitle').textContent = data.wedstrijd;
    card.querySelector('.matchDate').textContent = data.kaledatum.toString().split(" ")[0];
    card.querySelector('.matchTime').textContent = data.aanvangstijd;
    card.querySelector('.matchPlace').textContent = data.accommodatie;
    card.querySelector('.matchCity').textContent = data.plaats;

    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
  }

  app.getSchedule = function(teamcode, teamnaam) {
    var url = 'https://data.sportlink.com/programma?aantaldagen=30&teamcode=' + teamcode + apiKey;

    if('caches' in window) {
      caches.match(url).then(function(response) {
        if(response) {
          response.json().then(function updateFromCache(json) {
            console.log(json);

            var results = json;
            results.teamcode = teamcode;
            results.teamnaam = teamnaam;

            results.forEach(function(match){
              app.updateScheduleCard(match);
            });
          });
        }
      });
    }

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          var results = response;
          results.teamcode = teamcode;
          results.teamnaam = teamnaam;

          results.forEach(function(match){
            app.updateScheduleCard(match);
          });
        }
      } else {
        app.updateScheduleCard(initialMatch);
      }
    };

    request.open('GET', url);
    request.send();
  };

  // Get the newest data
  app.updateSchedule = function() {
    var matches = Object.entries(app.visibleCards);
    matches.forEach(function(match) {
      app.getSchedule(match[1].teamcode, match[1].teamnaam);
    });
  };

  // Save list of teams to localStorage.
  app.saveSelectedTeams = function() {
    var selectedTeams = JSON.stringify(app.selectedTeams);
    localStorage.selectedTeams = selectedTeams;
  };

  /**
   * Start code
   */
  app.selectedTeams = localStorage.selectedTeams;
  if(app.selectedTeams) {
    app.selectedTeams = JSON.parse(app.selectedTeams);
    app.selectedTeams.forEach(function(team) {
      app.getSchedule(teamCodes[team.teamnaam], team.teamnaam);
    });

  } else {
    app.updateScheduleCard(initialMatch);
    app.selectedTeams = [{ 
      teamcode: initialMatch.teamcode, 
      teamnaam: initialMatch.teamnaam,
    }];
    app.saveSelectedTeams();
  }

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./service-worker.js')
             .then(function() { console.log('Service Worker Registered'); });
  }

})();
