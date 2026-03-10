// src/api/agent.js
import api from './client'

export const runAgent = (query, tools = ['search']) =>
  api.post('/api/agent/run', { query, tools })