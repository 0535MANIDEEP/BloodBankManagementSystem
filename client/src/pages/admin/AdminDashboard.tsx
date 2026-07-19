import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import InventoryService from '../../services/InventoryService';
import RequestService from '../../services/RequestService';
import DonorService from '../../services/DonorService';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import InventoryChart from '../../components/charts/InventoryChart';
import {
  Users,
  Droplet,
  FileSpreadsheet,
  Sparkles
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stockSummary, setStockSummary] = useState<any>({});
  const [alerts, setAlerts] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [donorsCount, setDonorsCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inventoryRes, requestsRes, donorsRes] = await Promise.all([
        InventoryService.getInventory(),
        RequestService.getAll(),
        DonorService.getProfile()
      ]);

      setStockSummary(inventoryRes.data.summary);
      setAlerts(inventoryRes.data.alerts);
      setRequests(requestsRes.data.slice(0, 5)); // show top 5 requests
      setDonorsCount(donorsRes.count);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin dashboard details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalBags = Object.values(stockSummary).reduce((acc: number, val: any) => acc + val, 0) as number;

  const requestColumns = [
    {
      header: 'Hospital',
      accessor: (row: any) => (
        <span className="font-bold text-slate-800 dark:text-slate-200">
          {row.hospital?.name || 'Unknown'}
        </span>
      )
    },
    { header: 'Group', accessor: 'bloodGroup' },
    { header: 'Units', accessor: (row: any) => `${row.units} Bags` },
    {
      header: 'Priority',
      accessor: (row: any) => (
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
          row.priority === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
        }`}>
          {row.priority}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (row: any) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
          row.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
          row.status === 'Approved' ? 'bg-sky-100 text-sky-800' :
          row.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
          'bg-rose-100 text-rose-800'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Action',
      accessor: () => (
        <Link 
          to="/admin/requests"
          className="text-xs font-bold text-blood hover:underline"
        >
          Process
        </Link>
      )
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-28 bg-slate-200 dark:bg-neutral-800 rounded-2xl" />
          <div className="h-28 bg-slate-200 dark:bg-neutral-800 rounded-2xl" />
          <div className="h-28 bg-slate-200 dark:bg-neutral-800 rounded-2xl" />
        </div>
        <div className="h-[300px] bg-slate-200 dark:bg-neutral-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Admin Dashboard
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Global inventory health monitoring and dispatch systems.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* AI Smart Alerts ticker */}
      {alerts.length > 0 && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex items-start gap-3">
          <div className="p-1.5 bg-red-600 text-white rounded-lg animate-pulse shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1 overflow-hidden">
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-0.5">
              AI Smart Alerts & Outreach suggestion
            </span>
            <div className="flex flex-col gap-1.5 mt-1.5">
              {alerts.map((alert, index) => (
                <div key={index} className="text-xs text-slate-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <p className="truncate">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Statistics board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Total Registered Donors"
          value={donorsCount}
          icon={<Users className="h-5 w-5" />}
          subtitle="Registered donor users database"
        />

        <Card
          title="Available Inventory"
          value={`${totalBags} Bags`}
          icon={<Droplet className="h-5 w-5" />}
          subtitle="Non-expired available units in bank"
        />

        <Card
          title="Pending Requests"
          value={requests.filter(r => r.status === 'Pending').length}
          icon={<FileSpreadsheet className="h-5 w-5" />}
          subtitle="Active hospital dispatches awaiting approval"
        />
      </div>

      {/* Inventory chart and requests logs */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <InventoryChart data={stockSummary} />
        </div>
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Recent Blood Requests
            </h3>
            <Link to="/admin/requests" className="text-xs font-bold text-blood hover:underline">
              View all
            </Link>
          </div>
          <Table
            columns={requestColumns}
            data={requests}
            emptyMessage="No pending requests at this time."
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
