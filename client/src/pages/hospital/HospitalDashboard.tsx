import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import InventoryService from '../../services/InventoryService';
import RequestService from '../../services/RequestService';
import Card from '../../components/ui/Card';
import { Droplet, FileSpreadsheet, PlusCircle, ShieldAlert, BadgeAlert } from 'lucide-react';

export const HospitalDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>({});
  const [requests, setRequests] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inventoryRes, requestsRes] = await Promise.all([
        InventoryService.getInventory(),
        RequestService.getAll()
      ]);

      setSummary(inventoryRes.data.summary);
      setRequests(requestsRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch hospital metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute status counts
  const getStatusCount = (status: string) => {
    return requests.filter(r => r.status === status).length;
  };

  const getEmergencyCount = () => {
    return requests.filter(r => r.priority === 'Emergency' && r.status === 'Pending').length;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-200 dark:bg-neutral-800 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-28 bg-slate-200 dark:bg-neutral-800 rounded-2xl" />
          <div className="h-28 bg-slate-200 dark:bg-neutral-800 rounded-2xl" />
          <div className="h-28 bg-slate-200 dark:bg-neutral-800 rounded-2xl" />
          <div className="h-28 bg-slate-200 dark:bg-neutral-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Hospital Operations
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Request blood bags and track supply chain movements.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/hospital/request?priority=Emergency"
            className="px-5 py-2.5 bg-gradient-to-r from-red-800 to-red-600 text-white font-bold text-sm rounded-xl shadow-md shadow-red-950/20 hover:from-red-900 transition-all flex items-center gap-2"
          >
            <ShieldAlert className="h-4.5 w-4.5" />
            <span>Emergency Request</span>
          </Link>
          <Link
            to="/hospital/request"
            className="px-5 py-2.5 bg-white dark:bg-[#1E1E1E] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/5 font-bold text-sm rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <PlusCircle className="h-4.5 w-4.5 text-blood" />
            <span>Request Blood</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Pending Requests"
          value={getStatusCount('Pending')}
          icon={<FileSpreadsheet className="h-5 w-5" />}
          subtitle="Waiting for admin approval"
        />

        <Card
          title="Approved Requests"
          value={getStatusCount('Approved')}
          icon={<Droplet className="h-5 w-5" />}
          subtitle="Bags allocated, in transit"
        />

        <Card
          title="Completed Deliveries"
          value={getStatusCount('Completed')}
          icon={<PlusCircle className="h-5 w-5 text-emerald-500" />}
          subtitle="Successfully delivered units"
        />

        <Card
          title="Active Emergency"
          value={getEmergencyCount()}
          icon={<BadgeAlert className="h-5 w-5 text-red-600" />}
          className={getEmergencyCount() > 0 ? 'border-red-200 bg-red-50/20 dark:bg-red-950/10' : ''}
          subtitle="High-priority blood requests"
        />
      </div>

      {/* Blood Bank stock preview */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Blood Bank Stock Preview
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {bloodGroups.map((bg) => {
            const units = summary[bg] || 0;
            const isLow = units < 8;
            
            return (
              <div 
                key={bg} 
                className={`glass-card p-4 flex flex-col items-center justify-center gap-1 hover:shadow-md transition-all duration-200 ${
                  isLow 
                    ? 'border-red-100/50 bg-red-50/5 dark:border-red-950/20 dark:bg-red-950/5' 
                    : ''
                }`}
              >
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                  {bg}
                </span>
                <span className={`text-xl font-black ${isLow ? 'text-blood' : 'text-slate-800 dark:text-slate-100'}`}>
                  {units}
                </span>
                <span className="text-[9px] text-slate-400 font-semibold">
                  {units === 1 ? 'Bag' : 'Bags'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
