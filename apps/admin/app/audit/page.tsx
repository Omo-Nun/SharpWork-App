'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '../../lib/api';
import { getAccessToken } from '../../lib/auth-storage';

interface AuditEntry {
  id: string;
  action: string;
  amount: number | null;
  actorRole: string | null;
  createdAt: string;
  booking?: { id: string; description: string; price: number };
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<AuditEntry[]>('/admin/audit-log', getAccessToken())
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading audit log...</p>;

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Escrow Audit Log</h1>
      <div className="space-y-3">
        {logs.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border text-gray-500">No escrow actions recorded yet.</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="bg-white p-4 rounded-xl border flex justify-between gap-4">
              <div>
                <p className="font-bold text-brand-navy">{log.action}</p>
                <p className="text-sm text-gray-500">{log.booking?.description?.slice(0, 60) || log.booking?.id}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(log.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right text-sm">
                {log.amount != null && <p className="font-bold text-brand-green">₦{log.amount.toLocaleString()}</p>}
                {log.actorRole && <p className="text-gray-500 uppercase">{log.actorRole}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
