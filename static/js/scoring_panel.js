// Copyright 2014 Team 254. All Rights Reserved.
// Author: pat@patfairbank.com (Patrick Fairbank)
//
// Client-side logic for the scoring interface.

var websocket;
let alliance;

// Handles a websocket message to update the teams for the current match.
const handleMatchLoad = function(data) {
  $("#matchName").text(data.Match.LongName);
  if (alliance === "red") {
    $("#team1").text(data.Match.Red1);
    $("#team2").text(data.Match.Red2);
    $("#team3").text(data.Match.Red3);
  } else {
    $("#team1").text(data.Match.Blue1);
    $("#team2").text(data.Match.Blue2);
    $("#team3").text(data.Match.Blue3);
  }
};

// Handles a websocket message to update the match status.
const handleMatchTime = function(data) {
  if(data.MatchState == 3) { // Autonomous
    $("#autoGoalPeriod").css("background-color", "yellow");
    $("#autoGoalPeriod").css("color", "black");
  } else {
    $("#autoGoalPeriod").css("background-color", "black");
    $("#autoGoalPeriod").css("color", "white");
  }

  console.log(alliance)
  if(data.MatchState == 5) { // Teleop
    if(alliance === "red" && data.RedAmplificationRemaining === 0) {
      $("#teleopGoalPeriod").css("background-color", "yellow");
      $("#teleopGoalPeriod").css("color", "black");
    } else if(alliance === "blue" && data.BlueAmplificationRemaining === 0){
      $("#teleopGoalPeriod").css("background-color", "yellow");
      $("#teleopGoalPeriod").css("color", "black");
    } else {
      $("#teleopGoalPeriod").css("background-color", "black");
      $("#teleopGoalPeriod").css("color", "white");
    }
  }
  switch (matchStates[data.MatchState]) {
    case "PRE_MATCH":
      // Pre-match message state is set in handleRealtimeScore().
      $("#postMatchMessage").hide();
      $("#commitMatchScore").hide();
      break;
    case "POST_MATCH":
      $("#postMatchMessage").hide();
      $("#commitMatchScore").css("display", "flex");
      break;
    default:
      $("#postMatchMessage").hide();
      $("#commitMatchScore").hide();
  }
};

