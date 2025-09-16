import React from 'react';
import { TableRow, TableCell } from '@/01-shared/components/ui/table';
import { cn } from '@/lib/utils';

const ClickableTableRow = ({ label, value, onClick, isEditable = true }) => {
  const canClick = onClick && isEditable;

  return (
    <TableRow
      onClick={canClick ? onClick : undefined}
      className={cn(
        canClick ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
      )}
    >
      <TableCell className="whitespace-normal">
        <div>
          <p className="font-bold text-sm text-gray-600">{label}</p>
          <div className="break-words mt-1">
            {value === null || value === undefined || value === '' ? (
              <span className="text-gray-400 italic">Não informado</span>
            ) : (
              <span className="text-gray-900">{String(value)}</span>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ClickableTableRow;
