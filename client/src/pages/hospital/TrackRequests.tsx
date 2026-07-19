import React, { useEffect, useState } from 'react';
import RequestService from '../../services/RequestService';
import Table from '../../components/ui/Table';


export const TrackRequests: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await RequestService.getAll();
      setRequests(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const columns = [
    {
      header: 'Requested Date',
      accessor: (row: any) => new Date(row.createdAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    },
    { header: 'Blood Group', accessor: 'bloodGroup' },
    { header: 'Units Required', accessor: (row: any) => `${row.units} Bags` },
    {
      header: 'Priority',
      accessor: (row: any) => (
        <span className={`px-2.5 py-0.5 rounded text-xs font-extrabold tracking-wide uppercase ${
          row.priority === 'Emergency' 
            ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-100/30' 
            : 'bg-slate-50 text-slate-700 dark:bg-neutral-800 dark:text-slate-400 border border-slate-200/20'
        }`}>
          {row.priority}
        </span>
      )
    },
    {
      header: 'Status Progress',
      accessor: (row: any) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          row.status === 'Pending' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' :
          row.status === 'Approved' ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/20 dark:text-sky-400' :
          row.status === 'Completed' ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' :
          'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
        }`}>
          {row.status.toUpperCase()}
        </span>
      )
    },
    {
      header: 'Message / Remarks',
      accessor: (row: any) => row.message || <span className="text-slate-400 italic">No notes</span>
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Track Supply Requests
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Real-time updates on active blood orders.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Board Layout showing progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-1">
        {/* Step 1 */}
        <div className="p-4 glass-card bg-amber-50/5 border-amber-100/50 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">Stage 1</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pending Review</span>
          </div>
          <span className="text-2xl font-black text-amber-500">
            {requests.filter(r => r.status === 'Pending').length}
          </span>
        </div>

        {/* Step 2 */}
        <div className="p-4 glass-card bg-sky-50/5 border-sky-100/50 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest block">Stage 2</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Approved & Dispatching</span>
          </div>
          <span className="text-2xl font-black text-sky-500">
            {requests.filter(r => r.status === 'Approved').length}
          </span>
        </div>

        {/* Step 3 */}
        <div className="p-4 glass-card bg-emerald-50/5 border-emerald-100/50 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">Stage 3</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Completed & Delivered</span>
          </div>
          <span className="text-2xl font-black text-emerald-500">
            {requests.filter(r => r.status === 'Completed').length}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Request Logs
        </h3>
        <Table
          columns={columns}
          data={requests}
          loading={loading}
          emptyMessage="Your hospital has not submitted any blood requests yet."
        />
      </div>
    </div>
  );
};

export default TrackRequests;
