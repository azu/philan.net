# Migration

## How to write migration

1. Create `YYYY-MM-DD` dir
2. Add migration script to `YYYY-MM-DD/script.ts`
3. Rewrite `migrate` in `index.ts`
4. Run `migration:prepare:*` → `migration:start:*`
