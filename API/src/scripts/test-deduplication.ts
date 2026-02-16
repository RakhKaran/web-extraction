/**
 * Test script to demonstrate deduplication algorithms
 * 
 * Run with: npm run test:dedup
 */

// Mock data for testing
const testRecords = [
  {
    title: "Software Engineer",
    company: "Google Inc",
    location: "Mountain View, CA",
    email: "job1@google.com"
  },
  {
    title: "Software Engr",
    company: "Google",
    location: "Mountain View, California",
    email: "job2@google.com"
  },
  {
    title: "Senior Software Engineer",
    company: "Microsoft Corporation",
    location: "Redmond, WA",
    email: "job3@microsoft.com"
  },
  {
    title: "Sr Software Engineer",
    company: "Microsoft Corp",
    location: "Redmond, Washington",
    email: "job4@microsoft.com"
  }
];

// Levenshtein distance
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

  let prefix = 0;
  for (let i = 0; i < Math.min(len1, len2, 4); i++) {
    if (str1[i] === str2[i]) prefix++;
    else break;
  }

  return jaro + prefix * 0.1 * (1 - jaro);
}

// Soundex
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

// Test functions
console.log('='.repeat(80));
console.log('DEDUPLICATION ALGORITHMS TEST');
console.log('='.repeat(80));

console.log('\n1. EXACT MATCH TEST');
console.log('-'.repeat(80));
console.log('Record 1:', testRecords[0].title, '@', testRecords[0].company);
console.log('Record 2:', testRecords[1].title, '@', testRecords[1].company);
console.log('Exact Match:', testRecords[0].title === testRecords[1].title && testRecords[0].company === testRecords[1].company);

console.log('\n2. FUZZY MATCH TEST (Jaro-Winkler)');
console.log('-'.repeat(80));
for (let i = 0; i < testRecords.length; i++) {
  for (let j = i + 1; j < testRecords.length; j++) {
    const rec1 = testRecords[i];
    const rec2 = testRecords[j];
    
    const titleSim = jaroWinklerSimilarity(
      rec1.title.toLowerCase(),
      rec2.title.toLowerCase()
    );
    const companySim = jaroWinklerSimilarity(
      rec1.company.toLowerCase(),
      rec2.company.toLowerCase()
    );
    const avgSim = (titleSim + companySim) / 2;
    
    console.log(`\nComparing:`);
    console.log(`  Record ${i + 1}: "${rec1.title}" @ "${rec1.company}"`);
    console.log(`  Record ${j + 1}: "${rec2.title}" @ "${rec2.company}"`);
    console.log(`  Title Similarity: ${(titleSim * 100).toFixed(2)}%`);
    console.log(`  Company Similarity: ${(companySim * 100).toFixed(2)}%`);
    console.log(`  Average Similarity: ${(avgSim * 100).toFixed(2)}%`);
    console.log(`  Duplicate (threshold 80%): ${avgSim >= 0.8 ? 'YES' : 'NO'}`);
  }
}

console.log('\n3. PHONETIC MATCH TEST (Soundex)');
console.log('-'.repeat(80));
const names = [
  'Smith', 'Smyth', 'Schmidt',
  'Johnson', 'Jonson', 'Johnsen',
  'Catherine', 'Katherine', 'Kathryn'
];

for (let i = 0; i < names.length; i += 3) {
  console.log(`\nGroup ${i / 3 + 1}:`);
  for (let j = 0; j < 3; j++) {
    const name = names[i + j];
    const code = soundex(name);
    console.log(`  ${name.padEnd(15)} → ${code}`);
  }
}

console.log('\n4. LEVENSHTEIN DISTANCE TEST');
console.log('-'.repeat(80));
const pairs = [
  ['Software Engineer', 'Software Engr'],
  ['Google Inc', 'Google'],
  ['Mountain View, CA', 'Mountain View, California'],
  ['Microsoft Corporation', 'Microsoft Corp']
];

for (const [str1, str2] of pairs) {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLen = Math.max(str1.length, str2.length);
  const similarity = ((maxLen - distance) / maxLen * 100).toFixed(2);
  
  console.log(`\n"${str1}" vs "${str2}"`);
  console.log(`  Edit Distance: ${distance}`);
  console.log(`  Similarity: ${similarity}%`);
}

console.log('\n5. HYBRID MATCH TEST');
console.log('-'.repeat(80));
console.log('Combining exact, fuzzy, and phonetic matching with weights:');
console.log('  - Exact match: weight 1.0');
console.log('  - Fuzzy match: weight 0.7');
console.log('  - Phonetic match: weight 0.3');

for (let i = 0; i < testRecords.length; i++) {
  for (let j = i + 1; j < testRecords.length; j++) {
    const rec1 = testRecords[i];
    const rec2 = testRecords[j];
    
    let totalScore = 0;
    let maxScore = 0;
    
    // Title comparison
    const title1 = rec1.title.toLowerCase();
    const title2 = rec2.title.toLowerCase();
    
    if (title1 === title2) {
      totalScore += 1.0;
    } else {
      totalScore += jaroWinklerSimilarity(title1, title2) * 0.7;
      if (soundex(title1) === soundex(title2)) {
        totalScore += 0.3;
      }
    }
    maxScore += 1.0;
    
    // Company comparison
    const company1 = rec1.company.toLowerCase();
    const company2 = rec2.company.toLowerCase();
    
    if (company1 === company2) {
      totalScore += 1.0;
    } else {
      totalScore += jaroWinklerSimilarity(company1, company2) * 0.7;
      if (soundex(company1) === soundex(company2)) {
        totalScore += 0.3;
      }
    }
    maxScore += 1.0;
    
    const finalScore = totalScore / maxScore;
    
    console.log(`\nComparing:`);
    console.log(`  Record ${i + 1}: "${rec1.title}" @ "${rec1.company}"`);
    console.log(`  Record ${j + 1}: "${rec2.title}" @ "${rec2.company}"`);
    console.log(`  Hybrid Score: ${(finalScore * 100).toFixed(2)}%`);
    console.log(`  Duplicate (threshold 75%): ${finalScore >= 0.75 ? 'YES' : 'NO'}`);
  }
}

console.log('\n' + '='.repeat(80));
console.log('TEST COMPLETE');
console.log('='.repeat(80));
