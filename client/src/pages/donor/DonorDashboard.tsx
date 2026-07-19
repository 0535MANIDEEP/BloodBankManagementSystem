import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DonorService from '../../services/DonorService';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import { Calendar, Heart, ShieldAlert, BadgeInfo, CheckCircle } from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [eligibility, setEligibility] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [donorRes, eligibilityRes] = await Promise.all([
        DonorService.getProfile(),
        DonorService.checkEligibility()
      ]);

      setProfile(donorRes.data.profile);
      setHistory(donorRes.data.history);
      setEligibility(eligibilityRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch donor metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute profile completion meter
  const getProfileCompletion = () => {
    if (!profile) return 0;
    let completed = 2; // email and name always present
    const fields = ['phone', 'age', 'weight', 'bloodGroup', 'idProofUrl'];
    fields.forEach(field => {
      if (profile[field]) completed++;
    });
    return Math.round((completed / (fields.length + 2)) * 100);
  };

  const columns = [
    {
      header: 'Donation Date',
      accessor: (row: any) => new Date(row.addedDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    },
    { header: 'Blood Group', accessor: 'bloodGroup' },
    { header: 'Units (ml)', accessor: (row: any) => `${row.units} Units` },
    {
      header: 'Status',
      accessor: (row: any) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          row.status === 'available' ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' :
          row.status === 'assigned' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' :
          'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-400'
        }`}>
          {row.status.toUpperCase()}
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-200 dark:bg-neutral-800 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-28 bg-slate-200 dark:bg-neutral-800 rounded-2xl" />
          <div className="h-28 bg-slate-200 dark:bg-neutral-800 rounded-2xl" />
          <div className="h-28 bg-slate-200 dark:bg-neutral-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const completion = getProfileCompletion();

  return (
    <div className="space-y-6">
      {/* Header and Quick Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Donor Workspace
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Welcome back, {profile?.name}. Manage your contributions.
          </p>
        </div>
        <Link
          to="/donor/donate"
          className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-sm rounded-xl shadow-md shadow-red-500/20 hover:from-red-700 transition-all hover:scale-[1.01]"
        >
          Donate Blood Now
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* AI Suggestion Panel */}
      {eligibility && (
        <div className={`p-5 rounded-2xl border ${
          eligibility.isEligible 
            ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/20' 
            : 'bg-amber-50/50 border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/20'
        } flex items-start gap-4 shadow-sm`}>
          <div className={`p-2.5 rounded-xl ${
            eligibility.isEligible ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-amber-100 dark:bg-amber-950 text-amber-600'
          }`}>
            {eligibility.isEligible ? <CheckCircle className="h-5.5 w-5.5" /> : <ShieldAlert className="h-5.5 w-5.5" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {eligibility.isEligible ? 'Eligible to Donate Whole Blood' : 'Temporary Wait Required'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {eligibility.aiSuggestion}
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Donations Made"
          value={history.length}
          icon={<Heart className="h-5 w-5" />}
          subtitle="Lifetime blood donations logged"
        />

        <Card
          title="Last Donation Date"
          value={profile?.lastDonationDate ? new Date(profile.lastDonationDate).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
          }) : 'No records'}
          icon={<Calendar className="h-5 w-5" />}
          subtitle="90 days required between events"
        />

        {/* Profile completion card */}
        <div className="glass-card p-6 flex flex-col justify-between hover:shadow-glass-hover transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1 w-full">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Profile Completion
              </span>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                  {completion}%
                </span>
                <div className="flex-1 bg-slate-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden border border-slate-200/10">
                  <div 
                    className="bg-gradient-to-r from-red-600 to-red-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-blood rounded-2xl border border-red-100/50 dark:border-red-950/30">
              <BadgeInfo className="h-5 w-5" />
            </div>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 mt-4 font-medium">
            Completing details ensures AI eligibility accuracy.
          </span>
        </div>
      </div>

      {/* Donation History Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Donation History Log
        </h3>
        <Table
          columns={columns}
          data={history}
          emptyMessage="You have not logged any blood donations yet."
        />
      </div>
    </div>
  );
};

export default DonorDashboard;
