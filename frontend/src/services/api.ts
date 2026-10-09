import axios, { AxiosAdapter, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';
import {
  supabase,
  isSupabaseConfigured,
  supabaseAuth,
  supabaseDepartments,
  supabaseDoctors,
  supabaseRequirements,
  supabaseAppointments,
  supabaseQueue,
  supabaseConsultations,
  supabaseStock,
  supabasePatientProfile,
  supabaseAdmin,
} from './supabase';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export const getStoredData = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem('hms_app_state_v1_' + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

export const setStoredData = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem('hms_app_state_v1_' + key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
};

// Custom Supabase Client Adapter that routes API calls directly into Supabase backend
const supabaseAxiosAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
  const url = (config.url || '').replace(/^\/api/, '');
  const method = (config.method || 'get').toLowerCase();
  const data = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : config.data || {};
  const params = config.params || {};

  let responseData: any = null;

  try {
    // 1. Auth routes
    if (url === '/auth/login' && method === 'post') {
      const authRes = await supabaseAuth.signIn(data.email, data.password);
      responseData = { success: true, data: authRes };
    } else if (url === '/auth/register' && method === 'post') {
      const authRes = await supabaseAuth.signUp(data.email, data.password, data.fullName, data.role, data.phone);
      responseData = { success: true, data: authRes };
    }

    // 2. Departments routes
    else if (url === '/departments' && method === 'get') {
      const depts = await supabaseDepartments.getAll();
      responseData = { success: true, data: depts };
    }

    // 3. Doctors routes
    else if (url === '/doctors' && method === 'get') {
      const docs = await supabaseDoctors.getAll();
      responseData = { success: true, data: docs };
    } else if (url.startsWith('/doctors/') && url.includes('/availability') && method === 'get') {
      const parts = url.split('/');
      const docId = parts[2];
      const urlObj = new URL('http://dummy.com' + url);
      const dateStr = urlObj.searchParams.get('date') || new Date().toISOString().split('T')[0];
      const availability = await supabaseDoctors.getAvailability(docId, dateStr);
      responseData = { success: true, data: availability };
    }

    // 4. Recommendations & Patient Requirements
    else if (url === '/recommendations' && method === 'post') {
      const depts = await supabaseDepartments.getAll();
      const docs = await supabaseDoctors.getAll();
      const recs = supabaseRequirements.calculateRecommendations(data.symptoms || '', data.visitReason || '', depts, docs);
      responseData = { success: true, data: recs };
    } else if (url === '/patient-requirements' && method === 'post') {
      const result = await supabaseRequirements.submit(data);
      responseData = { success: true, data: result.requirement };
    }

    // 5. Appointments routes
    else if (url === '/appointments' && method === 'post') {
      const appt = await supabaseAppointments.create(data);
      responseData = { success: true, data: appt };
    } else if (url.startsWith('/appointments/') && url.endsWith('/check-in') && method === 'post') {
      const apptId = url.split('/')[2];
      const queue = await supabaseAppointments.checkIn(apptId);
      responseData = { success: true, data: queue };
    } else if (url.startsWith('/appointments/') && url.endsWith('/cancel') && method === 'post') {
      const apptId = url.split('/')[2];
      await supabaseAppointments.cancel(apptId);
      responseData = { success: true, data: { cancelled: true } };
    }

    // 6. Consultations & Visits routes
    else if (url === '/consultations/doctor/appointments' && method === 'get') {
      const currentUser = getStoredData<any>('current_user', null);
      const docId = currentUser?.doctorProfileId || (currentUser?.role === 'DOCTOR' ? currentUser.id : undefined);
      const appts = await supabaseAppointments.getDoctorAppointments(docId);
      responseData = { success: true, data: appts };
    } else if (url === '/consultations' && method === 'post') {
      const consultation = await supabaseConsultations.save(data);
      responseData = { success: true, data: consultation };
    }

    // 7. Patient personal data & visits
    else if (url === '/patients/me/appointments' && method === 'get') {
      const currentUser = getStoredData<any>('current_user', null);
      const appts = await supabaseAppointments.getPatientAppointments(currentUser?.id);
      responseData = { success: true, data: appts };
    } else if (url === '/patients/me/visits' && method === 'get') {
      const currentUser = getStoredData<any>('current_user', null);
      const visits = await supabaseConsultations.getPatientVisits(currentUser?.id);
      responseData = { success: true, data: visits };
    } else if (url === '/patients/me' && method === 'get') {
      const currentUser = getStoredData<any>('current_user', null);
      const profile = await supabasePatientProfile.getProfile(currentUser?.id);
      responseData = { success: true, data: profile };
    } else if (url === '/patients/me' && method === 'patch') {
      const currentUser = getStoredData<any>('current_user', null);
      const updated = await supabasePatientProfile.updateProfile(currentUser?.id || 'usr-patient-1', data);
      responseData = { success: true, data: updated };
    }

    // 8. Queues routes
    else if (url.startsWith('/queues/appointment/') && method === 'get') {
      const apptId = url.split('/')[3];
      const queue = await supabaseQueue.getByAppointment(apptId);
      responseData = { success: true, data: queue };
    } else if (url === '/queues/call-next' && method === 'post') {
      const nextAppt = await supabaseQueue.callNext(data.doctorId);
      responseData = { success: true, data: nextAppt };
    }

    // 9. Pharmacy & Medicine Stock Inventory
    else if (url === '/pharmacy/stock' && method === 'get') {
      const stock = await supabaseStock.getAll();
      responseData = { success: true, data: stock };
    } else if (url === '/pharmacy/stock' && method === 'post') {
      const createdItem = await supabaseStock.addItem(data);
      responseData = { success: true, data: createdItem };
    } else if (url.startsWith('/pharmacy/stock/') && (method === 'put' || method === 'patch')) {
      const itemId = url.split('/')[3];
      await supabaseStock.updateQuantity(itemId, Number(data.quantity));
      responseData = { success: true, data: { updated: true } };
    }

    // 10. Admin routes
    else if (url === '/admin/dashboard' && method === 'get') {
      const stats = await supabaseAdmin.getDashboardStats();
      responseData = { success: true, data: stats };
    } else if (url === '/admin/doctors' && method === 'post') {
      const createdDoc = await supabaseDoctors.create(data);
      responseData = { success: true, data: createdDoc };
    }

    // Default 404 handler
    if (!responseData) {
      responseData = { success: true, data: null, message: `Endpoint ${url} handled by Supabase adapter.` };
    }

    return {
      data: responseData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  } catch (error: any) {
    console.error('Supabase adapter error on', url, error);
    const statusCode = error.status || 400;
    return {
      data: { success: false, message: error.message || 'Supabase operation failed' },
      status: statusCode,
      statusText: error.statusText || 'Error',
      headers: {},
      config,
    };
  }
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  adapter: supabaseAxiosAdapter,
});

// Interceptor to add Supabase Auth Header
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle API calls with transparent fallback
export async function fetchWithFallback<T>(
  apiCall: () => Promise<{ data: ApiResponse<T> }>,
  mockFallback: () => T | Promise<T>
): Promise<T> {
  try {
    const response = await apiCall();
    if (response.data && response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
  } catch (error: any) {
    console.warn('Supabase bridge note:', error.message);
  }
  return await mockFallback();
}

export { supabase, isSupabaseConfigured };
