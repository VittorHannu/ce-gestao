import React from 'react';
import { Link } from 'react-router-dom';

const RelatoStatsCard = ({ label, count, icon: Icon, path, textColorClass, bgColorClass, totalRelatos, showPercentage = true }) => {
  let percentage = totalRelatos > 0 ? (count / totalRelatos) * 100 : 0;
  // Garante que a porcentagem seja pelo menos 1% se houver contagem, para visibilidade da barra
  const displayPercentage = (count > 0 && percentage < 1) ? 1 : Math.round(percentage);

  return (
    <Link to={path} className="block">
      <div className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-xl transition-shadow duration-300 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
            <p className={`text-xl font-bold ${textColorClass} flex items-center gap-2`}>
              <Icon className="w-5 h-5" /> {count}
            </p>
          </div>
        </div>

        {showPercentage && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${bgColorClass}`}
                style={{ width: `${displayPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {displayPercentage}% do total
            </p>
          </div>
        )}
      </div>
    </Link>
  );
};

export default RelatoStatsCard;
