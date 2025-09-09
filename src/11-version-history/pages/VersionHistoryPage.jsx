import React from 'react';
import ReactMarkdown from 'react-markdown';
import MainLayout from '@/01-shared/components/MainLayout';
import BackButton from '@/01-shared/components/BackButton';
import changelogContent from '../../../CHANGELOG.md?raw';

// Basic styling for the markdown content.
// Using a wrapper div with a 'prose' like class for styling.
const proseClassName = `
  prose dark:prose-invert 
  max-w-none
  prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4
  prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-3
  prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-4 prose-h3:mb-2
  prose-ul:list-disc prose-ul:ml-6 prose-ul:space-y-1
  prose-li:text-gray-700 dark:prose-li:text-gray-300
  prose-p:text-gray-600 dark:prose-p:text-gray-400
  prose-strong:font-semibold
`;

function VersionHistoryPage() {
  return (
    <MainLayout
      header={(
        <div className="flex items-center">
          <BackButton />
          <h1 className="text-2xl font-bold ml-4">Histórico de Versões</h1>
        </div>
      )}
    >
      <div className="p-4 sm:p-6">
        <div className={proseClassName}>
          <ReactMarkdown>{changelogContent}</ReactMarkdown>
        </div>
      </div>
    </MainLayout>
  );
}

export default VersionHistoryPage;