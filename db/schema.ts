import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const mySchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'form_submissions',
      columns: [
        { name: 'visit_id', type: 'string', isIndexed: true },
        { name: 'form_id', type: 'string' },
        { name: 'answers', type: 'string' }, // SQLite natively stores this as a string
        { name: 'is_synced', type: 'boolean' }, // Crucial for Phase 3 background sync
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});