import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import Workflows from './pages/Workflows';
import Tasks from './pages/Tasks';
import Landing from './pages/Landing';

type Page = 'dashboard' | 'agents' | 'workflows' | 'tasks';

function App() {
  const [showApp, setShowApp] = useState(false);
  const [current, setCurrent] = useState<Page>('dashboard');

  if (!showApp) {
    return <Landing onEnter={() => setShowApp(true)} />;
  }

  const pages: Record<Page, React.ReactNode> = {
    dashboard: <Dashboard />,
    agents: <Agents />,
    workflows: <Workflows />,
    tasks: <Tasks />,
  };

  return (
    <div className="flex h-screen bg-[#080c18] overflow-hidden">
      <Sidebar current={current} onChange={setCurrent} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header page={current} />
        <main className="flex-1 overflow-y-auto">
          {pages[current]}
        </main>
      </div>
    </div>
  );
}

export default App;
