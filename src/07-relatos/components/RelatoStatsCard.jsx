import React from 'react';
import { Link } from 'react-router-dom';

const RelatoStatsCard = ({ label, count, icon: Icon, path, iconTextColor, iconBgColor, progressBarColor, totalRelatos }) => {
  const percentage = totalRelatos > 0 ? (count / totalRelatos) * 100 : 0;
  const displayPercentage = Math.round(percentage);

  return (
    <Link to={path} className="block h-full">
      <div className="bg-white rounded-xl shadow-sm p-4 h-full flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
        
        <div className="flex justify-between items-center mb-2">
          <div className={`p-2 rounded-lg ${iconBgColor}`}>
            <Icon className={`w-6 h-6 ${iconTextColor}`} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{count}</p>
        </div>

        <div className="mt-auto">
          <p className="text-base font-semibold text-gray-600">{label}</p>
          
          {percentage > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="w-full bg-gray-200 rounded-full h-4 relative flex items-center overflow-hidden">
                <div
                  className={`h-4 rounded-full ${progressBarColor} flex items-center justify-end pr-1`}
                  style={{ width: `${displayPercentage}%` }}
                >
                  {displayPercentage >= 25 && (
                    <span className="text-xs font-bold text-white">{displayPercentage}%</span>
                  )}
                </div>
                {displayPercentage < 25 && (
                  <span className="ml-1 text-xs font-medium text-gray-600">
                    {displayPercentage}%
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default RelatoStatsCard;