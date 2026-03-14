import { Database } from '@nozbe/watermelondb';
// 1. Swap LokiJS for SQLiteAdapter
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { mySchema } from './schema';
import FormSubmission from './models/FormSubmission';

// 2. Initialize the SQLite adapter
const adapter = new SQLiteAdapter({
  schema: mySchema,
  // (Optional) jsi: true, // You can enable this later for extreme performance, but keep it off for now to ensure stability
  onSetUpError: error => {
    console.error("Database failed to load", error);
  }
});

export const database = new Database({
  adapter,
  modelClasses: [
    FormSubmission,
  ],
});