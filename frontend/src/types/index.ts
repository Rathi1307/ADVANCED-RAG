export type UserRole = 'sre' | 'admin' | 'approver' | 'viewer';
export type RouteType = 'rag' | 'sql' | 'hybrid';
export type EvidenceType = 'runbook' | 'postmortem' | 'sql_record' | 'metric_or_event' | 'external_doc';
export type IncidentSeverity = 'P0' | 'P1' | 'P2' | 'P3';
export type IncidentStatus = 'investigating' | 'identified' | 'mitigating' | 'resolved';

export interface UserInfo {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
  username: string;
  role: UserRole;
}

export interface EvidenceItem {
  id: string;
  source_type: EvidenceType;
  title: string;
  excerpt: string;
  relevance_score: number;
  metadata?: {
    service_name?: string;
    section?: string;
    document_id?: string;
    version?: string;
    timestamp?: string;
    retrieval_method?: 'Dense' | 'BM25' | 'RRF' | 'Reranked' | 'SQL';
    commit_sha?: string;
    [key: string]: any;
  };
  timestamp?: string;
}

export interface TraceStep {
  id: string;
  name: string;
  status: 'completed' | 'running' | 'warning' | 'failed' | 'skipped';
  duration_ms: number;
  summary: string;
  cache_hit?: boolean;
  score?: number;
  details?: Record<string, any>;
}

export interface InvestigationResponse {
  answer: string;
  summary: string;
  evidence: EvidenceItem[];
  route: RouteType;
  trace_id: string;
  cache_hit: boolean;
  faithfulness_score: number;
  reflection_attempts: number;
  limitations_and_uncertainty?: string;
  suggested_next_checks: string[];
  sql_executed?: string;
  sql_approval_id?: string;
  sql_status?: string;
  crag_score?: number;
  crag_fallback_triggered?: boolean;
  traces?: TraceStep[];
}

export interface SQLApprovalRequest {
  id: string;
  query: string;
  service: string;
  purpose: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  safety_checks: {
    select_only: boolean;
    no_mutation: boolean;
    authorized_tables: boolean;
    row_limit_applied: boolean;
    timeout_configured: boolean;
  };
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  generated_at: string;
  expires_in_seconds: number;
}

export interface Incident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  service: string;
  started_at: string;
  lead_engineer: string;
  summary: string;
  current_latency_p99: string;
  baseline_latency_p99: string;
  error_rate: string;
}

export interface ServiceData {
  id: string;
  name: string;
  tier: 'Tier-1' | 'Tier-2' | 'Tier-3';
  status: 'Healthy' | 'Degraded' | 'Critical';
  owning_team: string;
  slo_target_ms: number;
  current_p99_ms: number;
  error_rate_pct: number;
  pods_count: number;
  restarts_count: number;
  active_version: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  request_id: string;
  trace_id: string;
  user_id: string;
  username: string;
  user_role: string;
  event_type: string;
  route?: string;
  query_text: string;
  tokens_consumed: number;
  latency_ms: number;
  cache_hit: boolean;
  sql_query_hash?: string;
  approval_decision?: string;
  pii_redacted_count: number;
  security_flagged: boolean;
  details: Record<string, any>;
}