// Handles a websocket message to update the realtime scoring fields.
const handleRealtimeScore = function(data) {
  let realtimeScore;
  if (alliance === "red") {
    realtimeScore = data.Red;
  } else {
    realtimeScore = data.Blue;
  }
  const score = realtimeScore.Score;

  for (let i = 0; i < 3; i++) {
    const i1 = i + 1;
    $(`#mobilityStatus${i1}>.value`).text(score.MobilityStatuses[i] ? "Yes" : "No");
    $("#mobilityStatus" + i1).attr("data-value", score.MobilityStatuses[i]);
    $("#autoDockStatus" + i1 + ">.value").text(score.AutoDockStatuses[i] ? "Yes" : "No");
    $("#autoDockStatus" + i1).attr("data-value", score.AutoDockStatuses[i]);
    $("#endgameStatus" + i1 + ">.value").text(getEndgameStatusText(score.EndgameStatuses[i]));
    $("#endgameStatus" + i1).attr("data-value", score.EndgameStatuses[i]);
    $("#stageStatus" + i1 + ">.value").text(getStageStatusText(score.StageStatuses[i]));
    $("#stageStatus" + i1).attr("data-value", score.StageStatuses[i]);
    $(`#harmonyStatus${i1}>.value`).text(score.HarmonyStatuses[i] ? "Yes" : "No");
    $("#harmonyStatus" + i1).attr("data-value", score.HarmonyStatuses[i]);
    
    $(`#coopertitionStatus>.value`).text(score.CoopertitionStatus ? "Cooperation Enabled" : "Cooperation");
    $("#coopertitionStatus").attr("data-value", score.CoopertitionStatus);
    $(`#amplificationActive>.value`).text(score.AmplificationActive ? "Amplification Active" : "Amplification");
    $("#amplificationActive").attr("data-value", score.AmplificationActive);
    $("#amplificationActive").css("color", !score.AmpAccumulatorDisable && score.AmplificationActive ? "black" : "");
  }

  if(score.AmplificationActive) {
    $("#teleopGoalPeriod").css("background-color", "black");
    $("#teleopGoalPeriod").css("color", "white");
    $("#amplifiedGoalPeriod").css("background-color", "yellow");
    $("#amplifiedGoalPeriod").css("color", "black");
  } else {
    $("#amplifiedGoalPeriod").css("background-color", "black");
    $("#amplifiedGoalPeriod").css("color", "white");
  }

  $("#autoChargeStationLevel>.value").text(score.AutoChargeStationLevel ? "Level" : "Not Level");
  $("#autoChargeStationLevel").attr("data-value", score.AutoChargeStationLevel);
  $("#endgameChargeStationLevel>.value").text(score.EndgameChargeStationLevel ? "Level" : "Not Level");
  $("#endgameChargeStationLevel").attr("data-value", score.EndgameChargeStationLevel);

  $("#currentScore").text("Current Score: " + realtimeScore.ScoreSummary.Score);
  $("#currentAmpificationCount").text("Ampification Count: " + score.AmplificationCount);
  $("#ampCount").text("Amp Total Count: " + (score.AutoAmpNotes + score.TeleopAmpNotes));
  $("#teleopAmpCount").text(score.TeleopAmpNotes);
  $("#autoAmpCount").text(score.AutoAmpNotes);
  $("#speakerCount").text("Speaker Total Count: " + (score.AutoSpeakerNotes + score.TeleopSpeakerNotesNotAmplified + score.TeleopSpeakerNotesAmplified));
  $("#autoSpeakerCount").text(score.AutoSpeakerNotes);
  $("#teleopSpeakerCountNotAmplified").text(score.TeleopSpeakerNotesNotAmplified);
  $("#teleopSpeakerCountAmplified").text(score.TeleopSpeakerNotesAmplified);
  $("#trapCount1").text((score.TrapNotes));
  $("#trapCount").text("Trap Count: " + (score.TrapNotes));

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 9; j++) {
      $(`#gridAutoScoringRow${i}Node${j}`).attr("data-value", score.Grid.AutoScoring[i][j]);
      $(`#gridNodeStatesRow${i}Node${j}`).children().each(function() {
        const element = $(this);
        element.attr("data-value", element.attr("data-node-state") === score.Grid.Nodes[i][j].toString());
      });
    }
  }
};

// Handles a keyboard event and sends the appropriate websocket message.
var handleKeyPress = function(event) {
  websocket.send(String.fromCharCode(event.keyCode));
};
// Handles an element click and sends the appropriate websocket message.
const handleClick = function(command, teamPosition = 0, gridRow = 0, gridNode = 0, nodeState = 0) {
  websocket.send(command, {TeamPosition: teamPosition, GridRow: gridRow, GridNode: gridNode, NodeState: nodeState});
};

// Sends a websocket message to indicate that the score for this alliance is ready.
const commitMatchScore = function() {
  websocket.send("commitMatch");
  $("#postMatchMessage").css("display", "flex");
  $("#commitMatchScore").hide();
};

// Returns the display text corresponding to the given integer endgame status value.
const getEndgameStatusText = function(level) {
  switch (level) {
    case 1:
      return "Park";
    case 2:
      return "Dock";
    default:
      return "None";
  }
};
const getStageStatusText = function(level) {
  switch (level) {
    case 1:
      return "Park";
    case 2:
      return "Onstage";
    case 3:
      return "Spotlight";
    default:
      return "None";
  }
};

$(function() {
  alliance = window.location.href.split("/").slice(-1)[0];
  $("#alliance").attr("data-alliance", alliance);

  // Set up the websocket back to the server.
  websocket = new CheesyWebsocket("/panels/scoring/" + alliance + "/websocket", {
    matchLoad: function(event) { handleMatchLoad(event.data); },
    matchTime: function(event) { handleMatchTime(event.data); },
    realtimeScore: function(event) { handleRealtimeScore(event.data); },
  });
  $(document).keypress(handleKeyPress);
});
