import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDocumentationSectionsByPrefix } from '../services/documentationService';
import { FilePlus, UserCog, ShieldCheck, History, User, KeyRound, CheckCircle2, Database, Code, Server, Cloud } from 'lucide-react';

// --- Componentes de Tela para o Mockup ---
const mockScreenVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -20 }
};

const FormScreen = () => (
  <motion.div variants={mockScreenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full p-6">
    <div className="flex items-center text-green-400 mb-4">
      <FilePlus className="mr-2" />
      <h3 className="text-xl font-bold">Criação do Relato</h3>
    </div>
    <div className="space-y-3">
      <p className="text-sm text-gray-400">Tipo de Ocorrência</p>
      <div className="h-10 bg-gray-700/50 rounded-lg w-1/2"></div>
      <p className="text-sm text-gray-400 mt-2">Descrição</p>
      <div className="h-20 bg-gray-700/50 rounded-lg w-full"></div>
      <p className="text-sm text-gray-400 mt-2">Anexos</p>
      <div className="h-10 bg-gray-700/50 rounded-lg w-1/3"></div>
    </div>
  </motion.div>
);

const TriageScreen = () => (
  <motion.div variants={mockScreenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full p-6">
    <div className="flex items-center text-yellow-400 mb-4">
      <UserCog className="mr-2" />
      <h3 className="text-xl font-bold">Triagem e Atribuição</h3>
    </div>
    <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
      <p className="text-gray-400">Relato recebido e aguardando ação do gestor.</p>
      <div className="flex justify-center space-x-4 mt-4">
        <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-md">Aprovar</div>
        <div className="px-4 py-2 bg-red-500/20 text-red-400 rounded-md">Reprovar</div>
      </div>
    </div>
  </motion.div>
);

const ResolutionScreen = () => (
  <motion.div variants={mockScreenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full p-6">
    <div className="flex items-center text-blue-400 mb-4">
      <ShieldCheck className="mr-2" />
      <h3 className="text-xl font-bold">Resolução e Feedback</h3>
    </div>
    <div className="bg-gray-700/50 rounded-lg p-4">
      <p className="font-semibold">Status: <span className="text-blue-400">Resolvido</span></p>
      <p className="text-sm text-gray-300 mt-2">Plano de ação concluído. Notificação enviada ao criador do relato.</p>
    </div>
  </motion.div>
);

const AuditScreen = () => (
  <motion.div variants={mockScreenVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full p-6">
    <div className="flex items-center text-purple-400 mb-4">
      <History className="mr-2" />
      <h3 className="text-xl font-bold">Análise e Auditoria</h3>
    </div>
    <div className="space-y-2 text-sm text-gray-400">
      <p><span className="font-mono text-gray-500">[LOG]</span> Relato criado por Usuário A.</p>
      <p><span className="font-mono text-gray-500">[LOG]</span> Gestor B atribuiu para Usuário C.</p>
      <p><span className="font-mono text-gray-500">[LOG]</span> Status alterado para Resolvido.</p>
    </div>
  </motion.div>
);

const screens = {
  1: <FormScreen />,
  2: <TriageScreen />,
  3: <ResolutionScreen />,
  4: <AuditScreen />
};

// --- Conteúdo de cada seção ---

const ApresentacaoView = () => (
  <motion.div key="apresentacao" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
    <h2 className="text-4xl font-bold tracking-tight mb-4">Apresentação</h2>
    <div className="prose prose-lg max-w-none">
      <p>Este documento apresenta uma análise detalhada do <strong>SGI Copa</strong>, um sistema de gestão de segurança desenvolvido para modernizar e otimizar o registro e a análise de relatos de segurança.</p>
      <p>Nascido de uma iniciativa na unidade de Gurupi-TO para substituir processos manuais baseados em papel e planilhas, o SGI Copa propõe uma abordagem digital, centralizada e proativa para a segurança do trabalho.</p>
      <p>Navegue pelas abas ao lado para explorar as funcionalidades, a arquitetura e os conceitos que fundamentam o projeto.</p>
    </div>
  </motion.div>
);

const FluxoView = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [fluxoContent, setFluxoContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDocumentationSectionsByPrefix('fluxo_step_');
        // Sort data by section_key to ensure correct order (e.g., fluxo_step_1, fluxo_step_2)
        const sortedData = data.sort((a, b) => a.section_key.localeCompare(b.section_key));
        setFluxoContent(sortedData);
      } catch (err) {
        setError('Falha ao carregar conteúdo do fluxo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <motion.div key="fluxo" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <h2 className="text-4xl font-bold tracking-tight mb-4">O Ciclo de Vida de um Relato</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start mt-12">
        <div className="space-y-32"> {/* This div will now contain both text and embedded mock screens */}
          {fluxoContent.map((step, index) => (
            <motion.div
              key={step.section_key}
              onViewportEnter={() => setActiveStep(index + 1)} // Keep this to update activeStep for the mock screen
              className="prose prose-lg max-w-none prose-h3:font-bold prose-h3:text-2xl prose-p:text-gray-600"
            >
              <h3>{step.title}</h3>
              <p>{step.content}</p>
              {/* Embedded mock screen */}
              <div className="w-full h-[500px] bg-gray-100 rounded-2xl shadow-lg border border-gray-200 flex items-center justify-center overflow-hidden mt-8">
                {screens[index + 1]} {/* Render the corresponding mock screen */}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const AnaliseView = () => {
  const [pyramidLevels, setPyramidLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDocumentationSectionsByPrefix('pyramid_level_');
        // Sort data by section_key to ensure correct order (e.g., pyramid_level_1, pyramid_level_2)
        const sortedData = data.sort((a, b) => a.section_key.localeCompare(b.section_key));
        setPyramidLevels(sortedData);
      } catch (err) {
        setError('Falha ao carregar dados da pirâmide.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  // Calculate max value for bar width, excluding 0 values from calculation
  const maxPyramidValue = Math.max(...pyramidLevels.map(level => level.meta?.value || 0));

  return (
    <motion.div key="analise" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <h2 className="text-4xl font-bold tracking-tight mb-4">Análise de Dados</h2>
      <div className="prose prose-lg max-w-none mb-12">
        <p>A principal inovação do SGI Copa é a capacidade de transformar dados brutos em inteligência acionável. A classificação de cada relato alimenta a Pirâmide de Bird, uma ferramenta visual poderosa para a gestão de riscos.</p>
      </div>
      
      <h3 className="text-2xl font-bold mb-6">Pirâmide de Bird Interativa</h3>
      <div className="space-y-2 max-w-2xl mx-auto">
        {pyramidLevels.map((level, index) => {
          const levelValue = level.meta?.value || 0;
          const barWidth = maxPyramidValue > 0 ? (levelValue / maxPyramidValue) * 100 : 0;
          const backgroundColor = level.meta?.color || 'bg-gray-400';

          return (
            <motion.div
              key={level.section_key}
              className="w-full p-4 rounded-lg border-2 border-gray-200 bg-white shadow-sm group hover:border-blue-500 hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-bold text-gray-800 group-hover:text-blue-600">{level.title}</h4>
                <span className="text-gray-500 font-semibold">{levelValue}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className={`h-2.5 rounded-full ${backgroundColor}`} style={{ width: `${barWidth}%` }}></div>
              </div>
              <p className="text-gray-600 mt-2 text-sm">{level.content}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

const ControleView = () => (
  <motion.div key="controle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
    <h2 className="text-4xl font-bold tracking-tight mb-4">Controle de Acesso</h2>
    <div className="prose prose-lg max-w-none">
      <p>O sistema foi desenhado com perfis de acesso claros e trilha de auditoria completa, garantindo segurança e governança.</p>
      <h3 className="text-2xl font-bold mt-8 mb-4">Perfis de Acesso</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-gray-100 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-3">
            <KeyRound className="mr-2 text-blue-600" />
            <h4 className="text-xl font-bold">Administrador</h4>
          </div>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center"><CheckCircle2 size={16} className="mr-2 text-green-500"/> Gestão de Usuários</li>
            <li className="flex items-center"><CheckCircle2 size={16} className="mr-2 text-green-500"/> Gestão de Relatos</li>
            <li className="flex items-center"><CheckCircle2 size={16} className="mr-2 text-green-500"/> Visualização de Dashboards</li>
          </ul>
        </div>
        <div className="p-6 bg-gray-100 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-3">
            <UserCog className="mr-2 text-yellow-600" />
            <h4 className="text-xl font-bold">Gestor</h4>
          </div>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center"><CheckCircle2 size={16} className="mr-2 text-green-500"/> Aprovação de Relatos</li>
            <li className="flex items-center"><CheckCircle2 size={16} className="mr-2 text-green-500"/> Atribuição de Relatos</li>
            <li className="flex items-center"><CheckCircle2 size={16} className="mr-2 text-green-500"/> Visualização de Dashboards</li>
          </ul>
        </div>
        <div className="p-6 bg-gray-100 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-3">
            <User className="mr-2 text-gray-600" />
            <h4 className="text-xl font-bold">Usuário</h4>
          </div>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center"><CheckCircle2 size={16} className="mr-2 text-green-500"/> Criação de Relatos</li>
            <li className="flex items-center"><CheckCircle2 size={16} className="mr-2 text-green-500"/> Acompanhamento de Relatos</li>
          </ul>
        </div>
      </div>

      <h3 className="text-2xl font-bold mt-12 mb-4">Trilha de Auditoria</h3>
      <div className="prose prose-lg max-w-none">
        <p>Cada ação importante dentro do SGI Copa é registrada em um log imutável, garantindo total rastreabilidade e transparência para o processo de gestão de segurança.</p>
        <div className="w-full p-4 bg-gray-100 rounded-lg font-mono text-sm text-gray-700 space-y-2">
          <p>&gt; [LOG] Relato #1024 criado por <span className="text-blue-600">Carlos.Silva</span> em 2025-08-24 10:30:00</p>
          <p>&gt; [LOG] Status alterado para <span className="text-yellow-600">Pendente</span> por <span className="text-blue-600">Sistema</span> em 2025-08-24 10:30:05</p>
          <p>&gt; [LOG] Gestor <span className="text-blue-600">Mariana.Almeida</span> atribuiu para <span className="text-blue-600">Julio.Cesar</span> em 2025-08-24 11:00:00</p>
          <p>&gt; [LOG] Status alterado para <span className="text-green-600">Resolvido</span> por <span className="text-blue-600">Julio.Cesar</span> em 2025-08-24 14:15:00</p>
        </div>
      </div>
    </div>
  </motion.div>
);

const ArquiteturaView = () => (
  <motion.div key="arquitetura" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
    <h2 className="text-4xl font-bold tracking-tight mb-4">Arquitetura do SGI Copa</h2>
    <div className="prose prose-lg max-w-none">
      <p>O SGI Copa foi construído com uma arquitetura moderna e escalável, utilizando tecnologias amplamente adotadas no mercado para garantir performance, segurança e facilidade de manutenção.</p>

      <h3 className="text-2xl font-bold mt-8 mb-4 flex items-center"><Code className="mr-2 text-blue-500" /> Frontend (Interface do Usuário)</h3>
      <p>A interface do usuário é desenvolvida com:</p>
      <ul className="list-disc list-inside ml-4">
        <li><strong>React:</strong> Biblioteca JavaScript para construção de interfaces de usuário interativas e reativas.</li>
        <li><strong>Vite:</strong> Ferramenta de build rápida para desenvolvimento frontend, otimizando o tempo de recarregamento.</li>
        <li><strong>Tailwind CSS:</strong> Framework CSS utilitário para estilização rápida e responsiva, garantindo um design moderno e consistente.</li>
        <li><strong>Radix UI:</strong> Biblioteca de componentes UI sem estilo, fornecendo primitivas acessíveis para a construção de componentes robustos.</li>
        <li><strong>TanStack Query:</strong> Gerenciamento de estado assíncrono para requisições de dados, otimizando o cache e a sincronização com o backend.</li>
        <li><strong>Recharts:</strong> Biblioteca de gráficos para visualização de dados, utilizada nos dashboards de análise.</li>
      </ul>

      <h3 className="text-2xl font-bold mt-8 mb-4 flex items-center"><Database className="mr-2 text-green-600" /> Backend e Banco de Dados (Supabase)</h3>
      <p>O backend e o banco de dados são gerenciados pelo <strong>Supabase</strong>, uma plataforma open-source que oferece funcionalidades de backend como serviço:</p>
      <ul className="list-disc list-inside ml-4">
        <li><strong>PostgreSQL:</strong> Banco de dados relacional robusto e confiável para armazenamento de todos os dados do sistema.</li>
        <li><strong>Supabase Auth:</strong> Sistema de autenticação e autorização de usuários, incluindo gestão de perfis e controle de acesso baseado em roles.</li>
        <li><strong>Supabase Storage:</strong> Armazenamento de arquivos (ex: anexos de relatos) de forma segura e escalável.</li>
        <li><strong>Supabase Edge Functions:</strong> Funções serverless (Deno) para lógica de negócio customizada e integração com serviços externos (ex: envio de notificações push).</li>
        <li><strong>Realtime:</strong> Funcionalidades de tempo real para atualizações instantâneas na interface do usuário.</li>
      </ul>

      <h3 className="text-2xl font-bold mt-8 mb-4 flex items-center"><Cloud className="mr-2 text-purple-500" /> Implantação e Infraestrutura</h3>
      <p>A aplicação é implantada e gerenciada com as seguintes ferramentas:</p>
      <ul className="list-disc list-inside ml-4">
        <li><strong>Vercel:</strong> Plataforma para deploy contínuo do frontend, garantindo alta disponibilidade e performance.</li>
        <li><strong>Supabase Cloud:</strong> Hospedagem e gerenciamento do backend e banco de dados, com escalabilidade automática.</li>
        <li><strong>PNPM:</strong> Gerenciador de pacotes rápido e eficiente, utilizado para gerenciar as dependências do projeto.</li>
        <li><strong>Git:</strong> Sistema de controle de versão para colaboração e rastreamento de alterações no código.</li>
      </ul>

      <h3 className="text-2xl font-bold mt-8 mb-4 flex items-center"><Server className="mr-2 text-orange-500" /> Fluxo de Dados Simplificado</h3>
      <p>O fluxo de dados no SGI Copa segue um padrão claro:</p>
      <ol className="list-decimal list-inside ml-4">
        <li>O <strong>Frontend (React)</strong> interage diretamente com o <strong>Supabase</strong> através de sua API.</li>
        <li>As requisições de dados (leitura, escrita, atualização) são feitas usando <strong>TanStack Query</strong>, que otimiza o desempenho e a experiência do usuário.</li>
        <li>O <strong>Supabase</strong>, por sua vez, gerencia o <strong>PostgreSQL</strong>, a autenticação, o armazenamento e executa as <strong>Edge Functions</strong> quando necessário.</li>
        <li>Notificações push são enviadas através de <strong>Edge Functions</strong>, garantindo que os usuários recebam alertas importantes.</li>
      </ol>
      <p>Esta arquitetura desacoplada permite que cada parte do sistema seja desenvolvida, testada e implantada de forma independente, resultando em um sistema robusto e de fácil manutenção.</p>
    </div>
  </motion.div>
);

const views = {
  apresentacao: <ApresentacaoView />,
  fluxo: <FluxoView />,
  analise: <AnaliseView />,
  controle: <ControleView />,
  arquitetura: <ArquiteturaView />
};

const ApresentacaoPage = () => {
  const [activeView, setActiveView] = useState('apresentacao');

  const NavLink = ({ view, children }) => (
    <button 
      onClick={() => setActiveView(view)}
      className={`w-full text-left px-4 py-2 rounded-md text-lg transition-colors duration-200 ${
        activeView === view ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-600 hover:bg-gray-100'
      }`}>
      {children}
    </button>
  );

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen font-sans flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-7xl h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex">
        {/* Sidebar */}
        <aside className="w-1/4 max-w-xs p-6 border-r border-gray-200 flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight mb-2">SGI Copa</h1>
          <p className="text-sm text-gray-500 mb-8">Documentação do Projeto</p>
          <nav className="space-y-2">
            <NavLink view="apresentacao">Apresentação</NavLink>
            <NavLink view="fluxo">Fluxo do Relato</NavLink>
            <NavLink view="analise">Análise de Dados</NavLink>
            <NavLink view="controle">Controle de Acesso</NavLink>
            <NavLink view="arquitetura">Arquitetura</NavLink>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            {views[activeView]}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default ApresentacaoPage;
