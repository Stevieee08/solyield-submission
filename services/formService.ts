import { database } from '../db';
import FormSubmission from '../db/models/FormSubmission';

export const saveFormOffline = async (visitId: string, formId: string, formAnswers: Record<string, any>) => {
  try {
    // FIX: Return the record directly from the write block to satisfy TypeScript
    const savedRecord = await database.write(async () => {
      return await database.get<FormSubmission>('form_submissions').create((submission) => {
        submission.visitId = visitId;
        submission.formId = formId;
        submission.answers = formAnswers; 
        submission.isSynced = false; 
      });
    });

    console.log("✅ Offline form saved successfully with ID:", savedRecord?.id);
    return savedRecord;
  } catch (error) {
    console.error("❌ Failed to save form offline", error);
    throw error;
  }
};

export const getAllOfflineForms = async () => {
  try {
    const forms = await database.get<FormSubmission>('form_submissions').query().fetch();
    console.log(`Found ${forms.length} saved forms in the offline database.`);
    return forms;
  } catch (error) {
    console.error("Failed to fetch forms from WatermelonDB", error);
    return [];
  }
};