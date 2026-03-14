import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, json } from '@nozbe/watermelondb/decorators';

// A simple sanitizer to ensure the DB doesn't crash if bad data is passed
const sanitizeAnswers = (rawAnswers: any) => {
  return rawAnswers && typeof rawAnswers === 'object' ? rawAnswers : {};
};

export default class FormSubmission extends Model {
  static table = 'form_submissions';

  @field('visit_id') visitId!: string;
  @field('form_id') formId!: string;
  
  // Handles your dynamic checkboxes, file paths, and nested objects
  @json('answers', sanitizeAnswers) answers!: any; 
  
  @field('is_synced') isSynced!: boolean;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}