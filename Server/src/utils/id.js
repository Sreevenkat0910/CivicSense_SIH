import Counter from '../models/Counter.js';

export async function nextSequence(key) {
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
}

export async function generateUserId() {
  const seq = await nextSequence('user');
  return `USR-${seq.toString().padStart(6, '0')}`;
}

export async function generateReportId(departmentCode) {
  const seq = await nextSequence(`report-${departmentCode}`);
  return `${departmentCode}-${seq.toString().padStart(5, '0')}`;
}


