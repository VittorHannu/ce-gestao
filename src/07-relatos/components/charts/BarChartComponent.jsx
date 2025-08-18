import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Removed Legend

const BarChartComponent = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 0, // Reduced left margin
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} /> {/* Removed vertical lines for cleaner look */}
        <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={60} /> {/* Rotated labels */}
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent;