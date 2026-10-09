import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface relative overflow-hidden pb-20">
      {/* Background Soft Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-sage-400/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[30rem] h-[30rem] bg-clay-400/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-50 border border-sage-200 mb-8">
          <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-sage-700 uppercase tracking-widest">
            Intelligent Care Routing
          </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tight leading-[1.1] text-mineral-900 mb-8 max-w-5xl mx-auto">
          Medical Intake, <br/>
          <span className="gradient-text-sage">Reimagined.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-mineral-600 font-light max-w-3xl mx-auto leading-relaxed mb-12">
          Experience a calmer approach to hospital management. Our predictive AI engine analyzes your symptoms, quietly routing you to the right specialist while providing real-time queue tracking.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link to="/recommendation" className="px-8 py-4 rounded-xl bg-mineral-900 text-white font-semibold tracking-wide transition-all hover:bg-mineral-800 hover:-translate-y-0.5 shadow-sm">
            Begin AI Triage
          </Link>
          <Link to="/requirement-form" className="px-8 py-4 rounded-xl bg-white text-mineral-700 border border-mineral-200 font-semibold tracking-wide transition-all hover:bg-surface hover:-translate-y-0.5 shadow-sm">
            Standard Booking
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '🌿', title: 'Smart Routing', desc: 'Clinical rule engine analyzes symptoms and softly suggests the optimal department.' },
            { icon: '⏱️', title: 'Calm Queuing', desc: 'Check in from your phone and monitor your wait time without anxiety.' },
            { icon: '📋', title: 'Secure Pre-Screening', desc: 'Physicians review your clinical background before you step into the room.' }
          ].map((feat, i) => (
            <div key={i} className="group bg-white border border-mineral-100 rounded-3xl p-8 hover:border-sage-300 transition-all duration-300 hover:shadow-glass-hover shadow-glass">
              <div className="w-14 h-14 rounded-2xl bg-sage-50 text-sage-600 flex items-center justify-center text-2xl mb-6 border border-sage-100">
                {feat.icon}
              </div>
              <h3 className="text-xl font-heading font-bold text-mineral-900 mb-3">{feat.title}</h3>
              <p className="text-mineral-500 leading-relaxed font-light">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 mt-20">
        <div className="bg-sage-50 border border-sage-100 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-sm">
          <h2 className="text-3xl md:text-4xl font-heading font-black text-mineral-900 mb-4 tracking-tight relative z-10">Join the Medical Revolution</h2>
          <p className="text-mineral-600 font-light max-w-2xl mx-auto mb-10 relative z-10">
            Create your patient portal account today. Experience reduced wait times, instant doctor matching, and complete control over your health records.
          </p>
          <Link to="/register" className="relative z-10 inline-block px-10 py-4 rounded-xl bg-sage-700 text-white font-semibold tracking-wide hover:bg-sage-600 transition-colors shadow-sm">
            Create Patient Account
          </Link>
        </div>
      </section>
    </div>
  );
};
