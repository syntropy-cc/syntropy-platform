# AI Agents API

AI Agents domain: create and use agent sessions, and (for admins) manage agent definitions. Sessions are scoped to a context entity (e.g. fragment, issue).

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/ai-agents/sessions` | Create agent session (agent name, context entity type/id) |
| GET | `/api/v1/ai-agents/sessions/:id` | Get session |
| POST | `/api/v1/ai-agents/sessions/:id/invoke` or `/messages` | Send message or invoke tool (if exposed) |
| GET | `/api/v1/agents` | List agents (admin) |
| POST | `/api/v1/agents` | Create agent (admin) |
| GET | `/api/v1/agents/:id` | Get agent |
| GET | `/api/v1/agents/:id/tools` | List tools for agent |

## Create session

```
POST /api/v1/ai-agents/sessions
```

**Request body**: `agent_name` (e.g. `fragment-author-agent`), `context_entity_type` (e.g. `fragment`), `context_entity_id` (UUID).

**Response** `201 Created` — Session with `id`, `agent_id`, `user_id`, `context_entity_id`, `status: "active"`.

**Errors**: 401, 403 (tool scope insufficient), 404 (agent not found), 422, 429, 503.

## Get session

```
GET /api/v1/ai-agents/sessions/:id
```

**Response** `200 OK` — Full session. Caller must own the session or have permission.

**Errors**: 401, 404.

## Invoke / send message

```
POST /api/v1/ai-agents/sessions/:id/invoke
```
or
```
POST /api/v1/ai-agents/sessions/:id/messages
```

**Request body**: `content` (string) or tool-call payload per implementation.

**Response** `200 OK` — e.g. `{ "response": "...", "tool_calls_made": [...], "session_id": "..." }`.

**Errors**: 401, 404, 422 (session closed), 429, 503.

## Agent registry (admin)

`GET /api/v1/agents` — List agents (admin).  
`POST /api/v1/agents` — Create agent (admin). Body: name, version, pillar, system_prompt, preferred_model, etc.  
`GET /api/v1/agents/:id` — Get agent.  
`GET /api/v1/agents/:id/tools` — List tools for agent.  
`GET /api/v1/agents/tools/:toolName/can-invoke` — Check if current user can invoke tool (if exposed).

**Errors**: 401, 403 (non-admin for create/list), 404, 503.

## See Also

- [AI Agents concept](../../concepts/ai-agents.md)
- [API Overview](overview.md)
