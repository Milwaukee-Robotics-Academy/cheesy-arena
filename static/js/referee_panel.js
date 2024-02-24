// Copyright 2023 Team 254. All Rights Reserved.
// Author: pat@patfairbank.com (Patrick Fairbank)
//
// Client-side logic for the referee interface.

var websocket;
let redFoulsHashCode = 0;
let blueFoulsHashCode = 0;

// Sends the foul to the server to add it to the list.
const addFoul = function(alliance, isTechnical) {
  websocket.send("addFoul", {Alliance: alliance, IsTechnical: isTechnical});
}

const removeFoul = function(alliance, isTechnical) {
  websocket.send("removeFoul", {Alliance: alliance, IsTechnical: isTechnical});
}

// Toggles the foul type between technical and non-technical.
const toggleFoulType = function(alliance, index) {
  websocket.send("toggleFoulType", {Alliance: alliance, Index: index});
}

// Updates the team that the foul is attributed to.
const updateFoulTeam = function(alliance, index, teamId) {
  websocket.send("updateFoulTeam", {Alliance: alliance, Index: index, TeamId: teamId});
}

// Updates the rule that the foul is for.
const updateFoulRule = function(alliance, index, ruleId) {
  websocket.send("updateFoulRule", {Alliance: alliance, Index: index, RuleId: ruleId});
}

// Removes the foul with the given parameters from the list.
var deleteFoul = function(alliance, index) {
  websocket.send("deleteFoul", {Alliance: alliance, Index: index});
};

// Cycles through no card, yellow card, and red card.
var cycleCard = function(cardButton) {
  var newCard = "";
  if ($(cardButton).attr("data-card") === "") {
    newCard = "yellow";
  } else if ($(cardButton).attr("data-card") === "yellow") {
    newCard = "red";
  }
  websocket.send(
    "card",
    {Alliance: $(cardButton).attr("data-alliance"), TeamId: parseInt($(cardButton).attr("data-team")), Card: newCard}
  );
  $(cardButton).attr("data-card", newCard);
};

// Sends a websocket message to signal to the teams that they may enter the field.
var signalReset = function() {
  websocket.send("signalReset");
};

// Signals the scorekeeper that foul entry is complete for this match.
var commitMatch = function() {
  websocket.send("commitMatch");
};

// Handles a websocket message to update the teams for the current match.
var handleMatchLoad = function(data) {
  $("#matchName").text(data.Match.LongName);

  setTeamCard("red", 1, data.Teams["R1"]);
  setTeamCard("red", 2, data.Teams["R2"]);
  setTeamCard("red", 3, data.Teams["R3"]);
  setTeamCard("blue", 1, data.Teams["B1"]);
  setTeamCard("blue", 2, data.Teams["B2"]);
  setTeamCard("blue", 3, data.Teams["B3"]);
};

// Handles a websocket message to update the match status.
const handleMatchTime = function(data) {
  $(".control-button").attr("data-enabled", matchStates[data.MatchState] === "POST_MATCH");
};

// Handles a websocket message to update the realtime scoring fields.
const handleRealtimeScore = function(data) {
  for (const [teamId, card] of Object.entries(Object.assign(data.RedCards, data.BlueCards))) {
    $(`[data-team="${teamId}"]`).attr("data-card", card);
  }

  $("#hr-red-foul").text("Head Ref: " + data.Red.Score.HeadRefFouls);
  $("#rn-red-foul").text("Red Near: " + data.Red.Score.RedNearFouls);
  $("#rf-red-foul").text("Red Far: " + data.Red.Score.RedFarFouls);
  $("#bn-red-foul").text("Blue Near: " + data.Red.Score.BlueNearFouls);
  $("#bf-red-foul").text("Blue Far: " + data.Red.Score.BlueFarFouls);

  $("#hr-red-tech-foul").text("Head Ref: " + data.Red.Score.HeadRefTechFouls);
  $("#rn-red-tech-foul").text("Red Near: " + data.Red.Score.RedNearTechFouls);
  $("#rf-red-tech-foul").text("Red Far: " + data.Red.Score.RedFarTechFouls);
  $("#bn-red-tech-foul").text("Blue Near: " + data.Red.Score.BlueNearTechFouls);
  $("#bf-red-tech-foul").text("Blue Far: " + data.Red.Score.BlueFarTechFouls);

  $("#hr-blue-foul").text("Head Ref: " + data.Blue.Score.HeadRefFouls);
  $("#rn-blue-foul").text("Red Near: " + data.Blue.Score.RedNearFouls);
  $("#rf-blue-foul").text("Red Far: " + data.Blue.Score.RedFarFouls);
  $("#bn-blue-foul").text("Blue Near: " + data.Blue.Score.BlueNearFouls);
  $("#bf-blue-foul").text("Blue Far: " + data.Blue.Score.BlueFarFouls);

  $("#hr-blue-tech-foul").text("Head Ref: " + data.Blue.Score.HeadRefTechFouls);
  $("#rn-blue-tech-foul").text("Red Near: " + data.Blue.Score.RedNearTechFouls);
  $("#rf-blue-tech-foul").text("Red Far: " + data.Blue.Score.RedFarTechFouls);
  $("#bn-blue-tech-foul").text("Blue Near: " + data.Blue.Score.BlueNearTechFouls);
  $("#bf-blue-tech-foul").text("Blue Far: " + data.Blue.Score.BlueFarTechFouls);

  // const newRedFoulsHashCode = hashObject(data.Red.Score.Fouls);
  // const newBlueFoulsHashCode = hashObject(data.Blue.Score.Fouls);
  // if (newRedFoulsHashCode !== redFoulsHashCode || newBlueFoulsHashCode !== blueFoulsHashCode) {
  //   redFoulsHashCode = newRedFoulsHashCode;
  //   blueFoulsHashCode = newBlueFoulsHashCode;
  //   fetch("/panels/referee/foul_list")
  //     .then(response => response.text())
  //     .then(svg => $("#foulList").html(svg));
  // }
}

// Handles a websocket message to update the scoring commit status.
const handleScoringStatus = function(data) {
  if (data.RefereeScoreReady) {
    $("#commitButton").attr("data-enabled", false);
  }
}

// Populates the red/yellow card button for a given team.
const setTeamCard = function(alliance, position, team) {
  const cardButton = $(`#${alliance}Team${position}Card`);
  if (team === null) {
    cardButton.text(0);
    cardButton.attr("data-team", 0)
    cardButton.attr("data-old-yellow-card", "");
  } else {
    cardButton.text(team.Id);
    cardButton.attr("data-team", team.Id)
    cardButton.attr("data-old-yellow-card", team.YellowCard);
  }
  cardButton.attr("data-card", "");
}

// Produces a hash code of the given object for use in equality comparisons.
const hashObject = function(object) {
  const s = JSON.stringify(object);
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  return h;
}

$(function() {
  // Set up the websocket back to the server.
  websocket = new CheesyWebsocket("/panels/referee/websocket", {
    matchLoad: function(event) { handleMatchLoad(event.data); },
    matchTime: function(event) { handleMatchTime(event.data); },
    realtimeScore: function(event) { handleRealtimeScore(event.data); },
    scoringStatus: function(event) { handleScoringStatus(event.data); },
  });
});
