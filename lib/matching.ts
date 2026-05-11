import { Participant, MatchedParticipant } from "./types";

function intersection<T>(a: T[], b: T[]): T[] {
  return a.filter((x) => b.includes(x));
}

export function calcScore(me: Participant, other: Participant): MatchedParticipant {
  const phaseScore = me.phase === other.phase ? 3 : 0;
  const directionsScore = intersection(me.directions, other.directions).length * 2;
  const traitsScore = intersection(me.traits, other.traits).length * 1;
  const hashtagsScore =
    intersection(
      me.hashtags.map((h) => h.toLowerCase()),
      other.hashtags.map((h) => h.toLowerCase())
    ).length * 2;

  return {
    ...other,
    score: phaseScore + directionsScore + traitsScore + hashtagsScore,
    breakdown: {
      phase: phaseScore,
      directions: directionsScore,
      traits: traitsScore,
      hashtags: hashtagsScore,
    },
  };
}

export function rankParticipants(
  me: Participant,
  all: Participant[]
): MatchedParticipant[] {
  return all
    .filter((p) => p.id !== me.id)
    .map((p) => calcScore(me, p))
    .sort((a, b) => b.score - a.score);
}
