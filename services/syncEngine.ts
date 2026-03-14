import NetInfo from '@react-native-community/netinfo';
import { database } from '../db';
import FormSubmission from '../db/models/FormSubmission';
import { Q } from '@nozbe/watermelondb';

// --- MOCK API CALL WITH FILE UPLOAD HANDLING ---
const uploadToServer = async (record: FormSubmission) => {
  console.log(`Preparing to push form ${record.formId} to server...`);
  
  // 1. Create a FormData object (Standard for uploading files)
  const payload = new FormData();
  payload.append('visitId', record.visitId);
  payload.append('formId', record.formId);

  // 2. Loop through the answers to separate text data from local file URIs
  const answers = record.answers;
  for (const [key, value] of Object.entries(answers)) {
    
    // Check if the value is an Array (like Checkboxes OR Multi-Images)
    if (Array.isArray(value)) {
      value.forEach((val, index) => {
        if (typeof val === 'string' && val.startsWith('file://')) {
          // It's a physical file! Attach it as a file object
          payload.append(`files_${key}`, {
            uri: val,
            name: `photo_${record.visitId}_${index}.jpg`,
            type: 'image/jpeg',
          } as any);
        } else {
          // It's just a regular checkbox string
          payload.append(`${key}[]`, val);
        }
      });
    } 
    // Check if it's a single file (just in case)
    else if (typeof value === 'string' && value.startsWith('file://')) {
      payload.append(key, {
        uri: value,
        name: `photo_${record.visitId}.jpg`,
        type: 'image/jpeg',
      } as any);
    } 
    // Otherwise, it's just normal text/number data
    else {
      payload.append(key, String(value));
    }
  }

  // --- MOCK NETWORK REQUEST ---
  console.log(`Uploading Multipart FormData for Visit ${record.visitId}...`);
  await new Promise(resolve => setTimeout(resolve, 2000)); 

  /* REAL WORLD IMPLEMENTATION:
  const response = await fetch('https://api.yourbackend.com/forms/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data', // Crucial for files!
    },
    body: payload,
  });
  if (!response.ok) throw new Error('Upload failed');
  */

  return { success: true, status: 'ok' };
};

// --- THE SYNC EXECUTOR ---
let isSyncing = false; // Prevents overlapping syncs if network bounces rapidly

export const triggerBackgroundSync = async () => {
  try {
    const formCollection = database.get<FormSubmission>('form_submissions');
    
    // --- DIAGNOSTIC LOGS ---
    const totalRecords = await formCollection.query().fetch();
    console.log(`🧐 Total records in database (synced + unsynced): ${totalRecords.length}`);
    // -----------------------
    
    // Find all records where is_synced is false
    const unsyncedRecords = await formCollection.query(Q.where('is_synced', false)).fetch();

    // --- NEW LOGGING ---
    if (unsyncedRecords.length === 0) {
      console.log("🤷‍♂️ Sync Engine woke up, but there are 0 offline forms waiting to upload!");
      return { status: 'synced', count: 0 };
    }
    // -------------------

    console.log(`Starting background sync for ${unsyncedRecords.length} records...`);
    // ... rest of your sync logic
    let successCount = 0;

    // FIX #1: Iterate over unsyncedRecords instead of unsyncedForms
    for (const form of unsyncedRecords) {
      try {
        const response = await uploadToServer(form);

        if (response.success || response.status === 'conflict') {
          // 3. Mark as synced locally
          await database.write(async () => {
            // FIX #2: Explicitly type 'f' as FormSubmission
            await form.update((f: FormSubmission) => {
              f.isSynced = true; 
            });
          });
          if (response.success) successCount++;
        }
      } catch (err) {
        console.error(`Network failed for form ${form.id}. Will retry later.`, err);
        // We leave is_synced as false so it tries again next time.
      }
    }

    isSyncing = false;
    return { status: 'synced', count: successCount };

  } catch (error) {
    console.error("Critical error in sync engine:", error);
    isSyncing = false;
    return { status: 'error' };
  }
}