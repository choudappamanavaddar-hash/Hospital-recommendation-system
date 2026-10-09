import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { isSupabaseConfigured } from '../services/supabase';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const isConnected = isSupabaseConfigured();

  return (
    <>
      <nav className="bg-surface/80 glass-panel sticky top-0 z-50 transition-all border-b border-mineral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center relative">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-sage-50 border border-sage-400/30 flex items-center justify-center font-black text-xl text-sage-700 shadow-sm transition-transform duration-500 group-hover:scale-105">
                🌿
              </div>
              <div>
                <span className="font-heading font-bold text-xl text-mineral-900 block leading-none mb-1">
                  St. Jude
                </span>
                <span className="text-[10px] font-semibold text-sage-500 uppercase tracking-widest block">
                  Modern Health
                </span>
              </div>
            </Link>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-8 text-xs font-semibold tracking-wide text-mineral-600">
              <Link to="/" className="hover:text-sage-700 transition-colors">Home</Link>
              <Link to="/recommendation" className="text-clay-700 hover:text-clay-500 font-bold transition-colors">
                AI Triage
              </Link>
              <Link to="/doctors" className="hover:text-sage-700 transition-colors">Doctors</Link>
              <Link to="/departments" className="hover:text-sage-700 transition-colors">Departments</Link>
              
              {user?.role === 'ADMIN' && (
                <Link to="/stock" className="hover:text-sage-700 transition-colors">Pharmacy</Link>
              )}

              {/* Supabase Status Pill */}
              <button
                onClick={() => setShowConfigModal(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                  isConnected
                    ? 'bg-sage-50 border-sage-400/30 text-sage-700 hover:bg-sage-100'
                    : 'bg-clay-50 border-clay-300 text-clay-700 hover:bg-clay-100'
                }`}
                title="Supabase Configuration"
              >
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-sage-500 animate-pulse' : 'bg-clay-400'}`}></span>
                <span>{isConnected ? 'Backend Connected' : 'Simulated'}</span>
              </button>

              {user ? (
                <div className="flex items-center gap-4 pl-6 border-l border-mineral-200">
                  {user.role === 'PATIENT' && (
                    <Link to="/patient-dashboard" className="px-4 py-2 rounded-lg bg-sage-50 text-sage-700 hover:bg-sage-100 border border-sage-200 transition-colors">
                      Patient Portal
                    </Link>
                  )}
                  {user.role === 'DOCTOR' && (
                    <Link to="/doctor-dashboard" className="px-4 py-2 rounded-lg bg-clay-50 text-clay-700 hover:bg-clay-100 border border-clay-200 transition-colors">
                      Physician Portal
                    </Link>
                  )}
                  {user.role === 'ADMIN' && (
                    <Link to="/admin-dashboard" className="px-4 py-2 rounded-lg bg-mineral-50 text-mineral-700 hover:bg-mineral-100 border border-mineral-200 transition-colors">
                      Management
                    </Link>
                  )}
                  <button onClick={onLogout} className="text-[11px] font-bold text-mineral-400 hover:text-clay-500 transition-colors">
                    LOGOUT
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4 pl-6 border-l border-mineral-200">
                  <Link to="/login" className="text-mineral-600 hover:text-mineral-900 transition-colors">
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2 rounded-lg bg-mineral-900 text-white hover:bg-mineral-700 transition-colors shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-mineral-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-mineral-100 bg-surface/95 backdrop-blur-xl px-5 pt-4 pb-8 space-y-4 text-sm font-medium text-mineral-700">
            <Link to="/" className="block py-2 hover:text-sage-600">Home</Link>
            <Link to="/recommendation" className="block py-2 text-clay-700 font-bold">AI Triage</Link>
            <Link to="/doctors" className="block py-2 hover:text-sage-600">Doctors</Link>
            <Link to="/departments" className="block py-2 hover:text-sage-600">Departments</Link>
            {user?.role === 'ADMIN' && (
              <Link to="/stock" className="block py-2 hover:text-sage-600">Pharmacy</Link>
            )}

            {user ? (
              <div className="pt-4 border-t border-mineral-100 space-y-3">
                <span className="block text-xs text-mineral-400">Signed in as: {user.email}</span>
                {user.role === 'PATIENT' && (
                  <Link to="/patient-dashboard" className="block py-2 text-sage-600">Patient Dashboard</Link>
                )}
                {user.role === 'DOCTOR' && (
                  <Link to="/doctor-dashboard" className="block py-2 text-clay-600">Doctor Dashboard</Link>
                )}
                {user.role === 'ADMIN' && (
                  <Link to="/admin-dashboard" className="block py-2 text-mineral-900">Admin Dashboard</Link>
                )}
                <button onClick={onLogout} className="block w-full text-left py-2 text-clay-500">Logout</button>
              </div>
            ) : (
              <div className="pt-4 border-t border-mineral-100 flex flex-col gap-3">
                <Link to="/login" className="w-full text-center py-2.5 border border-mineral-200 rounded-lg text-mineral-700">Log In</Link>
                <Link to="/register" className="w-full text-center py-2.5 bg-mineral-900 text-white rounded-lg">Register</Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Supabase Integration Info Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mineral-900/40 backdrop-blur-sm">
          <div className="bg-white border border-mineral-200 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setShowConfigModal(false)}
              className="absolute top-5 right-5 text-mineral-400 hover:text-mineral-900 text-lg font-bold"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-sage-50 border border-sage-200 flex items-center justify-center text-xl">
                ⚡
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-mineral-900">Backend Status</h3>
                <p className="text-xs text-mineral-500">Supabase Integration</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-mineral-700">
              <div className="p-4 rounded-xl bg-surface border border-mineral-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-mineral-500">Architecture</span>
                  <span className="text-xs font-bold text-sage-600">100% Supabase</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-mineral-500">Connection</span>
                  <span className={`text-xs font-bold ${isConnected ? 'text-sage-600' : 'text-clay-600'}`}>
                    {isConnected ? 'Connected & Live' : 'Simulator Mode'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-mineral-500">Project</span>
                  <span className="text-xs font-mono text-mineral-700 truncate max-w-[220px]">
                    mszmuyhhxymxvjzzsjlk
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-6 py-2.5 rounded-lg bg-mineral-900 hover:bg-mineral-800 text-white font-semibold text-sm transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
