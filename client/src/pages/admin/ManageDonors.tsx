import React, { useEffect, useState } from 'react';
import DonorService from '../../services/DonorService';
import Table from '../../components/ui/Table';
import { UserCheck, UserX, FileText, CheckCircle2 } from 'lucide-react';

export const ManageDonors: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [donors, setDonors] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await DonorService.getProfile();
      setDonors(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch donor list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleBanToggle = async (id: string, currentlyBanned: boolean) => {
    const actionText = currentlyBanned ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${actionText} this donor?`)) return;

    setError(null);
    setSuccess(null);

    try {
      await DonorService.updateProfile(id, {
        isBanned: !currentlyBanned
      });
      setSuccess(`Donor account successfully ${currentlyBanned ? 'activated' : 'locked'}.`);
      fetchDonors();
    } catch (err: any) {
      setError(err.message || 'Failed to update donor status.');
    }
  };

  const columns = [
    {
      header: 'Donor Name',
      accessor: (row: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 dark:text-slate-200">{row.name}</span>
          <span className="text-[10px] text-slate-400">{row.email}</span>
        </div>
      )
    },
    { header: 'Group', accessor: 'bloodGroup', className: 'font-bold text-blood' },
    { header: 'Age/Weight', accessor: (row: any) => `${row.age} yrs / ${row.weight} kg` },
    {
      header: 'Last Donation',
      accessor: (row: any) => row.lastDonationDate 
        ? new Date(row.lastDonationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : <span className="text-slate-400 italic">None logged</span>
    },
    {
      header: 'Health Profile',
      accessor: (row: any) => (
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          {row.healthConditions && row.healthConditions.length > 0 ? (
            row.healthConditions.map((cond: string, idx: number) => (
              <span key={idx} className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded text-[9px] font-bold">
                {cond}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
              <CheckCircle2 className="h-3 w-3" /> Healthy
            </span>
          )}
        </div>
      )
    },
    {
      header: 'ID Doc',
      accessor: (row: any) => row.idProofUrl ? (
        <a
          href={`http://localhost:5000${row.idProofUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 hover:underline"
        >
          <FileText className="h-4 w-4" />
          <span>View</span>
        </a>
      ) : (
        <span className="text-slate-400 text-xs italic">No doc</span>
      )
    },
    {
      header: 'Status',
      accessor: (row: any) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
          row.isBanned 
            ? 'bg-rose-100 text-rose-800' 
            : 'bg-emerald-100 text-emerald-800'
        }`}>
          {row.isBanned ? 'Locked' : 'Active'}
        </span>
      )
    },
    {
      header: 'Access Control',
      accessor: (row: any) => (
        <button
          onClick={() => handleBanToggle(row._id, row.isBanned)}
          className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${
            row.isBanned 
              ? 'bg-green-50 text-green-600 hover:bg-green-100' 
              : 'bg-red-50 text-red-600 hover:bg-red-100'
          }`}
          title={row.isBanned ? 'Unlock Account' : 'Lock Account'}
        >
          {row.isBanned ? <UserCheck className="h-4.5 w-4.5" /> : <UserX className="h-4.5 w-4.5" />}
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Manage Registered Donors
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Verify donor files, review medical parameters, and restrict accounts for system safety.
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

      {/* Donors Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Donor Directory registry
        </h3>
        <Table
          columns={columns}
          data={donors}
          loading={loading}
          emptyMessage="No donors are registered in the directory."
        />
      </div>
    </div>
  );
};

export default ManageDonors;
