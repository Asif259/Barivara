---
type: user
created: 2026-07-18
updated: 2026-10-15
---

# User Preferences

- **Always Analyze Core Architectural Folders**: Every chat session must actively analyze, consult, and align with the following 4 directories:
  - `.agents/` (Agent configurations, skills, architecture, rules, workflows)
  - `ai/` (AI operational instructions, current system state, architectural decisions, known issues)
  - `data/` (Database schema, entity relationships, system data flow)
  - `workflows/` (End-to-end user journeys, admin journeys, scheduled tasks, background jobs)
- **GetLayers Workflow & Protocol**: Whenever building or designing with GetLayers (or when using GetLayers MCP), strictly adhere to the `getlayers` skill (`.agents/skills/getlayers/SKILL.md`). **Always call `getlayers_start` FIRST** before discussing layouts, picking assets, or writing any UI code.

