import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { BottomNav } from './BottomNav';
import { LoadingBar } from '../LoadingBar';
import { CreateIssueModal } from '../CreateIssueModal';
import { KeyboardShortcutsModal } from '../KeyboardShortcutsModal';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [createIssueOpen, setCreateIssueOpen] = useState(false);

  const handleShowHelp = useCallback(() => {
    setShortcutsOpen(true);
  }, []);

  const handleCreateIssue = useCallback(() => {
    setCreateIssueOpen(true);
  }, []);

  useKeyboardShortcuts({ onShowHelp: handleShowHelp, onCreateIssue: handleCreateIssue });

  return (
    <div className="flex min-h-screen">
      <LoadingBar />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <BottomNav />
      <CreateIssueModal open={createIssueOpen} onClose={() => setCreateIssueOpen(false)} />
      <KeyboardShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}
