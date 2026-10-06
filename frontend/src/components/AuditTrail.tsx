import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, Shield, Clock, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { AuditEvent } from '../types';
import { ApiService } from '../services/api';

export const AuditTrail: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchAuditEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.getAuditEvents(25);
      setEvents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve audit events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditEvents();
  }, []);

  const filteredEvents = events.filter(e =>
    e.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.trace_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.query_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
              Immutable SRE Compliance & Investigation Audit Stream
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search trace ID, user, route..."
                className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono w-56"
              />
            </div>

            <button
              onClick={fetchAuditEvents}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-slate-700 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {filteredEvents.length === 0 && !loading ? (
          <div className="text-center py-12 text-slate-500 font-mono text-xs">
            No audit records match the current filter criteria.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredEvents.map((ev, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800/90 hover:border-slate-700 transition-all font-mono"
              >
                <div
                  onClick={() => setExpandedId(expandedId === ev.id ? null : ev.id)}
                  className="flex flex-wrap items-center justify-between gap-2 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-500">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                    <span className="font-bold text-slate-200">{ev.event_type}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                      {ev.trace_id}
                    </span>
                    {ev.route && (
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {ev.route}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                    <span>user: <strong className="text-slate-200">{ev.username}</strong></span>
                    <span>latency: <strong className="text-emerald-400">{ev.latency_ms.toFixed(1)}ms</strong></span>
                    <span>tokens: <strong className="text-blue-400">{ev.tokens_consumed}</strong></span>
                    {expandedId === ev.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </div>

                {expandedId === ev.id && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] space-y-2 text-slate-400">
                    <div>
                      <span className="text-slate-500">Query Text:</span>
                      <p className="text-slate-300 mt-0.5">{ev.query_text}</p>
                    </div>
                    {ev.details && (
                      <div>
                        <span className="text-slate-500">Audit Details JSON:</span>
                        <pre className="mt-1 p-2 bg-slate-950 rounded border border-slate-800 text-[10px] text-slate-300 overflow-x-auto">
                          {JSON.stringify(ev.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
