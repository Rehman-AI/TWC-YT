# TWC Content Studio — Architecture

## High-level system
The application is a web control center plus background workers. The web app handles UI, approvals, permissions, and configuration. Workers handle scripts, scene processing, Drive synchronization, QA, SEO, policy checks, and publishing.

## Core modules
- Auth and teams
- Roles and permissions
- Channels
- Platform accounts and OAuth
- Script Board
- Scene Breakdown
- Clip Pipeline
- Drive Storage
- SEO Generator
- Policy Registry
- Kanban and Tasks
- Quotas
- QA Reviewer
- Publisher
- Audit Log

## User roles
- Owner: full access, can approve and publish
- Manager: manages team, assigns work, approves and publishes where permitted
- Member: performs assigned tasks such as scripting, editing, QA, or publishing
- Viewer: read-only access, if needed

## Permissions
Permissions must be enforced per channel, not only globally. A user may have access to one channel but not another.

## Main entities
- User
- Team
- Channel
- PlatformAccount
- VideoProject
- ScriptVersion
- Scene
- Asset
- Task
- Quota
- PolicyRule
- PolicyReport
- SEOReport
- QAReport
- PublishJob
- AuditLog

## Video pipeline statuses
1. `IDEA`
2. `SCRIPTING`
3. `SCRIPT_REVIEW`
4. `SCRIPT_APPROVED`
5. `SCENES_CREATED`
6. `CLIPS_REQUESTED`
7. `CLIPS_UPLOADED`
8. `IN_EDITING`
9. `FINAL_UPLOADED`
10. `AI_QA`
11. `QA_FIXES`
12. `SEO_REVIEW`
13. `POLICY_REVIEW`
14. `READY_FOR_APPROVAL`
15. `APPROVED`
16. `SCHEDULED`
17. `PUBLISHING`
18. `PUBLISHED`
19. `FAILED`
20. `BLOCKED`

## Manual Flow and CapCut flow
- The tool generates an Edit Pack for each video
- Edit Pack contains: script, scene list, timings, Flow prompts, voiceover audio, SRT or word-level captions, music suggestion, on-screen text, brand kit, and SEO draft
- Team generates clips manually in Google Flow
- Editor uploads raw Flow clips and final CapCut export to the video Drive folder
- Tool detects upload or allows the user to mark files as uploaded
- QA, SEO, policy review, and publishing run on the final CapCut export
- FFmpeg rendering is optional and used only as a fallback for simple channels

## Storage structure
Google Drive is the permanent storage system.

```text
TWC Content Studio/
└── Channels/
    └── {channel_name}/
        └── {video_id}/
            ├── 01_Script/
            ├── 02_Scenes/
            ├── 03_Flow_Clips/
            ├── 04_Voiceover/
            ├── 05_Captions/
            ├── 06_Music/
            ├── 07_Edit_Pack/
            ├── 08_Final_Export/
            ├── 09_QA_Reports/
            ├── 10_SEO/
            └── 11_Publish/
```

## Provider interfaces
Each provider must be pluggable:

- TTS provider: TWC TTS default, ElevenLabs premium
- Stock footage provider: Pexels, Pixabay
- Captions provider: Whisper
- AI clip provider: manual Google Flow in MVP; API-based provider later
- Storage provider: Google Drive
- Publisher provider: YouTube first; TikTok, Instagram, Facebook, Snapchat later

## Background jobs
- Generate script
- Create scenes
- Fetch stock footage
- Generate TTS
- Generate captions
- Build Edit Pack
- Detect uploaded assets
- Run AI QA
- Generate SEO
- Run policy checks
- Publish scheduled videos
- Retry failed scene jobs

## Hosting
- Web app: Hostinger
- Queue workers and optional rendering: Hostinger VPS or separate worker VPS
- Minimum recommended VPS: 4 vCPU and 8 GB RAM
- Permanent asset storage: Google Drive
- Server storage: temporary processing cache only

## Security
- Encrypt OAuth tokens at rest
- Use least-privilege scopes
- Never expose service credentials to the client
- Log publishing, approvals, token access, and sensitive changes
- Require confirmation for destructive operations
