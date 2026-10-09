import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-mineral-100 mt-auto relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-sage-50 border border-sage-200 flex items-center justify-center font-black text-xl text-sage-700 shadow-sm transition-transform duration-500 group-hover:scale-105">
                🌿
              </div>
              <div>
                <span className="font-heading font-bold text-xl text-mineral-900 block leading-none mb-1">
                  St. Jude
                </span>
                <span className="text-[10px] font-semibold text-sage-600 uppercase tracking-widest block">
                  Modern Health
                </span>
              </div>
            </div>
            <p className="text-xs text-mineral-500 font-light leading-relaxed">
              State-of-the-art medical recommendation system and online patient intake portal. Streamlining appointment bookings and reducing hospital wait times through AI.
            </p>
          </div>

          <div>
            <h4 className="text-mineral-900 font-bold text-sm tracking-widest mb-4 uppercase">Navigation</h4>
            <ul className="space-y-3 text-xs font-semibold text-mineral-600">
              <li><Link to="/recommendation" className="hover:text-sage-700 transition-colors">AI Match</Link></li>
              <li><Link to="/requirement-form" className="hover:text-sage-700 transition-colors">Booking & Intake</Link></li>
              <li><Link to="/doctors" className="hover:text-sage-700 transition-colors">Doctor Directory</Link></li>
              <li><Link to="/departments" className="hover:text-sage-700 transition-colors">Hospital Specialties</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-mineral-900 font-bold text-sm tracking-widest mb-4 uppercase">Hours</h4>
            <ul className="space-y-2.5 text-xs text-mineral-600 font-medium">
              <li>Emergency Room: <strong className="text-red-600 font-bold tracking-wide inline-block">24 / 7 OPEN</strong></li>
              <li>Outpatient: Mon-Fri (8am - 6pm)</li>
              <li>Saturday Clinic: (9am - 2pm)</li>
              <li>Sunday/Holiday: On-Call Only</li>
            </ul>
          </div>

          <div>
            <h4 className="text-mineral-900 font-bold text-sm tracking-widest mb-4 uppercase">Contact</h4>
            <p className="text-xs text-mineral-600 font-medium leading-relaxed mb-4">
              <span className="text-mineral-400 mr-2">📍</span> 500 Medical Center Parkway<br />
              <span className="text-mineral-400 mr-2">📞</span> (555) 911-HEART<br />
              <span className="text-mineral-400 mr-2">✉️</span> support@stjude.org
            </p>
            <span className="inline-block text-[10px] uppercase font-bold tracking-widest bg-mineral-50 text-mineral-500 px-3 py-1.5 rounded-lg border border-mineral-100">
              Secure Platform v2.0
            </span>
          </div>
        </div>

        <div className="border-t border-mineral-100 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] uppercase font-bold tracking-widest text-mineral-400">
          <p>© {new Date().getFullYear()} ST. JUDE HEALTHCARE. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <span className="hover:text-mineral-700 transition-colors cursor-pointer">PRIVACY</span>
            <span className="hover:text-mineral-700 transition-colors cursor-pointer">TERMS</span>
            <span className="hover:text-mineral-700 transition-colors cursor-pointer">GOVERNANCE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
