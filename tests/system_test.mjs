import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mszmuyhhxymxvjzzsjlk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_i8JTh279zG9spIDsu9Cvig_yNRChJ5F';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runSystemTest() {
  console.log('--- STARTING COMPREHENSIVE PRODUCTION SYSTEM TEST ---');

  // 1. Departments Test
  console.log('\n1. Testing Departments...');
  const { data: depts, error: deptsErr } = await supabase.from('departments').select('*');
  if (deptsErr) throw new Error('Departments failed: ' + deptsErr.message);
  console.log(`✅ Loaded ${depts.length} departments:`, depts.map(d => d.name).join(', '));

  // 2. Doctors Test
  console.log('\n2. Testing Doctors & Specialty...');
  const { data: docs, error: docsErr } = await supabase.from('doctors').select('*');
  if (docsErr) throw new Error('Doctors failed: ' + docsErr.message);
  console.log(`✅ Loaded ${docs.length} doctors:`, docs.map(d => d.full_name).join(', '));

  // 3. Medicine Stock Inventory Test
  console.log('\n3. Testing Pharmacy Stock Inventory...');
  const { data: stock, error: stockErr } = await supabase.from('medicine_stock').select('*');
  if (stockErr) throw new Error('Stock query failed: ' + stockErr.message);
  console.log(`✅ Loaded ${stock.length} medicine stock items:`, stock.slice(0, 4).map(s => `${s.name} (${s.quantity} ${s.unit})`).join(', '));

  // 4. Patient Requirements Intake & AI Recommendation Match Test
  console.log('\n4. Testing Patient Requirements Intake...');
  const testRef = 'REQ-TEST-' + Math.floor(100000 + Math.random() * 900000);
  const { data: newReq, error: reqErr } = await supabase.from('patient_requirements').insert([
    {
      reference_number: testRef,
      patient_id: 'usr-patient-test',
      full_name: 'Production Health Tester',
      email: 'production.tester@hospital.org',
      phone: '+1 (555) 912-3456',
      visit_reason: 'Persistent chest discomfort and high blood pressure follow-up',
      symptoms: 'Chest tightness, elevated systolic BP, shortness of breath on exertion',
      status: 'SUBMITTED'
    }
  ]).select().single();

  if (reqErr) throw new Error('Patient requirements insert failed: ' + reqErr.message);
  console.log(`✅ Patient requirement successfully registered with Ref: ${newReq.reference_number}`);

  // 5. Recommendations Association Test
  console.log('\n5. Testing Recommendations Insertion...');
  const cardDept = depts.find(d => d.code === 'CARD') || depts[0];
  const { data: newRec, error: recErr } = await supabase.from('recommendations').insert([
    {
      requirement_id: newReq.id,
      department_id: cardDept.id,
      match_score: 96.5,
      match_reason: 'Severe cardiovascular indicators match Cardiology protocols directly.'
    }
  ]).select().single();

  if (recErr) throw new Error('Recommendation insert failed: ' + recErr.message);
  console.log(`✅ Recommendation created and matched to ${cardDept.name} (Score: ${newRec.match_score}%)`);

  // 6. Appointment Booking Test
  console.log('\n6. Testing Appointment Booking...');
  const apptRef = 'APP-TEST-' + Math.floor(100000 + Math.random() * 900000);
  const targetDoc = docs[0];
  const { data: newAppt, error: apptErr } = await supabase.from('appointments').insert([
    {
      reference_number: apptRef,
      patient_id: 'usr-patient-test',
      doctor_id: targetDoc.id,
      department_id: targetDoc.department_id || cardDept.id,
      appointment_date: new Date().toISOString().split('T')[0],
      time_slot: '11:00 AM',
      status: 'BOOKED',
      notes: 'Automated end-to-end production pipeline verification'
    }
  ]).select().single();

  if (apptErr) throw new Error('Appointment insert failed: ' + apptErr.message);
  console.log(`✅ Appointment booked with Ref: ${newAppt.reference_number} for Dr. ${targetDoc.full_name}`);

  // 7. Queue Entry & Patient Check-In Test
  console.log('\n7. Testing Queue Entry Check-In...');
  const { data: queueEntry, error: queueErr } = await supabase.from('queue_entries').insert([
    {
      appointment_id: newAppt.id,
      doctor_id: targetDoc.id,
      department_id: targetDoc.department_id || cardDept.id,
      queue_number: 108,
      position: 1,
      status: 'WAITING',
      estimated_wait_mins: 15
    }
  ]).select().single();

  if (queueErr) throw new Error('Queue entry check-in failed: ' + queueErr.message);
  console.log(`✅ Live Queue Entry created! Ticket #${queueEntry.queue_number}, Status: ${queueEntry.status}`);

  // 8. Doctor Consultation Recording Test
  console.log('\n8. Testing Doctor Consultation & Prescriptions...');
  const { data: consultation, error: consErr } = await supabase.from('consultations').insert([
    {
      appointment_id: newAppt.id,
      patient_id: 'usr-patient-test',
      doctor_id: targetDoc.id,
      chief_complaint: 'Exertion chest tightness',
      diagnosis: 'Stage 1 Hypertension controlled',
      doctor_notes: 'Patient advised routine monitoring and low sodium diet.',
    }
  ]).select().single();

  if (consErr) throw new Error('Consultation insert failed: ' + consErr.message);
  console.log(`✅ Consultation recorded ID: ${consultation.id}`);

  // 9. Prescription Entry
  const { error: rxErr } = await supabase.from('prescriptions').insert([
    {
      consultation_id: consultation.id,
      medication_name: 'Lisinopril 10mg',
      dosage: '10mg',
      frequency: 'Once Daily',
      duration: '30 Days',
      instructions: 'Take in morning with water'
    }
  ]);
  if (rxErr) throw new Error('Prescription insert failed: ' + rxErr.message);
  console.log(`✅ Prescription written and attached to consultation!`);

  // 10. Pharmacy Stock Update Test
  console.log('\n10. Testing Pharmacy Stock Update...');
  const firstItem = stock[0];
  const newQty = firstItem.quantity + 5;
  const { error: updateStockErr } = await supabase
    .from('medicine_stock')
    .update({ quantity: newQty, last_updated: new Date().toISOString() })
    .eq('id', firstItem.id);

  if (updateStockErr) throw new Error('Stock update failed: ' + updateStockErr.message);
  console.log(`✅ Medicine Stock (${firstItem.name}) updated: ${firstItem.quantity} -> ${newQty}`);

  console.log('\n======================================================');
  console.log('🎉 ALL 10/10 PRODUCTION END-TO-END SUPABASE FLOWS PASSED!');
  console.log('======================================================\n');
}

runSystemTest().catch(err => {
  console.error('❌ SYSTEM TEST FAILED:', err);
  process.exit(1);
});
