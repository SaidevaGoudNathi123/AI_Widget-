# Skills & Working Contract

This document defines the technical skills, assumptions, and working rules
for humans and AI agents (e.g., Claude) collaborating on this project.

This file acts as a source of truth.

---

## 1. Purpose

The purpose of this file is to:

- Clarify the technology stack
- Define expected skill levels
- Prevent incorrect assumptions
- Guide AI behavior toward production-quality output
- Maintain consistency across development, AI, and product decisions

AI agents must respect this file as a contract.

---

## 2. System Overview

This project is a production-grade software system.

High-level characteristics:
- Modular architecture
- API-driven backend
- Frontend + backend separation
- AI-assisted features
- Cloud deployment

---

## 3. Tech Stack (Assumed)

Unless stated otherwise, assume:

- Language: JavaScript / TypeScript
- Frontend: React
- Backend: Node.js
- Styling: CSS or utility-based frameworks
- AI: LLM-based (API-driven)
- Deployment: Cloud-hosted (non-local)

AI agents must not introduce new technologies without justification.

---

## 4. Roles & Expectations

### Developer

Expected to:
- Write clean, readable code
- Follow existing patterns
- Make incremental changes
- Avoid breaking public APIs
- Add comments where logic is non-obvious

AI agents should:
- Prefer minimal, safe solutions
- Ask before large refactors
- Avoid deleting files unless instructed

---

### AI / ML Engineer

Expected to:
- Design prompts carefully
- Manage context and tokens
- Optimize for reliability and cost
- Prefer deterministic outputs

AI agents should:
- Treat prompts as production code
- Explain trade-offs
- Avoid hallucinating capabilities

---

### Product Owner

Expected to:
- Focus on user experience
- Prioritize clarity over complexity
- Balance scope and value
- Ask “why” before “how”

AI agents should:
- Flag scope creep
- Suggest simpler alternatives
- Avoid unnecessary features

---

## 5. Core Skills Assumed

### Programming
- Async/await
- Error handling
- Modular code structure
- Basic debugging

### Frontend
- Component-based UI
- State management
- Event handling
- Responsive layouts

### Backend
- REST APIs
- Request/response lifecycle
- Environment variables
- Error handling

### AI Concepts
- Prompt engineering
- Context management
- Token limits
- Model behavior awareness

---

## 6. AI-Specific Rules

AI agents MUST:
1. Think before acting
2. Ask clarifying questions when unsure
3. Avoid assumptions
4. Prefer correctness over speed
5. Explain reasoning when needed

AI agents MUST NOT:
- Invent APIs, files, or configs
- Assume business logic
- Fabricate data or metrics

---

## 7. Context & Memory Management

For long sessions:
- Focus on one task at a time
- Request context reset if clarity drops
- Summarize assumptions when needed

Recommended reset phrase:
> Reset context. This is a new task.

---

## 8. Output Expectations

Outputs should be:
- Structured (headings, bullet points)
- Clear and concise
- Actionable
- Production-ready

Code outputs should:
- Compile
- Match existing style
- Avoid unnecessary complexity

---

## 9. Autonomy Rules

AI agents MAY:
- Suggest improvements
- Identify risks
- Propose alternatives

AI agents MAY NOT:
- Make destructive changes
- Change architecture without approval
- Introduce paid services silently

---

## 10. Definition of Done

A task is complete when:
- The solution works
- Trade-offs are explained
- No assumptions are hidden
- Output aligns with product goals

---

## 11. Final Instruction

This document is a contract.

If something is unclear:
→ Ask.

If something conflicts:
→ Flag it.

Quality > speed  
Clarity > cleverness  
Product > ego
