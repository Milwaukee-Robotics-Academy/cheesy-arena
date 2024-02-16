// Copyright 2023 Team 254. All Rights Reserved.
// Author: pat@patfairbank.com (Patrick Fairbank)
//
// Model representing the instantaneous score of a match.

package game

type Score struct {
	MobilityStatuses			[3]bool
	AutoAmpNotes			   	int
	AutoSpeakerNotes			int
	TeleopAmpNotes				int
	TeleopSpeakerNotes			int
	TeleopAmpedSpeakerNotes		int
	TrapNotes					int
	Harmony						[3]bool
//	Grid                      Grid
//	AutoChargeStationLevel    bool
	EndgameStatuses           [3]EndgameStatus
//	EndgameChargeStationLevel bool
	Fouls                     []Foul
	PlayoffDq                 bool
}

// var SustainabilityBonusLinkThresholdWithoutCoop = 6
// var SustainabilityBonusLinkThresholdWithCoop = 5
// var ActivationBonusPointThreshold = 26
var TotalNotesScored = 0
var StagePoints = 0
var RobotsOnStage = 0

// //represents scores in Auto
// type AutoAmpNotes int
// type AutoSpeakerNotes int
// type TrapNotes int

// //represents scores in teleop
// type TeleopAmpNotes int
// type TeleopSpeakerNotes int
// type TeleopAmpedSpeakerNotes int
// Represents the state of a robot at the end of the match.
type EndgameStatus int

const (
	EndgameNone EndgameStatus = iota
	EndgameParked
	EndgameOnstage
	EndgameOnstageSpotlit
	EndgameHarmony
	EndgameNoteInTrap
)

// Calculates and returns the summary fields used for ranking and display.
func (score *Score) Summarize(opponentScore *Score) *ScoreSummary {
	summary := new(ScoreSummary)

	// Leave the score at zero if the alliance was disqualified.
	if score.PlayoffDq {
		return summary
	}

	// Calculate autonomous period points.
	for _, mobility := range score.MobilityStatuses {
		if mobility {
			summary.MobilityPoints += 2
		}
	}
		// Calculate summary points for each robot.
	for i := 0; i < 3; i++ {
		switch score.EndgameStatuses[i] {
			 	case EndgameParked:
			 		summary.ParkPoints += 1
			 	case EndgameOnstage:
			 		summary.EndgamePoints  += 3
					StagePoints += 3
					RobotsOnStage += 1
				case EndgameOnstageSpotlit:
					summary.EndgamePoints += 4
					StagePoints += 4
					RobotsOnStage += 1
 		}
		if score.Harmony[i] {
			summary.EndgamePoints += 2
		}
	}
	summary.AutoPoints += (score.AutoAmpNotes * 2) + (score.AutoSpeakerNotes * 5)
	summary.NotesPoints += (score.TeleopAmpNotes) + (score.TeleopSpeakerNotes * 2) + (score.TeleopAmpedSpeakerNotes * 5)
	summary.EndgamePoints += score.TrapNotes;
	TotalNotesScored += score.AutoAmpNotes + score.AutoSpeakerNotes + score.TeleopAmpedSpeakerNotes + score.TeleopAmpNotes + score.TeleopSpeakerNotes
	if (TotalNotesScored > 17){
		summary.MelodyBonus = true
	}
	if (StagePoints > 9 && RobotsOnStage > 1){
		summary.EnsambleBonus = true
	}

	// Calculate teleoperated period points.
	// teleopGridPoints := score.Grid.TeleopGamePiecePoints() + score.Grid.LinkPoints() + score.Grid.SuperchargedPoints()
	// teleopChargeStationPoints := 0
	// for i := 0; i < 3; i++ {
	// 	switch score.EndgameStatuses[i] {
	// 	case EndgameParked:
	// 		summary.ParkPoints += 2
	// 	case EndgameDocked:
	// 		teleopChargeStationPoints += 6
	// 		if score.EndgameChargeStationLevel {
	// 			teleopChargeStationPoints += 4
	// 		}
	// 	}
	// }



	summary.MatchPoints = summary.MobilityPoints + summary.NotesPoints + summary.AutoPoints + summary.EndgamePoints

	// Calculate penalty points.
	for _, foul := range opponentScore.Fouls {
		summary.FoulPoints += foul.PointValue()
		// Store the number of tech fouls since it is used to break ties in playoffs.
		if foul.IsTechnical {
			summary.NumOpponentTechFouls++
		}

		// rule := foul.Rule()
		// if rule != nil {
		// 	// Check for the opponent fouls that automatically trigger a ranking point.
		// 	if rule.IsRankingPoint {
		// 		summary.SustainabilityBonusRankingPoint = true
		// 	}
		// }
	}

	summary.Score = summary.MatchPoints + summary.FoulPoints


	// summary.NumLinks = len(score.Grid.Links())
	// summary.NumLinksGoal = SustainabilityBonusLinkThresholdWithoutCoop
	// A SustainabilityBonusLinkThresholdWithCoop of 0 disables the coopertition bonus.
	// if SustainabilityBonusLinkThresholdWithCoop > 0 && summary.CoopertitionBonus {
	// 	summary.NumLinksGoal = SustainabilityBonusLinkThresholdWithCoop
	// }
	// if summary.NumLinks >= summary.NumLinksGoal {
	// 	summary.SustainabilityBonusRankingPoint = true
	// }
	// summary.ActivationBonusRankingPoint = summary.ChargeStationPoints >= ActivationBonusPointThreshold

	if summary.MelodyBonus {
		summary.BonusRankingPoints++
	}
	if summary.EnsambleBonus {
		summary.BonusRankingPoints++
	}

	return summary
}

// Returns true if and only if all fields of the two scores are equal.
func (score *Score) Equals(other *Score) bool {
	if score.MobilityStatuses != other.MobilityStatuses ||
		score.AutoAmpNotes != other.AutoAmpNotes ||
		score.AutoSpeakerNotes != other.AutoSpeakerNotes ||
		score.TeleopAmpedSpeakerNotes != other.TeleopAmpedSpeakerNotes ||
		score.TeleopAmpNotes != other.TeleopAmpNotes ||
		score.TeleopSpeakerNotes != other.TeleopAmpNotes ||
		score.TrapNotes != other.TrapNotes ||
		score.EndgameStatuses != other.EndgameStatuses ||
		score.PlayoffDq != other.PlayoffDq ||
		len(score.Fouls) != len(other.Fouls) {
		return false
	}

	for i, foul := range score.Fouls {
		if foul != other.Fouls[i] {
			return false
		}
	}

	return true
}
