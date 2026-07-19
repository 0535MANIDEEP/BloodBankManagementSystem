import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Droplet, User, Building2, CheckCircle2 } from 'lucide-react';

export const Register: React.FC = () => {
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'donor' | 'hospital'>('donor');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    // Donor specific
    age: '',
    weight: '',
    bloodGroup: 'A+',
    lastDonationDate: '',
    healthConditionsText: '',
    // Hospital specific
    licenseNumber: '',
    address: ''
  });

  const [errors, setErrors] = useState<any>({});

  const handleTabChange = (tab: 'donor' | 'hospital') => {
    setActiveTab(tab);
    setErrors({});
    clearError();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    clearError();
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    const tempErrors: any = {};
    if (!formData.name) tempErrors.name = 'Name is required';
    if (!formData.email) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.phone) tempErrors.phone = 'Phone number is required';

    if (activeTab === 'donor') {
      const ageNum = parseInt(formData.age);
      if (!formData.age) {
        tempErrors.age = 'Age is required';
      } else if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) {
        tempErrors.age = 'Age must be between 18 and 65';
      }

      const weightNum = parseFloat(formData.weight);
      if (!formData.weight) {
        tempErrors.weight = 'Weight is required';
      } else if (isNaN(weightNum) || weightNum < 50) {
        tempErrors.weight = 'Weight must be at least 50 kg';
      }
    } else {
      if (!formData.licenseNumber) tempErrors.licenseNumber = 'License number is required';
      if (!formData.address) tempErrors.address = 'Hospital address is required';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Parse health conditions
    const healthConditions = formData.healthConditionsText
      ? formData.healthConditionsText.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const payload: any = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: activeTab
    };

    if (activeTab === 'donor') {
      payload.age = parseInt(formData.age);
      payload.weight = parseFloat(formData.weight);
      payload.bloodGroup = formData.bloodGroup;
      payload.lastDonationDate = formData.lastDonationDate || null;
      payload.healthConditions = healthConditions;
    } else {
      payload.licenseNumber = formData.licenseNumber;
      payload.address = formData.address;
    }

    try {
      const user = await register(payload);
      if (user.role === 'donor') navigate('/donor/dashboard');
      else if (user.role === 'hospital') navigate('/hospital/dashboard');
    } catch (err) {
      // Error handled by store state
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-red-50 dark:from-[#121212] dark:to-[#1a1212] py-12 px-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-2 bg-gradient-to-br from-red-600 to-red-500 rounded-xl text-white shadow-md mb-2">
            <Droplet className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Create an Account
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sign up to donate blood or request inventory support
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 p-1 bg-slate-200/60 dark:bg-neutral-800/60 border border-slate-200/20 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => handleTabChange('donor')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'donor'
                ? 'bg-white dark:bg-[#1E1E1E] text-blood shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <User className="h-4.5 w-4.5" />
            <span>As a Donor</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('hospital')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'hospital'
                ? 'bg-white dark:bg-[#1E1E1E] text-blood shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="h-4.5 w-4.5" />
            <span>As a Hospital</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 border border-white dark:border-white/5 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-950/40 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Common fields: Name, Email, Password, Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={activeTab === 'donor' ? 'Full Name' : 'Hospital Name'}
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder={activeTab === 'donor' ? 'e.g. John Doe' : 'e.g. City General Hospital'}
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="e.g. info@domain.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Min 6 characters"
              />
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="e.g. 555-0199"
              />
            </div>

            {/* Donor Fields */}
            {activeTab === 'donor' && (
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    error={errors.age}
                    placeholder="Min 18"
                  />
                  <Input
                    label="Weight (kg)"
                    name="weight"
                    type="number"
                    value={formData.weight}
                    onChange={handleChange}
                    error={errors.weight}
                    placeholder="Min 50"
                  />
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Last Donation Date (Optional)"
                    name="lastDonationDate"
                    type="date"
                    value={formData.lastDonationDate}
                    onChange={handleChange}
                    error={errors.lastDonationDate}
                  />
                  <Input
                    label="Health Conditions (Comma-separated)"
                    name="healthConditionsText"
                    value={formData.healthConditionsText}
                    onChange={handleChange}
                    placeholder="e.g. Asthma, none"
                  />
                </div>
              </div>
            )}

            {/* Hospital Fields */}
            {activeTab === 'hospital' && (
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-white/5">
                <Input
                  label="Medical License / Registry Number"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  error={errors.licenseNumber}
                  placeholder="e.g. LIC-998877"
                />
                <Input
                  label="Hospital Facility Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address}
                  placeholder="e.g. 123 Main St, New York"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full mt-4"
              loading={loading}
              icon={<CheckCircle2 className="h-4 w-4" />}
            >
              Complete Registration
            </Button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
            </span>
            <Link
              to="/login"
              className="text-xs font-bold text-blood hover:text-red-700 dark:hover:text-red-500 underline transition-colors"
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
