# My Kkachi deployment

Deploy this project only under the personal Vercel account `sungbin3833@gmail.com`, team `sungbin38s-projects` (`team_XXnPACMfqA38ryu7ErUFlJxe`).

Use the project-specific credentials; never change the default Vercel login or global Git identity for this project.

```sh
npx vercel@latest --prod --yes --scope sungbin38s-projects --global-config "$HOME/.codex/auth/mykkachi-vercel-personal"
```

Production URL: https://mykkachi.com (Vercel fallback: https://mykkachi.vercel.app)

## Database

Use the existing Neon Free resource `mykkachi-db` in this project's personal Vercel team. Secrets live in ignored `.env` / `.env.local` and Vercel environment variables. Never print or commit connection passwords. Do not enable a paid plan without user authorization. Run `npm run db:migrate` for idempotent schema/seed setup. Public birth inputs remain browser-only.

## 돈쌤 Threads

For Threads writing and posting requests, use `스레드/에이전트/skill/SKILL.md` and the `mykkachi_threads` agent. A plain “스레드 글 만들어줘” means automatically choose a fresh topic, write in the user's existing style, and append the configured conversion reply; do not ask for a format first. The current account is `don.ssaem`. Publish through the API only when the user requests publishing. Event dates and links live in `스레드/에이전트/운영설정.json`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
