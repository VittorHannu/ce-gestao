import React, { useState, useRef, useEffect } from 'react';
import { TableCell, TableRow } from '@/01-shared/components/ui/table';
import { Textarea } from '@/01-shared/components/ui/textarea';
import useAutosizeTextArea from '@/01-shared/hooks/useAutosizeTextArea';

export default function EditableField({ label, fieldKey, value, onFieldChange, isDirty, originalValue }) {
  const [isEditing, setIsEditing] = useState(false);
  const textAreaRef = useRef(null);
  useAutosizeTextArea(textAreaRef.current, value);

  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      const textarea = textAreaRef.current;
      const length = textarea.value.length;
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(length, length);
      }, 0);
    }
  }, [isEditing]);

  const isFieldDirty = isDirty && (value !== (originalValue || ''));

  return (
    <TableRow>
      <TableCell className="whitespace-normal">
        <div className={`transition-colors rounded-md ${(isEditing || isFieldDirty) ? 'p-2 bg-yellow-50' : ''}`}>
          <p className="font-bold">{label}</p>
          {isEditing ? (
            <Textarea
              ref={textAreaRef}
              value={value}
              onChange={(e) => onFieldChange(fieldKey, e.target.value)}
              onBlur={() => setIsEditing(false)}
              autoFocus
              variant="unstyled"
              className="w-full bg-transparent focus:outline-none"
            />
          ) : (
            <div className="break-words cursor-pointer min-h-[24px]" onClick={() => setIsEditing(true)}>
              {value || <span className="text-gray-500 italic">Adicionar...</span>}
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
