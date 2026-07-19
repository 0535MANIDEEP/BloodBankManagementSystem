import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import InventoryService from '../../services/InventoryService';
import RequestService from '../../services/RequestService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Droplet, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const RequestBlood: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPriority = searchParams.get('priority') === 'Emergency' ? 'Emergency' : 'Normal';

  const [formData, setFormData] = useState({
    bloodGroup: 'A+',
    units: '1',
    priority: initialPriority,
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stock, setStock] = useState<any>({});
  
  // Modal alerts
  const [alertText, setAlertText] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    // Load inventory to double check stock count
    InventoryService.getInventory().then(res => {
      setStock(res.data.summary);
    }).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setError(null);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const currentStock = stock[formData.bloodGroup] || 0;
  const isOutOfStock = currentStock < parseInt(formData.units || '0');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.units || parseInt(formData.units) <= 0) {
      setError('Please request a valid amount of units.');
      return;
    }

    setLoading(true);
    setError(null);
    setAlertText(null);

    try {
      const res: any = await RequestService.create({
        bloodGroup: formData.bloodGroup,
        units: parseInt(formData.units),
        priority: formData.priority,
        message: formData.message
      });

      if (res.availabilityAlert) {
        setAlertText(res.availabilityAlert);
      }
      setSuccessOpen(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit blood request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Request Blood Inventory
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Submit demands for local inventory distribution. Urgent cases will be prioritised.
        </p>
      </div>

      <div className="glass-card p-8 border border-white dark:border-white/5 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-950/40 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Blood Group
              </label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="glass-input px-4 py-2.5 text-sm w-full bg-white dark:bg-[#1E1E1E]"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <Input
              label="Units Required (Bags)"
              name="units"
              type="number"
              min="1"
              value={formData.units}
              onChange={handleChange}
              placeholder="e.g. 2"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Request Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={`glass-input px-4 py-2.5 text-sm w-full bg-white dark:bg-[#1E1E1E] font-bold ${
                  formData.priority === 'Emergency' ? 'text-red-600 dark:text-red-400' : 'text-slate-700'
                }`}
              >
                <option value="Normal">Normal</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          </div>

          {/* Real-time availability indicator */}
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs ${
            isOutOfStock
              ? 'bg-amber-50/50 border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/20 text-amber-700 dark:text-amber-400'
              : 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/20 text-emerald-700 dark:text-emerald-400'
          }`}>
            <div className="flex items-center gap-2">
              <Droplet className="h-4.5 w-4.5 fill-current" />
              <span>
                {isOutOfStock 
                  ? `Incomplete Stock: Only ${currentStock} units of ${formData.bloodGroup} available.` 
                  : `Sufficient Stock: ${currentStock} units of ${formData.bloodGroup} available.`
                }
              </span>
            </div>
            {isOutOfStock && <span className="font-bold uppercase text-[9px] bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">Waitlist Warning</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Message / Patient Details
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              className="glass-input px-4 py-2.5 text-sm w-full resize-none"
              placeholder="e.g. Patient undergoing open-heart surgery, requires urgent transfusion."
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            loading={loading}
            icon={<Send className="h-4 w-4" />}
          >
            Submit Request
          </Button>
        </form>
      </div>

      {/* Success Modal */}
      <Modal
        open={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          navigate('/hospital/dashboard');
        }}
        title="Blood Request Logged"
      >
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-900/30">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>
          <h3 className="text-md font-bold text-slate-800 dark:text-slate-100">
            Blood Request Submitted!
          </h3>
          
          {alertText ? (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-left text-xs text-amber-700 dark:text-amber-400 font-medium flex gap-2">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <p>{alertText}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Your request was placed in the queue. Admins will review the priority and dispatch matching inventory units shortly.
            </p>
          )}

          <Button
            onClick={() => {
              setSuccessOpen(false);
              navigate('/hospital/track');
            }}
            className="mt-2"
          >
            Track Request Status
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default RequestBlood;
