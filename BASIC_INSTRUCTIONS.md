# Codex Project Change Rules

## 1. Scope Discipline

Make only the changes necessary to complete the requested task.

You may modify any existing project file when the implementation genuinely requires it, including:

- `.js`
- `.jsx`
- `.json`
- `.env`
- `.env.example`
- configuration files
- API/service files
- database/migration files
- dependency manifests

Do not modify unrelated files.

Do not make:
- speculative refactors
- unrelated cleanup
- formatting-only changes
- unnecessary dependency upgrades
- architecture changes
- changes to unrelated features

Preserve existing behavior everywhere outside the requested change.

## 2. Before Editing

Before making changes, inspect the relevant existing files and determine all dependencies and configuration required for the requested implementation.

If a supporting file must be modified for the feature to actually work, modify it.

Do not leave an implementation incomplete merely because the required change is in a file that was not explicitly mentioned in the task.

Keep the total change set as small as reasonably possible.

## 3. Environment and Secrets Safety

You may modify environment/configuration files when technically required.

Do not:
- invent credentials
- overwrite existing secrets
- expose secrets in source code
- replace working database credentials
- commit secret values
- remove existing environment variables without a technical reason

Prefer updating `.env.example` when documenting required environment variables.

If an existing `.env` value must be changed for the requested feature, preserve unrelated values and change only what is necessary.

## 4. Git Safety

Do not run `git push`, `git pull`, `git commit`, or other Git operations that modify the repository history or remote repository unless explicitly instructed.

Git operations are handled manually by the developer.

## 5. Change Summary

After completing the task, report:

- files changed
- what changed in each file
- validation performed
- any remaining issues
- any changes that were necessary outside the originally mentioned files