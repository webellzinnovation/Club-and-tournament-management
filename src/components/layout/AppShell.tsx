import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ContextPanel } from './ContextPanel';
import { Menu, X, Calendar } from 'lucide-react';

interface AppShellProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenSearch: () => void;
  onOpenClaimModal: () => void;
  onOpenWizard: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  onOpenClaimModal,
  onOpenWizard,
  children
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileContextOpen, setMobileContextOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EDF0F3] p-2 sm:p-4 lg:p-6 flex flex-col justify-center text-slate-900 font-sans antialiased">
      {/* Outer rounded master card inspired by the reference design */}
      <div className="w-full max-w-[1680px] mx-auto bg-white rounded-[28px] sm:rounded-[32px] border border-slate-200/80 shadow-2xl shadow-slate-300/40 flex overflow-hidden min-h-[calc(100vh-2rem)] sm:min-h-[calc(100vh-3rem)]">
        
        {/* 1. Desktop Sidebar */}
        <div className="hidden md:flex shrink-0">
          <Sidebar
            currentView={currentView}
            onNavigate={(view) => {
              onNavigate(view);
              setMobileSidebarOpen(false);
            }}
            onOpenWizard={onOpenWizard}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl z-10">
              <div className="p-4 flex items-center justify-between border-b border-slate-100">
                <span className="text-sm font-bold text-slate-800">SportOS Navigation</span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar
                currentView={currentView}
                onNavigate={(view) => {
                  onNavigate(view);
                  setMobileSidebarOpen(false);
                }}
                onOpenWizard={onOpenWizard}
              />
            </div>
          </div>
        )}

        {/* 2. Center Column: Header + Main Workspace */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FBFDFE]">
          {/* Mobile Bar for toggles */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-extrabold text-slate-900 text-sm">SportOS</span>
            <button
              onClick={() => setMobileContextOpen(!mobileContextOpen)}
              className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100"
            >
              <Calendar className="w-5 h-5" />
            </button>
          </div>

          {/* Top Header */}
          <Header
            onOpenSearch={onOpenSearch}
            onOpenClaimModal={onOpenClaimModal}
            onNavigate={onNavigate}
            currentView={currentView}
          />

          {/* Main Scrollable Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>

        {/* 3. Right Contextual Panel (Profile, Mini Calendar, Agenda) */}
        <div className="hidden xl:flex shrink-0">
          <ContextPanel onNavigate={onNavigate} onOpenProfile={onOpenClaimModal} />
        </div>

        {/* Mobile Context Panel Modal if opened */}
        {mobileContextOpen && (
          <div className="fixed inset-0 z-50 flex justify-end xl:hidden">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setMobileContextOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-sm w-full bg-white shadow-xl z-10">
              <div className="p-4 flex items-center justify-between border-b border-slate-100">
                <span className="text-sm font-bold text-slate-800">Schedule & Profile</span>
                <button
                  onClick={() => setMobileContextOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ContextPanel onNavigate={onNavigate} onOpenProfile={onOpenClaimModal} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
