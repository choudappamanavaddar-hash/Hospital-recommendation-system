import prisma from '../config/database';

export interface RequirementInput {
  visitReason: string;
  symptoms: string;
  existingConditions?: string;
  preferredDepartmentId?: string;
  preferredDoctorId?: string;
}

export interface RecommendationResult {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  description: string;
  services: string;
  matchScore: number;
  matchReason: string;
  urgentCareNotice?: string;
  availableDoctors: Array<{
    id: string;
    fullName: string;
    specialty: string;
    availableDays: string;
  }>;
}

export const generateDepartmentRecommendations = async (input: RequirementInput): Promise<RecommendationResult[]> => {
  const departments = await prisma.department.findMany({
    where: { active: true },
    include: {
      doctors: {
        where: { active: true },
        select: { id: true, fullName: true, specialty: true, availableDays: true },
      },
    },
  });

  const textToAnalyze = `${input.visitReason} ${input.symptoms} ${input.existingConditions || ''}`.toLowerCase();

  // Urgent care keywords trigger red-flag notice
  const isRedFlag =
    textToAnalyze.includes('chest pain') ||
    textToAnalyze.includes('severe shortness of breath') ||
    textToAnalyze.includes('sudden numbness') ||
    textToAnalyze.includes('unconscious') ||
    textToAnalyze.includes('heavy bleeding');

  const urgentNotice = isRedFlag
    ? '⚠️ Red-Flag Symptoms Detected: If you are experiencing severe chest pain, extreme dyspnea, sudden numbness or speech difficulty, please proceed directly to the Emergency Room or call emergency medical services immediately.'
    : undefined;

  const departmentKeywords: Record<string, string[]> = {
    CARD: ['chest', 'heart', 'palpitation', 'hypertension', 'cardiac', 'blood pressure', 'angina', 'shortness of breath'],
    NEUR: ['headache', 'migraine', 'dizziness', 'seizure', 'numbness', 'tingling', 'brain', 'nerve', 'paralysis', 'memory'],
    ORTH: ['bone', 'joint', 'knee', 'fracture', 'spine', 'back pain', 'shoulder', 'ligament', 'sprain', 'arthritis', 'walking'],
    PEDI: ['child', 'infant', 'baby', 'pediatric', 'toddler', 'vaccination', 'growth'],
    DERM: ['skin', 'rash', 'itching', 'acne', 'eczema', 'mole', 'dermatitis', 'lesion', 'hair loss'],
    GENM: ['fever', 'cough', 'fatigue', 'flu', 'weakness', 'infection', 'diabetes', 'thyroid', 'general', 'cold', 'stomach'],
  };

  const results: RecommendationResult[] = departments.map((dept) => {
    let score = 30; // base score for active departments
    const matchReasons: string[] = [];

    // 1. Direct preference check
    if (input.preferredDepartmentId === dept.id) {
      score += 40;
      matchReasons.push('Directly matches your preferred department selection.');
    }

    // 2. Keyword matching
    const keywords = departmentKeywords[dept.code] || [];
    let matchedKeywords: string[] = [];
    for (const kw of keywords) {
      if (textToAnalyze.includes(kw)) {
        matchedKeywords.push(kw);
      }
    }

    if (matchedKeywords.length > 0) {
      const keywordBoost = Math.min(matchedKeywords.length * 20, 50);
      score += keywordBoost;
      matchReasons.push(`Matches reported symptoms/terms: "${matchedKeywords.join(', ')}".`);
    }

    // 3. Service coverage match
    const servicesList = dept.services.toLowerCase();
    if (textToAnalyze.split(' ').some((word) => word.length > 3 && servicesList.includes(word))) {
      score += 10;
      matchReasons.push('Department provides specialized services matching your consultation reason.');
    }

    // Cap score at 98% (reserving 100% for doctor final evaluation)
    const finalScore = Math.min(Math.round(score), 98);

    const matchReason =
      matchReasons.length > 0
        ? matchReasons.join(' ')
        : 'General medical department suitable for comprehensive healthcare evaluation.';

    return {
      departmentId: dept.id,
      departmentName: dept.name,
      departmentCode: dept.code,
      description: dept.description,
      services: dept.services,
      matchScore: finalScore,
      matchReason,
      urgentCareNotice: urgentNotice,
      availableDoctors: dept.doctors,
    };
  });

  // Sort descending by match score
  results.sort((a, b) => b.matchScore - a.matchScore);

  return results;
};
