import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import DonorService from '../../services/DonorService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ShieldAlert, Heart, Upload, FileText, CheckCircle2 } from 'lucide-react';

export const DonateForm: React.FC = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [eligibility, setEligibility] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [units, setUnits] = useState('1');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const fetchEligibility = async () => {
    try {
      setChecking(true);
      const res = await DonorService.checkEligibility();
      setEligibility(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to verify eligibility.');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchEligibility();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(selected.type)) {
        setFileError('File format must be JPEG, PNG, or PDF.');
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        setFileError('File size must be under 5MB.');
        return;
      }
      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setFileError('ID proof document is required.');
      return;
    }
    
    setError(null);
    setSubmitting(true);
    
    try {
      // 1. Upload ID Proof
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes: any = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const idProofUrl = uploadRes.data;
      
      // 2. Submit donation record
      await DonorService.submitDonation({
        units: parseInt(units),
        idProofUrl
      });
      
      setSuccessOpen(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit donation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <svg className="animate-spin h-7 w-7 text-blood" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-semibold text-slate-500">Checking eligibility logs...</span>
        </div>
      </div>
    );
  }

  // If not eligible, show alert card
  if (eligibility && !eligibility.isEligible) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Blood Donation Request
        </h2>
        
        <div className="p-6 glass-card border-amber-200 bg-amber-50/20 dark:bg-amber-950/10 dark:border-amber-900/20 flex flex-col items-center text-center gap-4">
          <div className="p-3.5 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-full">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h3 className="text-md font-bold text-slate-800 dark:text-slate-200">
            You are not currently eligible to donate
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
            {eligibility.reason}
          </p>
          
          <div className="p-4 bg-white/70 dark:bg-neutral-800/40 border border-slate-200/50 rounded-xl mt-2 w-full text-left">
            <span className="text-[10px] font-bold text-blood uppercase tracking-wider block mb-1">
              AI Suggestion Panel
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
              {eligibility.aiSuggestion}
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={() => navigate('/donor/dashboard')}
            className="mt-4"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Submit Donation Details
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Verify your parameters and upload identification to log your blood unit.
        </p>
      </div>

      <div className="glass-card p-8 border border-white dark:border-white/5 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-950/40 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Prefilled Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Blood Group (From Profile)"
              value={eligibility?.bloodGroup || ''}
              disabled
              className="bg-slate-50 dark:bg-neutral-800 text-slate-500 dark:text-slate-400 font-bold"
            />
            <Input
              label="Units of Blood (e.g. 1 bag ~ 450ml)"
              name="units"
              type="number"
              min="1"
              max="2"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              placeholder="e.g. 1"
            />
          </div>

          {/* File Upload picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Identification Proof (Passport, Driving License, National ID)
            </label>
            
            <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl hover:border-blood transition-colors cursor-pointer p-6 flex flex-col items-center gap-2 relative bg-white/40 dark:bg-neutral-800/20">
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                accept=".jpg,.jpeg,.png,.pdf"
              />
              {file ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <FileText className="h-8 w-8" />
                  <div className="text-left">
                    <p className="text-xs font-bold truncate max-w-[200px]">{file.name}</p>
                    <p className="text-[10px] text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Click to browse files
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Supports JPG, PNG, PDF (Max 5MB)
                  </p>
                </>
              )}
            </div>
            {fileError && (
              <span className="text-xs text-red-500 font-medium mt-0.5">{fileError}</span>
            )}
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            loading={submitting}
            icon={<Heart className="h-4 w-4 fill-current" />}
          >
            Submit Donation Log
          </Button>
        </form>
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          navigate('/donor/dashboard');
        }}
        title="Donation Logged Successfully"
      >
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-900/30">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>
          <h3 className="text-md font-bold text-slate-800 dark:text-slate-100">
            Thank you for your generous contribution!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
            Your blood donation has been logged in the system inventory. The smart inventory matching engine will prioritize allocation for emergency hospital requests.
          </p>
          <Button
            onClick={() => {
              setSuccessOpen(false);
              navigate('/donor/dashboard');
            }}
            className="mt-2"
          >
            Go to Dashboard
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default DonateForm;
