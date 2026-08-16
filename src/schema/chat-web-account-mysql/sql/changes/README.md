# SQL changes

Every schema change requires an immutable incremental SQL file in this folder.

Use this filename format:

```text
YYYYMMDDHHmmss__table_name__action.sql
```

Examples:

```text
20260816103000__tb_account_user__add_locked_until.sql
20260817120000__tb_account_user__alter_phone_length.sql
```

Rules:

1. Never modify or delete a change file after it has been applied to any shared environment.
2. Update the canonical `../tb_account_user.sql` create script in the same commit.
3. A change file contains only forward SQL. Rollback SQL, when safe, is documented as comments.
4. MySQL DDL may auto-commit; the deployment system must record which files have executed.
5. Test the change against both an existing database and a fresh database built from the canonical create scripts.
