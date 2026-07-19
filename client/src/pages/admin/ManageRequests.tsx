import React, { useEffect, useState } from 'react';
import RequestService from '../../services/RequestService';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { Check, X, Truck, MessageSquare } from 'lucide-react';

export const ManageRequests: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reject Modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await RequestService.getAll();
      setRequests(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch hospital requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await RequestService.approve(id);
      setSuccess(res.message || 'Request approved and units allocated.');
      fetchRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to approve request.');
    }
  };

  const handleRejectClick = (id: string) => {
    setRejectingId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId) return;

    setRejecting(true);
    setError(null);
    setSuccess(null);

    try {
      await RequestService.reject(
        rejectingId,
        rejectReason || 'Insufficient inventory or requirements mismatch.'
      );
      setSuccess('Request rejected.');
      setRejectModalOpen(false);
      fetchRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to reject request.');
    } finally {
      setRejecting(false);
    }
  };

  const handleComplete = async (id: string) => {
    setError(null);
    setSuccess(null);
    try {
      await RequestService.complete(id);
      setSuccess('Order delivery marked as completed.');
      fetchRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to complete order.');
    }
  };

  const columns = [
    {
      header: 'Hospital',
      accessor: (row: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {row.hospital?.name}
          </span>
          <span className="text-[10px] text-slate-400">
            {row.hospital?.phone || 'No phone'}
          </span>
        </div>
      )
    },
    { header: 'Blood Group', accessor: 'bloodGroup', className: 'font-bold text-blood' },
    { header: 'Units Needed', accessor: (row: any) => `${row.units} Bag(s)` },
    {
      header: 'Priority',
      accessor: (row: any) => (
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
          row.priority === 'Emergency'
            ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-100/30 animate-pulse'
            : 'bg-slate-50 text-slate-700 dark:bg-neutral-800 dark:text-slate-400'
        }`}>
          {row.priority}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (row: any) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
          row.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
          row.status === 'Approved' ? 'bg-sky-100 text-sky-800 animate-pulse' :
          row.status === 'Completed' ? 'bg-green-100 text-green-800' :
          'bg-rose-100 text-rose-800'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Remarks / Alert',
      accessor: (row: any) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 max-w-[200px] truncate">
          <MessageSquare className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>{row.message || <span className="italic text-slate-400">No notes</span>}</span>
        </div>
      )
    },
    {
      header: 'Dispatch Controls',
      accessor: (row: any) => {
        if (row.status === 'Pending') {
          return (
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(row._id)}
                className="p-1 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                title="Approve & Allocate"
              >
                <Check className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={() => handleRejectClick(row._id)}
                className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                title="Reject"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          );
        }
        if (row.status === 'Approved') {
          return (
            <Button
              onClick={() => handleComplete(row._id)}
              className="text-xs py-1 px-3"
              icon={<Truck className="h-3.5 w-3.5" />}
            >
              Mark Delivered
            </Button>
          );
        }
        return <span className="text-xs text-slate-400 italic">Processed</span>;
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Review Hospital Requests
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Review urgent emergency requests, allocate stock, and dispatch blood units.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-950/40 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          {success}
        </div>
      )}

      {/* Requests Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Hospital Dispatches Board
        </h3>
        <Table
          columns={columns}
          data={requests}
          loading={loading}
          emptyMessage="No hospital requests have been logged."
        />
      </div>

      {/* Reject Modal */}
      <Modal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Blood Request"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <Input
            label="Reason for Rejection"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Insufficient available bags of requested type."
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              type="submit"
              loading={rejecting}
            >
              Reject Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageRequests;
