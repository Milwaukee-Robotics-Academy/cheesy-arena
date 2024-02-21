// Copyright 2022 Team 254. All Rights Reserved.
// Author: pat@patfairbank.com (Patrick Fairbank)
//
// Defines the tournament structure for a double-elimination bracket culminating in a best-of-three final.

package playoff

import (
	"fmt"

	"github.com/Team254/cheesy-arena/model"
)

// Creates a double-elimination bracket and returns the root matchup comprising the tournament finals along with
// scheduled breaks. Only supports having exactly eight alliances.
func newDoubleEliminationBracket(numAlliances int) (*Matchup, []breakSpec, error) {
	// if numAlliances != 3 {
	// 	return nil, nil, fmt.Errorf("double-elimination bracket must have exactly 3 alliances")
	// }

	// Define Round 1 matches.
	m1 := Matchup{
		id:                 "M1",
		NumWinsToAdvance:   1,
		redAllianceSource:  allianceSelectionSource{2},
		blueAllianceSource: allianceSelectionSource{3},
		matchSpecs:         newDoubleEliminationMatch(1, "Round 1 Upper", 300),
	}

	// Define Round 2 matches.
	m2 := Matchup{
		id:                 "M2",
		NumWinsToAdvance:   1,
		redAllianceSource:  allianceSelectionSource{1},
		blueAllianceSource: matchupSource{matchup: &m1, useWinner: true},
		matchSpecs:         newDoubleEliminationMatch(2, "Round 2 Upper", 300),
	}

	// Define Round 3 matches.
	m3 := Matchup{
		id:                 "M3",
		NumWinsToAdvance:   1,
		redAllianceSource:  matchupSource{matchup: &m2, useWinner: false},
		blueAllianceSource: matchupSource{matchup: &m1, useWinner: false},
		matchSpecs:         newDoubleEliminationMatch(3, "Round 3 Lower", 300),
	}

	// Define final matches.
	final := Matchup{
		id:                 "F",
		NumWinsToAdvance:   2,
		redAllianceSource:  matchupSource{matchup: &m2, useWinner: true},
		blueAllianceSource: matchupSource{matchup: &m3, useWinner: true},
		matchSpecs:         newFinalMatches(4),
	}

	// Define scheduled breaks.
	breakSpecs := []breakSpec{
		{2, 600, "Field Break"},
		{3, 600, "Field Break"},
		{4, 600, "Awards Break - Celebrate, Cooperate"},
		{5, 600, "Awards Break - Highest Rookie Seed, Create, Build, Program"},
		{6, 600, "Field Break"},
	}

	return &final, breakSpecs, nil
}

// Helper method to create the matches for a given pre-final double-elimination matchup.
func newDoubleEliminationMatch(number int, nameDetail string, durationSec int) []*matchSpec {
	return []*matchSpec{
		{
			longName:            fmt.Sprintf("Match %d", number),
			shortName:           fmt.Sprintf("M%d", number),
			nameDetail:          nameDetail,
			order:               number,
			durationSec:         durationSec,
			useTiebreakCriteria: true,
			tbaMatchKey:         model.TbaMatchKey{"sf", number, 1},
		},
	}
}
