import React from 'react';
import { motion } from 'framer-motion';

interface InventoryData {
  [bloodGroup: string]: number;
}

interface InventoryChartProps {
  data: InventoryData;
}

export const InventoryChart: React.FC<InventoryChartProps> = ({ data }) => {
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  
  // Find maximum value to scale the chart height
  const values = Object.values(data);
  const maxVal = Math.max(...values, 10); // default to at least 10 for scaling

  return (
    <div className="glass-card p-6 flex flex-col justify-between w-full h-[320px]">
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Blood Inventory Levels
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
          Real-time unit distribution by blood group
        </p>
      </div>

      <div className="flex-1 flex items-end justify-between gap-2 px-2 h-[180px]">
        {bloodGroups.map((bg) => {
          const units = data[bg] || 0;
          const percentage = (units / maxVal) * 100;
          const isLow = units < 8;
          const isEmpty = units === 0;

          return (
            <div key={bg} className="flex-1 flex flex-col items-center gap-2 group relative">
              {/* Tooltip */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md shadow-md z-10 pointer-events-none whitespace-nowrap">
                {units} {units === 1 ? 'unit' : 'units'}
              </div>

              {/* Bar */}
              <div className="w-full flex items-end bg-slate-100 dark:bg-[#2d2d2d] rounded-t-lg h-full overflow-hidden">
                {!isEmpty && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${percentage}%` }}
                    transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.1 }}
                    className={`w-full rounded-t-lg ${
                      isLow 
                        ? 'bg-gradient-to-t from-red-700 to-red-500 shadow-md shadow-red-500/20' 
                        : 'bg-gradient-to-t from-[#B71C1C] to-red-400 shadow-md shadow-red-400/10'
                    }`}
                  />
                )}
              </div>

              {/* Label */}
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {bg}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default InventoryChart;
