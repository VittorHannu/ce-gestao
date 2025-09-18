'use client';

import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/01-shared/components/ui/select';
import { Button } from '@/01-shared/components/ui/button';
import { X } from 'lucide-react';

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

export function TimePicker({ value, onChange, className, disabled }) {
  const [hour, minute] = value ? value.split(':') : ['', ''];

  const handleHourChange = (newHour) => {
    onChange(`${newHour || '00'}:${minute || '00'}`);
  };

  const handleMinuteChange = (newMinute) => {
    onChange(`${hour || '00'}:${newMinute || '00'}`);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <div className="flex-grow grid grid-cols-2 gap-2">
        <Select value={hour} onValueChange={handleHourChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Hora" />
          </SelectTrigger>
          <SelectContent position="popper" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {hourOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={minute} onValueChange={handleMinuteChange} disabled={disabled}>
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
      {value && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleClear}
          aria-label="Limpar hora"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
