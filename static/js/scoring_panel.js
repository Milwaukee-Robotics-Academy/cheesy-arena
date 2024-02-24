// Copyright 2014 Team 254. All Rights Reserved.
// Author: pat@patfairbank.com (Patrick Fairbank)
//
// Client-side logic for the scoring interface.

var websocket;
let alliance;
let type;

const addFoul = function(alliance, isTechnical) {
  websocket.send("addFoul", {Alliance: alliance, IsTechnical: isTechnical});
}

const removeFoul = function(alliance, isTechnical) {
  websocket.send("removeFoul", {Alliance: alliance, IsTechnical: isTechnical});
}

// Handles a websocket message to update the teams for the current match.
const handleMatchLoad = function(data) {
  if(type === "hp") {
    $("#matchName").hide();
    $("#currentScore").hide();
    $(".scoring-header").hide();
    $(".robot-scoring").hide();
    $("#stage").hide();
    $("#elements").hide();
    $("#ampAccumulatorDisable").hide();
    $("#foulButtons").hide();
    $("#coopertitionStatus").css("opacity", "1.0");
  } else if(type === "scorer") {
    $("#hpElements").hide();
    $(".robot-scoring").hide();
    $("#stage").hide();
    $(".scoring-header").hide();
    $("#foulButtons").hide();
  } else if(type === "near" || type === "far") {
    $("#currentScore").hide();
    $("#hpElements").hide();
    $(".scoring-header").show();
    $(".robot-scoring").show();
    $("#stage").show();
    $("#elements").hide();
    $("#ampAccumulatorDisable").show();
  }

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
  if(type == "hp") {
    console.log("Time");
    console.log(data);
    if(data.MatchTimeSec > 15 + 3 + 45 || data.MatchState != 5) {
      $("#coopertitionStatus").css("opacity", "0.0");
    } else {
      $("#coopertitionStatus").css("opacity", "1.0");
    }
  }
  if(type == "scorer") {
    if(data.MatchState == 3 || data.MatchState == 4) { // Autonomous
      $("#elements").show();
      $("#autoGoalPeriod").show();
      $("#teleopGoalPeriod").hide();
      $("#amplifiedGoalPeriod").hide();
    } else if(data.MatchState == 5 || data.MatchState == 6) { // Teleop
      $("#elements").show();
      $("#autoGoalPeriod").hide();
      $("#teleopGoalPeriod").show();
      $("#amplifiedGoalPeriod").hide();
    } else {
      $("#elements").hide();
      $("#autoGoalPeriod").hide();
      $("#teleopGoalPeriod").hide();
      $("#amplifiedGoalPeriod").hide();
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
      if(type != "hp") {
        $("#commitMatchScore").css("display", "flex");
      }
      break;
    default:
      $("#postMatchMessage").hide();
      $("#commitMatchScore").hide();
  }
};

// Handles a websocket message to update the realtime scoring fields.
const handleRealtimeScore = function(data) {
  console.log("RealTime Score");
  console.log(data);
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
    
    $(`#coopertitionStatus>.value`).text(score.CoopertitionStatus ? "Coopertition Enabled" : "Coopertition");
    $("#coopertitionStatus").attr("data-value", score.CoopertitionStatus);
    $(`#amplificationActive>.value`).text(score.AmplificationActive ? "Amplification Active" : "Amplification");
    $("#amplificationActive").attr("data-value", score.AmplificationActive);
    $("#amplificationActive").css("color", !score.AmpAccumulatorDisable && score.AmplificationActive ? "black" : "");
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

  if(alliance === "red" && type === "near") {
    $("#rn-red-foul").text(data.Red.Score.RedNearFouls);
    $("#rn-red-tech-foul").text(data.Red.Score.RedNearTechFouls);
    $("#rn-blue-foul").text(data.Blue.Score.RedNearFouls);
    $("#rn-blue-tech-foul").text(data.Blue.Score.RedNearTechFouls);
  } else if(alliance === "red" && type == "far") {  
    $("#rf-red-foul").text(data.Red.Score.RedFarFouls);    
    $("#rf-red-tech-foul").text(data.Red.Score.RedFarTechFouls);    
    $("#rf-blue-foul").text(data.Blue.Score.RedFarFouls);
    $("#rf-blue-tech-foul").text(data.Blue.Score.RedFarTechFouls);
  } else if(alliance === "blue" && type === "near") {
    $("#bn-red-foul").text(data.Red.Score.BlueNearFouls);
    $("#bn-red-tech-foul").text(data.Red.Score.BlueNearTechFouls);
    $("#bn-blue-foul").text(data.Blue.Score.BlueNearFouls);
    $("#bn-blue-tech-foul").text(data.Blue.Score.BlueNearTechFouls);
  } else if(alliance === "blue" && type === "far") {
    $("#bf-red-foul").text(data.Red.Score.BlueFarFouls);
    $("#bf-red-tech-foul").text(data.Red.Score.BlueFarTechFouls);
    $("#bf-blue-foul").text(data.Blue.Score.BlueFarFouls);
    $("#bf-blue-tech-foul").text(data.Blue.Score.BlueFarTechFouls);
  }

  

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
  panelId = window.location.href.split("/").slice(-1)[0];
  alliance = panelId.split("_")[0];
  type = panelId.split("_")[1];
  console.log(type);
  $("#alliance").attr("data-alliance", alliance);

  // Set up the websocket back to the server.
  websocket = new CheesyWebsocket("/panels/scoring/" + panelId + "/websocket", {
    matchLoad: function(event) { handleMatchLoad(event.data); },
    matchTime: function(event) { handleMatchTime(event.data); },
    realtimeScore: function(event) { handleRealtimeScore(event.data); },
  });
  $(document).keypress(handleKeyPress);
});
