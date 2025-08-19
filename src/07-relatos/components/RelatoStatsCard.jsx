import React from 'react';
import { Link } from 'react-router-dom';

const RelatoStatsCard = ({ label, count, icon: Icon, path, iconTextColor, iconBgColor, progressBarColor, totalRelatos }) => {
  const percentage = totalRelatos > 0 ? (count / totalRelatos) * 100 : 0;
  const displayPercentage = Math.round(percentage);

  return (
    <Link to={path} className="block h-full">
      <div className="bg-white rounded-xl shadow-sm p-4 h-full flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
        
        <div className="flex justify-between items-center">
          <div className={`p-2 rounded-lg ${iconBgColor}`}>
            <Icon className={`w-6 h-6 ${iconTextColor}`} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{count}</p>
        </div>

        <div className="mt-auto">
          <p className="text-base font-semibold text-gray-600">{label}</p>
          
          {percentage > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${progressBarColor}`}
                  style={{ width: `${displayPercentage}%` }}
                ></div>
              </div>
              <p className="text-sm font-medium text-gray-600 w-12 text-right">{displayPercentage}%</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default RelatoStatsCard;