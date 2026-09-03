# Encrypted production snapshot

This directory contains encrypted Supabase snapshots created by
`scripts/export-supabase-backup.mjs`. Each snapshot includes the application
tables and every object in the project's Storage buckets.

The encryption passphrase is intentionally kept outside Git. On the source
computer, it is stored in `.database-backup-key` at the project root. Keep that
file in a password manager or another secure location; the encrypted backup
cannot be restored without it.

To restore a snapshot into a fresh Supabase project:

1. Apply every SQL file in `supabase/migrations/` in filename order.
2. Configure `RESTORE_SUPABASE_URL`, `RESTORE_SUPABASE_SECRET_KEY`, and
   `BACKUP_PASSPHRASE` in your shell.
3. Run:

   ```bash
   node scripts/restore-supabase-backup.mjs backups/<snapshot>.manifest.json --apply
   ```

The restore command refuses to change a database unless `--apply` is present.
It replaces the application-table rows and the backed-up Storage objects in the
target project.

You can verify the backup and passphrase without changing a database:

```bash
BACKUP_PASSPHRASE="..." node scripts/restore-supabase-backup.mjs backups/<snapshot>.manifest.json --verify-only
```

Large encrypted snapshots are split into numbered parts so every file remains
within GitHub's normal file-size limit. The manifest verifies each part before
decryption and restoration.
