# TWC Content Studio — Agent Rules

## Project
TWC Content Studio is a YouTube Automation Department control center. It manages channels, teams, scripts, scenes, clips, editing handoffs, QA, SEO, policy checks, approvals, and YouTube Shorts publishing.

## MVP scope
- Auth, teams, roles, and per-channel permissions
- Channels and platform accounts, starting with YouTube OAuth
- Script Board: idea -> AI script -> versions -> approval
- Scene breakdown: visual prompt, narration, on-screen text, duration
- Clip pipeline: stock footage, TTS, Whisper captions, music, optional FFmpeg render
- Google Drive storage and structured folders
- SEO generator and score
- Policy checklist engine with PASS / WARN / BLOCK
- Kanban pipeline, task assignment, daily/weekly quotas
- Manual approval, then scheduled publishing to YouTube Shorts

## Tech defaults
- Use the agreed stack only; do not introduce new frameworks or services without approval
- Build a modular, provider-based architecture for TTS, stock footage, AI clips, captions, storage, and publishers
- Google Drive is permanent storage; local/server storage is only a render or processing cache
- All long-running work must use queue workers, not synchronous HTTP requests
- Every failed job must be retryable at scene or task level, without redoing the entire video

## Coding standards
- Write clean, typed, maintainable code
- Use small components, services, and reusable modules
- Validate all user input on the server
- Handle loading, empty, error, retry, and permission-denied states
- Store secrets only in environment variables; never commit them
- Use least-privilege OAuth scopes
- Encrypt OAuth tokens at rest
- Maintain an audit log for publishing, approvals, token access, and sensitive actions

## Agent behavior
- Before writing code, produce a plan and wait for approval
- Implement one task at a time
- Do not modify database schemas, OAuth scopes, publishing logic, policy rules, or queue workers without asking
- After each task, list changed files, assumptions, risks, and required environment variables
- Run type checks, linting, and tests before declaring a task complete
- Prefer a pluggable interface over hardcoding a provider

## Human-in-the-loop rules
- Publishing requires explicit approval from the channel owner or a Manager
- AI disclosure must be applied automatically where the platform requires it
- Never publish content that uses unlicensed footage, music, or copied videos
- Never automate fake engagement, view buying, mass account creation, or spam
- Never claim guaranteed views, virality, profit, or medical results

## Definition of done
- Feature works end to end in the browser or worker flow
- No type errors or lint errors
- Relevant tests pass
- Errors and retries are handled
- Drive assets are stored in the correct folder
- Documentation and environment variables are updated
