import {
  toMoodScore,
  fromMoodScore,
  toZeroToFour,
  fromZeroToFour,
  minutesToSleepHours,
  sleepHoursToMinutes,
} from "./mappers";

describe("mappers", () => {
  it("maps mood both directions", () => {
    expect(toMoodScore(1)).toBe(-2);
    expect(toMoodScore(5)).toBe(2);
    expect(fromMoodScore(-2)).toBe(1);
    expect(fromMoodScore(2)).toBe(5);
  });

  it("clamps mood extremes reserved for clinical input", () => {
    expect(toMoodScore(10)).toBe(2);
    expect(toMoodScore(-10)).toBe(-2);
    expect(fromMoodScore(-3)).toBe(1);
    expect(fromMoodScore(3)).toBe(5);
  });

  it("maps 0..4 scales both directions", () => {
    expect(toZeroToFour(1)).toBe(0);
    expect(toZeroToFour(5)).toBe(4);
    expect(fromZeroToFour(0)).toBe(1);
    expect(fromZeroToFour(4)).toBe(5);
  });

  it("clamps 0..4 scales", () => {
    expect(toZeroToFour(0)).toBe(0);
    expect(toZeroToFour(10)).toBe(4);
    expect(fromZeroToFour(-1)).toBe(1);
    expect(fromZeroToFour(10)).toBe(5);
  });

  it("converts sleep duration", () => {
    expect(minutesToSleepHours(330)).toBe(5.5);
    expect(sleepHoursToMinutes(5.5)).toBe(330);
    expect(minutesToSleepHours(0)).toBe(0);
    expect(sleepHoursToMinutes(0)).toBe(0);
  });

  it("round-trips mobile values", () => {
    for (let m = 1; m <= 5; m++) {
      expect(fromMoodScore(toMoodScore(m))).toBe(m);
      expect(fromZeroToFour(toZeroToFour(m))).toBe(m);
    }
  });
});
