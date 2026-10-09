import { Recommendation, Department, Doctor } from '../types';

export const computeRecommendationsClient = (
  visitReason: string,
  symptoms: string,
  departments: Department[],
  doctors: Doctor[],
  preferredDepartmentId?: string
): Recommendation[] => {
  const combinedText = `${visitReason} ${symptoms}`.toLowerCase();

  const isRedFlag =
    combinedText.includes('chest pain') ||
    combinedText.includes('severe shortness of breath') ||
    combinedText.includes('sudden numbness') ||
    combinedText.includes('unconscious') ||
    combinedText.includes('heavy bleeding');

  const urgentNotice = isRedFlag
    ? '⚠️ Urgent Medical Notice: Reported symptoms may indicate a high-priority cardiovascular or neurological event. If experiencing chest pressure or acute numbness, please seek immediate emergency care.'
    : undefined;

  const keywordMap: Record<string, string[]> = {
    CARD: ['chest', 'heart', 'palpitation', 'hypertension', 'cardiac', 'blood pressure', 'angina', 'shortness of breath'],
    NEUR: ['headache', 'migraine', 'dizziness', 'seizure', 'numbness', 'tingling', 'brain', 'nerve', 'memory'],
    ORTH: ['bone', 'joint', 'knee', 'fracture', 'spine', 'back pain', 'shoulder', 'ligament', 'sprain', 'arthritis'],
    PEDI: ['child', 'infant', 'baby', 'pediatric', 'toddler', 'vaccination'],
    DERM: ['skin', 'rash', 'itching', 'acne', 'eczema', 'mole', 'dermatitis', 'lesion'],
    GENM: ['fever', 'cough', 'fatigue', 'flu', 'weakness', 'infection', 'diabetes', 'cold', 'general'],
  };

  return departments
    .map((dept) => {
      let score = 35;
      const reasons: string[] = [];

      if (preferredDepartmentId === dept.id) {
        score += 40;
        reasons.push('Direct match for your preferred department selection.');
      }

      const keywords = keywordMap[dept.code] || [];
      const matched = keywords.filter((kw) => combinedText.includes(kw));

      if (matched.length > 0) {
        score += Math.min(matched.length * 20, 45);
        reasons.push(`Directly matches reported clinical terms: "${matched.join(', ')}".`);
      }

      const deptDocs = doctors.filter((d) => d.departmentId === dept.id);
      const matchScore = Math.min(Math.round(score), 96);

      return {
        departmentId: dept.id,
        departmentName: dept.name,
        departmentCode: dept.code,
        description: dept.description,
        services: dept.services,
        matchScore,
        matchReason: reasons.length > 0 ? reasons.join(' ') : 'Suitable department for evaluation based on clinical services offered.',
        urgentCareNotice: urgentNotice,
        availableDoctors: deptDocs.map((d) => ({
          id: d.id,
          fullName: d.fullName,
          specialty: d.specialty,
          availableDays: d.availableDays,
        })),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
};
