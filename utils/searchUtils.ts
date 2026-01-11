
import { CrewMember } from '../components/CrewUI';

/**
 * Calculates the Levenshtein distance between two strings.
 * Used for typo tolerance.
 */
function levenshteinDistance(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[len1][len2];
}

/**
 * Checks if a search term is "close enough" to a target string.
 * Tolerance is relative to the length of the strings.
 */
function isFuzzyMatch(term: string, target: string): boolean {
  if (target.includes(term)) return true;
  if (term.length < 3) return false;
  
  const distance = levenshteinDistance(term, target);
  const threshold = Math.floor(target.length * 0.3); // 30% typo tolerance
  return distance <= threshold;
}

/**
 * Ranks a crew member based on relevance to a multi-word search query.
 */
export function calculateCrewRelevance(member: CrewMember, query: string): number {
  if (!query.trim()) return 0;

  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 0);
  let totalScore = 0;

  const nameLower = member.name.toLowerCase();
  const roleLower = member.role.toLowerCase();
  const bioLower = member.bio.toLowerCase();
  const certsLower = member.certifications.map(c => c.toLowerCase());

  for (const term of terms) {
    let termScore = 0;

    // 1. EXACT NAME MATCH (Highest priority)
    if (nameLower === term) {
      termScore += 100;
    } else if (nameLower.startsWith(term)) {
      termScore += 50;
    } else if (nameLower.includes(term)) {
      termScore += 30;
    } else if (isFuzzyMatch(term, nameLower)) {
      termScore += 20;
    }

    // 2. EXACT ROLE MATCH
    if (roleLower === term) {
      termScore += 80;
    } else if (roleLower.includes(term)) {
      termScore += 25;
    }

    // 3. CERTIFICATIONS (Skills)
    for (const cert of certsLower) {
      if (cert === term) {
        termScore += 40;
      } else if (cert.includes(term)) {
        termScore += 15;
      } else if (isFuzzyMatch(term, cert)) {
        termScore += 10;
      }
    }

    // 4. BIO (Fuzzy search not recommended for long text to avoid noise)
    if (bioLower.includes(term)) {
      termScore += 5;
    }

    // Every term should ideally contribute. If a term matches nothing, reduce score.
    if (termScore === 0) {
      totalScore -= 10;
    } else {
      totalScore += termScore;
    }
  }

  return totalScore;
}
