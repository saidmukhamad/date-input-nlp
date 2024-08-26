class DateParser {
  private customPhrases: Map<string, Function>;
  private months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  private timeZones: Map<string, number>;

  constructor() {
    this.customPhrases = new Map();
  }

  parse(input: string): ParsedDate[] {
    if (!input || input.trim() === "") {
      return [];
    }
    input = input.toLowerCase().trim();
    const results: ParsedDate[] = [];

    // Custom phrases
    for (const [phrase, interpretation] of this.customPhrases) {
      if (input.includes(phrase)) {
        const result = interpretation(input);
        if (result) results.push({ ...result, confidence: 1 });
      }
    }

    // Specific time
    const specificTimeRegex = /(?:(?:today|tomorrow)\s+)?(?:at\s+)?(\d{1,2})(?::(\d{2}))?(?:\s*(am|pm))?(?:\s+([\w+\-]+))?/;
    const specificTimeMatch = input.match(specificTimeRegex);
    if (specificTimeMatch) {
      const [_, hours, minutes = "0", ampm, timezone] = specificTimeMatch;
      let hour = parseInt(hours);
      if (ampm === "pm" && hour !== 12) hour += 12;
      if (ampm === "am" && hour === 12) hour = 0;
      results.push({
        type: "specific_time",
        value: {
          days: input.includes("tomorrow") ? 1 : 0,
          hours: hour,
          minutes: parseInt(minutes),
        },
        confidence: 0.9,
      });
    }

    // Specific date
    const specificDateRegex = /(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?/;
    const specificDateMatch = input.match(specificDateRegex);
    if (specificDateMatch) {
      const [_, day, month, year = new Date().getFullYear().toString()] = specificDateMatch;
      results.push({
        type: "specific_date",
        value: {
          day: parseInt(day),
          month: parseInt(month) - 1,
          year: parseInt(year) < 100 ? 2000 + parseInt(year) : parseInt(year),
        },
        confidence: 0.9,
      });
    }

    // Numeric time expressions
    const numericRegex = /in (\d+) (minute|hour|day|week|month|year)s?(?:\s+at\s+(\d{1,2})(?::(\d{2}))?(?:\s*(am|pm))?)?/;
    const numericMatch = input.match(numericRegex);
    if (numericMatch) {
      const [_, amount, unit, atHours, atMinutes, atAmPm] = numericMatch;
      const result: any = {
        type: "numeric",
        value: { [unit + "s"]: parseInt(amount) },
        confidence: 0.8,
      };
      if (atHours) {
        let hour = parseInt(atHours);
        if (atAmPm === "pm" && hour !== 12) hour += 12;
        if (atAmPm === "am" && hour === 12) hour = 0;
        result.value.atTime = { hours: hour, minutes: atMinutes ? parseInt(atMinutes) : 0 };
      }
      results.push(result);
    }

    // Relative expressions
    if (input === "tomorrow") {
      results.push({
        type: "relative",
        value: { days: 1 },
        confidence: 1,
      });
    }

    // Random time expressions
    if (input.includes("random")) {
      const randomRegex = /random amount of (minute|hour|day|week|month|year)s/;
      const randomMatch = input.match(randomRegex);
      if (randomMatch) {
        const [_, unit] = randomMatch;
        results.push({
          type: "random",
          value: { unit: unit + "s" },
          confidence: 0.7,
        });
      }
    }

    // If no results, treat as partial input
    if (results.length === 0) {
      results.push({
        type: "partial",
        value: input,
        confidence: 0.5,
      });
    }

    return results;
  }

  addCustomPhrase(phrase: string, interpretation: Function): void {
    this.customPhrases.set(phrase.toLowerCase(), interpretation);
  }
}

export interface DateSuggestion {
  text: string;
  date: Date;
  probability: number;
}

interface ParsedDate {
  type: string;
  value: unknown;
  confidence: number;
}
class DateGenerator {
  generateDate(parsedDate: ParsedDate): Date {
    const now = new Date();
    let result = new Date(now);

    switch (parsedDate.type) {
      case "specific_time":
        result.setHours(parsedDate.value.hours, parsedDate.value.minutes, 0, 0);
        if (parsedDate.value.days) {
          result.setDate(result.getDate() + parsedDate.value.days);
        }
        return result;
      case "specific_date":
        return new Date(parsedDate.value.year, parsedDate.value.month, parsedDate.value.day);
      case "numeric":
      case "relative":
        Object.entries(parsedDate.value).forEach(([unit, value]) => {
          if (unit === "atTime") {
            result.setHours(value.hours, value.minutes, 0, 0);
          } else {
            switch (unit) {
              case "minutes":
                result.setMinutes(result.getMinutes() + value);
                break;
              case "hours":
                result.setHours(result.getHours() + value);
                break;
              case "days":
                result.setDate(result.getDate() + value);
                break;
              case "weeks":
                result.setDate(result.getDate() + value * 7);
                break;
              case "months":
                result.setMonth(result.getMonth() + value);
                break;
              case "years":
                result.setFullYear(result.getFullYear() + value);
                break;
            }
          }
        });
        return result;
      case "random":
        const maxAmount = 100;
        const randomAmount = Math.floor(Math.random() * maxAmount) + 1;
        result.setDate(result.getDate() + randomAmount);
        return result;
      default:
        return result;
    }
  }
}

class SuggestionEngine {
  private dateGenerator: DateGenerator;
  private timeUnits = ["minute", "hour", "day", "week", "month", "year"];
  private commonTimes = ["9:00", "12:00", "15:00", "18:00"];

  constructor(private dateParser: DateParser) {
    this.dateGenerator = new DateGenerator();
  }

  generateSuggestions(input: string): Array<DateSuggestion> {
    const parsedResults = this.dateParser.parse(input);
    const suggestions: Array<DateSuggestion> = [];

    if (parsedResults.length === 0 || parsedResults[0].type === "partial") {
      suggestions.push(...this.generatePartialSuggestions(input));
    } else {
      for (const parsedDate of parsedResults) {
        switch (parsedDate.type) {
          case "specific_time":
            const dayText = parsedDate.value.days === 1 ? "Tomorrow" : "Today";
            let timeText = this.formatTime(parsedDate.value);
            if (parsedDate.value.timezone !== undefined) {
              timeText += ` ${this.formatTimezone(parsedDate.value.timezone)}`;
            }
            const suggestionText = `${dayText} at ${timeText}`;
            suggestions.push({
              text: suggestionText,
              date: this.dateGenerator.generateDate(parsedDate),
              probability: this.calculateReverseSimilarity(input, suggestionText),
            });
            if (parsedDate.value.days === 0 && !input.toLowerCase().includes("today")) {
              const tomorrowSuggestion = `Tomorrow at ${timeText}`;
              suggestions.push({
                text: tomorrowSuggestion,
                date: this.dateGenerator.generateDate({ ...parsedDate, value: { ...parsedDate.value, days: 1 } }),
                probability: this.calculateReverseSimilarity(input, tomorrowSuggestion),
              });
            }
            break;
          case "specific_date":
            const dateText = this.formatDate(parsedDate.value);
            suggestions.push({
              text: dateText,
              date: this.dateGenerator.generateDate(parsedDate),
              probability: this.calculateReverseSimilarity(input, dateText),
            });
            break;
          case "numeric":
            let numericText = `In ${this.formatTimeUnits(parsedDate.value)}`;
            if (parsedDate.value.atTime) {
              numericText += ` at ${this.formatTime(parsedDate.value.atTime)}`;
            }
            suggestions.push({
              text: numericText,
              date: this.dateGenerator.generateDate(parsedDate),
              probability: this.calculateReverseSimilarity(input, numericText),
            });
            break;
          case "relative":
          case "random":
            const relativeText = this.formatTimeUnits(parsedDate.value);
            suggestions.push({
              text: relativeText,
              date: this.dateGenerator.generateDate(parsedDate),
              probability: this.calculateReverseSimilarity(input, relativeText),
            });
            break;
        }
      }
    }

    return suggestions.sort((a, b) => b.probability - a.probability);
  }

  private generatePartialSuggestions(input: string): Array<DateSuggestion> {
    const suggestions: Array<DateSuggestion> = [];
    const words = input.toLowerCase().split(/\s+/);

    if (words[0] === "in") {
      if (words.length === 1) {
        suggestions.push(...this.generateTimeUnitSuggestions(1));
      } else if (words.length === 2) {
        const amount = parseInt(words[1]);
        if (!isNaN(amount)) {
          suggestions.push(...this.generateTimeUnitSuggestions(amount));
        }
      } else if (words.length >= 3) {
        const amount = parseInt(words[1]);
        const unitPartial = words.slice(2).join(" ");

        if (!isNaN(amount)) {
          suggestions.push(...this.generatePartialUnitSuggestions(amount, unitPartial));
        }
      }
    } else if (words[0] === "at") {
      if (words.length === 1) {
        suggestions.push(...this.generateAtTimeSuggestions());
      } else {
        const partialTime = words.slice(1).join(" ");
        suggestions.push(...this.generateAtTimeSuggestions(partialTime));
      }
    }

    if (suggestions.length === 0) {
      const defaultSuggestions = ["in 1 hour", "in 1 day", "in 1 week", "at 9:00", "at 12:00", "at 15:00", "at 18:00"];

      for (const suggestion of defaultSuggestions) {
        suggestions.push({
          text: suggestion,
          date: this.dateGenerator.generateDate(this.dateParser.parse(suggestion)[0]),
          probability: this.calculateReverseSimilarity(input, suggestion),
        });
      }
    }

    return suggestions;
  }

  private generateTimeUnitSuggestions(amount: number): Array<DateSuggestion> {
    return this.timeUnits.map((unit) => {
      const suggestionText = `In ${amount} ${unit}${amount !== 1 ? "s" : ""}`;
      return {
        text: suggestionText,
        date: this.dateGenerator.generateDate({ type: "numeric", value: { [unit + "s"]: amount } }),
        probability: 1,
      };
    });
  }

  private generatePartialUnitSuggestions(amount: number, partialUnit: string): Array<DateSuggestion> {
    return this.timeUnits
      .filter((unit) => unit.startsWith(partialUnit))
      .map((unit) => {
        const suggestionText = `In ${amount} ${unit}${amount !== 1 ? "s" : ""}`;
        return {
          text: suggestionText,
          date: this.dateGenerator.generateDate({ type: "numeric", value: { [unit + "s"]: amount } }),
          probability: this.calculateReverseSimilarity(partialUnit, unit),
        };
      });
  }

  private generateAtTimeSuggestions(partialTime: string = ""): Array<DateSuggestion> {
    const now = new Date();
    const suggestions: Array<DateSuggestion> = [];

    for (const time of this.commonTimes) {
      if (time.startsWith(partialTime)) {
        const [hours, minutes] = time.split(":").map(Number);
        const suggestionText = `Today at ${time}`;
        suggestions.push({
          text: suggestionText,
          date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes),
          probability: partialTime ? this.calculateReverseSimilarity(partialTime, time) : 1,
        });

        const tomorrowSuggestionText = `Tomorrow at ${time}`;
        suggestions.push({
          text: tomorrowSuggestionText,
          date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hours, minutes),
          probability: partialTime ? this.calculateReverseSimilarity(partialTime, time) * 0.9 : 0.9,
        });
      }
    }

    return suggestions;
  }

  private formatTime(value: { hours: number; minutes: number }): string {
    return `${value.hours.toString().padStart(2, "0")}:${value.minutes.toString().padStart(2, "0")}`;
  }

  private formatDate(value: { day: number; month: number; year: number }): string {
    return new Date(value.year, value.month, value.day).toLocaleDateString();
  }

  private formatTimeUnits(value: any): string {
    return Object.entries(value)
      .filter(([key, val]) => val !== 0 && key !== "atTime" && key !== "timezone")
      .map(([key, val]) => `${val} ${key.endsWith("s") ? key : key + (val !== 1 ? "s" : "")}`)
      .join(" and ");
  }

  private formatTimezone(offset: number): string {
    const sign = offset >= 0 ? "+" : "-";
    const absOffset = Math.abs(offset);
    return `GMT${sign}${absOffset}`;
  }

  private calculateReverseSimilarity(input: string, suggestion: string): number {
    const inputWords = input.toLowerCase().split(/\s+/);
    const suggestionWords = suggestion.toLowerCase().split(/\s+/);

    let matchedWords = 0;
    for (const inputWord of inputWords) {
      if (suggestionWords.includes(inputWord)) {
        matchedWords++;
      }
    }

    let similarity = matchedWords / suggestionWords.length;

    for (const inputWord of inputWords) {
      for (const suggestionWord of suggestionWords) {
        if (suggestionWord.startsWith(inputWord) && inputWord.length > 1) {
          similarity += 0.5 * (inputWord.length / suggestionWord.length);
        }
      }
    }

    return Math.min(similarity, 1);
  }
}

class NaturalLanguageDateTimePicker {
  private dateParser: DateParser;
  private suggestionEngine: SuggestionEngine;

  constructor() {
    this.dateParser = new DateParser();
    this.suggestionEngine = new SuggestionEngine(this.dateParser);
  }

  generateSuggestions(input: string): Array<DateSuggestion> {
    return this.suggestionEngine.generateSuggestions(input);
  }

  addCustomPhrase(phrase: string, interpretation: Function): void {
    this.dateParser.addCustomPhrase(phrase, interpretation);
  }
}

export { NaturalLanguageDateTimePicker };
