'use client';

import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/01-shared/components/ui/select';

const generateTimeOptions = (interval) => {
  const options = [];
  for (let i = 0; i < 60; i += interval) {
    const value = i.toString().padStart(2, '0');
    options.push({ value, label: value });
  }
  return options;
};

const hourOptions = Array.from({ length: 24 }, (_, i) => {
  const value = i.toString().padStart(2, '0');
  return { value, label: value };
});

const minuteOptions = generateTimeOptions(1); // 1-minute intervals

export function TimePicker({ value, onChange, className }) {
  const [hour, minute] = value ? value.split(':') : ['', ''];

  const handleHourChange = (newHour) => {
    onChange(`${newHour}:${minute || '00'}`);
  };

  const handleMinuteChange = (newMinute) => {
    onChange(`${hour || '00'}:${newMinute}`);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Select value={hour} onValueChange={handleHourChange}>
        <SelectTrigger>
          <SelectValue placeholder="Hora" />
        </SelectTrigger>
        <SelectContent position="popper" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {hourOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={minute} onValueChange={handleMinuteChange}>
        <SelectTrigger>
          <SelectValue placeholder="Min" />
        </SelectTrigger>
        <SelectContent style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {minuteOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
