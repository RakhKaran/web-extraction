import { Context, inject } from "@loopback/core";
import { DefaultCrudRepository } from "@loopback/repository";

// Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
}

// Jaro-Winkler similarity
function jaroWinklerSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0 && len2 === 0) return 1.0;
  if (len1 === 0 || len2 === 0) return 0.0;

  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;
  const str1Matches = new Array(len1).fill(false);
  const str2Matches = new Array(len2).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, len2);

    for (let j = start; j < end; j++) {
      if (str2Matches[j] || str1[i] !== str2[j]) continue;
      str1Matches[i] = true;
      str2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!str1Matches[i]) continue;
    while (!str2Matches[k]) k++;
    if (str1[i] !== str2[k]) transpositions++;
    k++;
  }

  const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;

  // Jaro-Winkler prefix bonus
  let prefix = 0;
  for (let i = 0; i < Math.min(len1, len2, 4); i++) {
    if (str1[i] === str2[i]) prefix++;
    else break;
  }

  return jaro + prefix * 0.1 * (1 - jaro);
}

// Soundex phonetic encoding
function soundex(str: string): string {
  const s = str.toUpperCase().replace(/[^A-Z]/g, '');
  if (s.length === 0) return '0000';

  const firstLetter = s[0];
  const codes: { [key: string]: string } = {
    B: '1', F: '1', P: '1', V: '1',
    C: '2', G: '2', J: '2', K: '2', Q: '2', S: '2', X: '2', Z: '2',
    D: '3', T: '3',
    L: '4',
    M: '5', N: '5',
    R: '6'
  };

  let soundexCode = firstLetter;
  let prevCode = codes[firstLetter] || '0';

  for (let i = 1; i < s.length && soundexCode.length < 4; i++) {
    const code = codes[s[i]] || '0';
    if (code !== '0' && code !== prevCode) {
      soundexCode += code;
    }
    prevCode = code;
  }

  return soundexCode.padEnd(4, '0');
}

// Metaphone phonetic encoding (simplified)
function metaphone(str: string): string {
  const s = str.toUpperCase().replace(/[^A-Z]/g, '');
  if (s.length === 0) return '';

  let result = '';
  let i = 0;

  // Drop initial letters
  if (s.startsWith('KN') || s.startsWith('GN') || s.startsWith('PN') || s.startsWith('AE') || s.startsWith('WR')) {
    i = 1;
  }

  while (i < s.length && result.length < 4) {
    const c = s[i];
    const next = s[i + 1] || '';

    if (i === 0 && 'AEIOU'.includes(c)) {
      result += c;
    } else if (c === 'B') {
      if (i === s.length - 1 && s[i - 1] === 'M') {
        // skip
      } else {
        result += 'B';
      }
    } else if (c === 'C') {
      if (next === 'H') {
        result += 'X';
        i++;
      } else if ('EIY'.includes(next)) {
        result += 'S';
      } else {
        result += 'K';
      }
    } else if (c === 'D') {
      if (next === 'G' && 'EIY'.includes(s[i + 2] || '')) {
        result += 'J';
        i++;
      } else {
        result += 'T';
      }
    } else if (c === 'G') {
      if (next === 'H' && i < s.length - 2) {
        // skip
      } else if (next === 'N' && i === s.length - 2) {
        // skip
      } else if ('EIY'.includes(next)) {
        result += 'J';
      } else {
        result += 'K';
      }
    } else if (c === 'H') {
      if (i > 0 && 'AEIOU'.includes(s[i - 1]) && !'AEIOU'.includes(next)) {
        // skip
      } else {
        result += 'H';
      }
    } else if (c === 'K') {
      if (i > 0 && s[i - 1] === 'C') {
        // skip
      } else {
        result += 'K';
      }
    } else if (c === 'P') {
      if (next === 'H') {
        result += 'F';
        i++;
      } else {
        result += 'P';
      }
    } else if (c === 'Q') {
      result += 'K';
    } else if (c === 'S') {
      if (next === 'H' || (next === 'I' && 'OA'.includes(s[i + 2] || ''))) {
        result += 'X';
        i++;
      } else {
        result += 'S';
      }
    } else if (c === 'T') {
      if (next === 'H') {
        result += '0';
        i++;
      } else if (next === 'I' && 'OA'.includes(s[i + 2] || '')) {
        result += 'X';
      } else {
        result += 'T';
      }
    } else if (c === 'V') {
      result += 'F';
    } else if (c === 'W' || c === 'Y') {
      if ('AEIOU'.includes(next)) {
        result += c;
      }
    } else if (c === 'X') {
      result += 'KS';
    } else if (c === 'Z') {
      result += 'S';
    } else if ('FHJLMNR'.includes(c)) {
      result += c;
    }

    i++;
  }

  return result;
}

export class DeduplicationService {
  constructor(
    @inject.context() private ctx: Context,
  ) { }

  /**
   * Check if a record is a duplicate based on the configured algorithm
   */
  async isDuplicate(
    record: any,
    repository: DefaultCrudRepository<any, any>,
    constraints: Array<{
      fields: string[];
      algorithm: string;
      threshold?: number;
    }>
  ): Promise<boolean> {
    if (!constraints || constraints.length === 0) {
      // No constraints = no deduplication
      return false;
    }

    for (const constraint of constraints) {
      const { fields, algorithm, threshold = 0.8 } = constraint;

      switch (algorithm) {
        case 'exact_match':
          if (await this.exactMatch(record, repository, fields)) {
            return true;
          }
          break;

        case 'composite_match':
          if (await this.compositeMatch(record, repository, fields)) {
            return true;
          }
          break;

        case 'fuzzy_match':
          if (await this.fuzzyMatch(record, repository, fields, threshold)) {
            return true;
          }
          break;

        case 'phonetic_match':
          if (await this.phoneticMatch(record, repository, fields)) {
            return true;
          }
          break;

        case 'hybrid_match':
          if (await this.hybridMatch(record, repository, fields, threshold)) {
            return true;
          }
          break;

        default:
          console.warn(`Unknown deduplication algorithm: ${algorithm}`);
      }
    }

    return false;
  }

  /**
   * Exact Match: Checks if all specified fields match exactly
   */
  private async exactMatch(
    record: any,
    repository: DefaultCrudRepository<any, any>,
    fields: string[]
  ): Promise<boolean> {
    const whereConditions = fields.map(field => ({
      [field]: record[field]
    }));

    const existing = await repository.findOne({
      where: { and: whereConditions }
    });

    return existing !== null;
  }

  /**
   * Composite Match: Same as exact match but explicitly for multiple fields
   */
  private async compositeMatch(
    record: any,
    repository: DefaultCrudRepository<any, any>,
    fields: string[]
  ): Promise<boolean> {
    return this.exactMatch(record, repository, fields);
  }

  /**
   * Fuzzy Match: Uses Levenshtein and Jaro-Winkler for similarity
   */
  private async fuzzyMatch(
    record: any,
    repository: DefaultCrudRepository<any, any>,
    fields: string[],
    threshold: number
  ): Promise<boolean> {
    // Fetch all records (or use pagination for large datasets)
    const allRecords = await repository.find();

    for (const existingRecord of allRecords) {
      let totalSimilarity = 0;
      let validFields = 0;

      for (const field of fields) {
        const val1 = String(record[field] || '').toLowerCase().trim();
        const val2 = String(existingRecord[field] || '').toLowerCase().trim();

        if (val1 === '' || val2 === '') continue;

        // Calculate similarity using Jaro-Winkler
        const similarity = jaroWinklerSimilarity(val1, val2);
        totalSimilarity += similarity;
        validFields++;
      }

      if (validFields > 0) {
        const avgSimilarity = totalSimilarity / validFields;
        if (avgSimilarity >= threshold) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Phonetic Match: Uses Soundex and Metaphone
   */
  private async phoneticMatch(
    record: any,
    repository: DefaultCrudRepository<any, any>,
    fields: string[]
  ): Promise<boolean> {
    const allRecords = await repository.find();

    for (const existingRecord of allRecords) {
      let matches = 0;

      for (const field of fields) {
        const val1 = String(record[field] || '').trim();
        const val2 = String(existingRecord[field] || '').trim();

        if (val1 === '' || val2 === '') continue;

        const soundex1 = soundex(val1);
        const soundex2 = soundex(val2);

        const metaphone1 = metaphone(val1);
        const metaphone2 = metaphone(val2);

        // Match if either Soundex or Metaphone matches
        if (soundex1 === soundex2 || metaphone1 === metaphone2) {
          matches++;
        }
      }

      // If all fields match phonetically
      if (matches === fields.length) {
        return true;
      }
    }

    return false;
  }

  /**
   * Hybrid Match: Combines exact, fuzzy, and phonetic with weighted scoring
   */
  private async hybridMatch(
    record: any,
    repository: DefaultCrudRepository<any, any>,
    fields: string[],
    threshold: number
  ): Promise<boolean> {
    const allRecords = await repository.find();

    for (const existingRecord of allRecords) {
      let totalScore = 0;
      let maxScore = 0;

      for (const field of fields) {
        const val1 = String(record[field] || '').toLowerCase().trim();
        const val2 = String(existingRecord[field] || '').toLowerCase().trim();

        if (val1 === '' || val2 === '') continue;

        // Exact match: weight 1.0
        if (val1 === val2) {
          totalScore += 1.0;
          maxScore += 1.0;
          continue;
        }

        // Fuzzy match: weight 0.7
        const fuzzySimilarity = jaroWinklerSimilarity(val1, val2);
        totalScore += fuzzySimilarity * 0.7;

        // Phonetic match: weight 0.3
        const soundex1 = soundex(val1);
        const soundex2 = soundex(val2);
        if (soundex1 === soundex2) {
          totalScore += 0.3;
        }

        maxScore += 1.0;
      }

      if (maxScore > 0) {
        const finalScore = totalScore / maxScore;
        if (finalScore >= threshold) {
          return true;
        }
      }
    }

    return false;
  }
}
