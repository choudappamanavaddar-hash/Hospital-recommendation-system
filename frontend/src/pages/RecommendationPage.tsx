import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DepartmentCard } from '../components/DepartmentCard';
import { Recommendation, Department, Doctor } from '../types';
import { apiClient, fetchWithFallback, getStoredData } from '../services/api';
import { computeRecommendationsClient } from '../utils/recommendationEngine';

export const RecommendationPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [urgentNotice, setUrgentNotice] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    const latestReq = getStoredData<any>('latest_requirement', {
      visitReason: 'Chest pain during exercise and hypertension',
      symptoms: 'Mild chest tightness, shortness of breath, high blood pressure',
    });

    try {
      const res = await apiClient.post('/recommendations', {
        requirementId: latestReq?.id,
        visitReason: latestReq?.visitReason,
        symptoms: latestReq?.symptoms,
      });

      if (res.data?.success) {
        setRecommendations(res.data.data);
        if (res.data.data.length > 0 && res.data.data[0].urgentCareNotice) {
          setUrgentNotice(res.data.data[0].urgentCareNotice);
        }
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Backend endpoint unavailable. Computing clinical recommendation on client.');
    }

    // Client computation fallback
    const depts = await fetchWithFallback<Department[]>(
      () => apiClient.get('/departments'),
      () => [
        { id: 'dept-1', name: 'Cardiology', code: 'CARD', description: 'Comprehensive cardiovascular care including heart disease diagnosis, hypertension, ECG, echocardiography, and preventative heart care.', services: 'ECG, Echocardiogram, Stress Test, Blood Pressure Monitoring' },
        { id: 'dept-2', name: 'Neurology', code: 'NEUR', description: 'Diagnosis and non-surgical treatment of disorders of the brain, spinal cord, nerves, and muscles.', services: 'EEG, Brain MRI, Migraine Therapy, Epilepsy Management' },
        { id: 'dept-3', name: 'Orthopedics', code: 'ORTH', description: 'Expert care for bones, joints, ligaments, tendons, muscles, spinal issues, and sports injuries.', services: 'Joint Pain Assessment, Fracture Management, X-Ray' },
        { id: 'dept-5', name: 'General Internal Medicine', code: 'GENM', description: 'Primary medical care for adult illnesses, chronic disease prevention, fever, fatigue, and general health evaluations.', services: 'Physical Exam, Blood Work, Diabetes Management' },
      ]
    );

    const docs = await fetchWithFallback<Doctor[]>(
      () => apiClient.get('/doctors'),
      () => [
        { id: 'doc-1', userId: 'usr-1', fullName: 'Dr. Sarah Smith, MD', specialty: 'Cardiovascular Specialist', departmentId: 'dept-1', availableDays: 'Monday-Friday', slotDurationMins: 30 },
        { id: 'doc-2', userId: 'usr-2', fullName: 'Dr. Michael Chen, MD', specialty: 'Clinical Neurology', departmentId: 'dept-2', availableDays: 'Mon,Wed,Fri', slotDurationMins: 30 },
      ]
    );

    const computed = computeRecommendationsClient(
      latestReq.visitReason || '',
      latestReq.symptoms || '',
      depts,
      docs,
      latestReq.preferredDepartmentId
    );

    setRecommendations(computed);
    if (computed.length > 0 && computed[0].urgentCareNotice) {
      setUrgentNotice(computed[0].urgentCareNotice);
    }
    setLoading(false);
  };

  const handleSelectDepartment = (dept: Department) => {
    navigate(`/booking?departmentId=${dept.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin mb-6"></div>
        <h3 className="font-heading text-2xl font-bold text-mineral-900 animate-pulse">
          Analyzing Clinical Profile...
        </h3>
        <p className="text-mineral-500 mt-2 font-light">Our triage engine is preparing your recommendations.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface px-4 py-16 relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-clay-50 border border-clay-200 mb-2">
            <span className="text-xs font-semibold text-clay-700 uppercase tracking-widest">
              Clinical Navigation
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-mineral-900 tracking-tight leading-tight">
            Recommended Departments
          </h1>
          <p className="text-mineral-600 text-lg font-light leading-relaxed">
            Based on your symptoms, our triage system has identified the most highly qualified specialists for your care.
          </p>
        </div>

        {/* Urgent Care Notice */}
        {urgentNotice && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600">
              <span className="text-xl">⚠️</span>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-bold text-lg mb-1 text-red-800">Urgent Care Safety Alert</h4>
              <p className="text-red-700/80 leading-relaxed text-sm font-medium">{urgentNotice}</p>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-white border border-mineral-100 p-4 rounded-xl flex items-center justify-center gap-3 shadow-sm">
          <span className="text-lg">ℹ️</span>
          <span className="text-sm text-mineral-600">
            <strong className="text-mineral-800 font-semibold">Guidance Only:</strong> These recommendations are for administrative routing and do not constitute a formal diagnosis.
          </span>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {recommendations.map((rec) => (
            <DepartmentCard
              key={rec.departmentId}
              department={{
                id: rec.departmentId,
                name: rec.departmentName,
                code: rec.departmentCode,
                description: rec.description,
                services: rec.services,
              }}
              matchScore={rec.matchScore}
              matchReason={rec.matchReason}
              onSelect={handleSelectDepartment}
            />
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 bg-white border border-mineral-100 p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-6 shadow-glass">
          <div className="text-center sm:text-left">
            <h4 className="font-heading font-bold text-mineral-900 text-xl tracking-tight">Prefer to browse?</h4>
            <p className="text-sm text-mineral-500 mt-1 font-light">You have the freedom to explore our entire medical directory.</p>
          </div>
          <button
            onClick={() => navigate('/doctors')}
            className="px-8 py-3 rounded-xl bg-surface border border-mineral-200 text-mineral-800 font-semibold transition-all hover:bg-mineral-50 hover:shadow-sm"
          >
            Explore Directory
          </button>
        </div>
      </div>
    </div>
  );
};
