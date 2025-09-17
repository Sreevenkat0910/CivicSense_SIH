import { supabase } from '../lib/supabase.js';

export async function nextSequence(key) {
  const { data, error } = await supabase.rpc('next_seq', { counter_key: key });
  if (error) throw new Error(`next_seq failed: ${error.message}`);
  return data;
}

export async function generateUserId() {
  const seq = await nextSequence('user');
  return `USR-${seq.toString().padStart(6, '0')}`;
}

export async function generateUserTypeId() {
  const seq = await nextSequence('usertype');
  return `UT-${seq.toString().padStart(4, '0')}`;
}

export async function generateReportId(departmentCode) {
  const seq = await nextSequence(`report-${departmentCode}`);
  return `${departmentCode}-${seq.toString().padStart(5, '0')}`;
}


