
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MainLayout from '@/01-shared/components/MainLayout';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import usePageTitle from '@/01-shared/hooks/usePageTitle';
import BackButton from '@/01-shared/components/BackButton';
import changelogPath from '/CHANGELOG.md?url';

const VersionHistoryPage = () => {
  usePageTitle('O que há de novo?');
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(changelogPath)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Changelog not found');
        }
        return response.text();
      })
      .then((text) => {
        setMarkdown(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch changelog:', err);
        setMarkdown('Não foi possível carregar o histórico de versões.');
        setLoading(false);
      });
  }, []);

  return (
    <MainLayout
      header={(
        <div className="flex items-center">
          <BackButton />
          <h1 className="text-2xl font-bold ml-4">O que há de novo?</h1>
        </div>
      )}
    >
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none text-red-500">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default VersionHistoryPage;
