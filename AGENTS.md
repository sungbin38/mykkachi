# My Kkachi deployment

Deploy this project only under the personal Vercel account `sungbin3833@gmail.com`, team `sungbin38s-projects` (`team_XXnPACMfqA38ryu7ErUFlJxe`).

Use the project-specific credentials; never change the default Vercel login or global Git identity for this project.

```sh
npx vercel@latest --prod --yes --scope sungbin38s-projects --global-config "$HOME/.codex/auth/mykkachi-vercel-personal"
```

Production URL: https://mykkachi.com (Vercel fallback: https://mykkachi.vercel.app)

## Database

Use the existing Neon Free resource `mykkachi-db` in this project's personal Vercel team. Secrets live in ignored `.env` / `.env.local` and Vercel environment variables. Never print or commit connection passwords. Do not enable a paid plan without user authorization. Run `npm run db:migrate` for idempotent schema/seed setup. Public birth inputs remain browser-only.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
