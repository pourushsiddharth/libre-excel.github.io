import React from 'react';
import { TopBar } from './components/TopBar/TopBar';
import { MenuBar } from './components/MenuBar/MenuBar';
import { Ribbon } from './components/Ribbon/Ribbon';
import { FormulaBar } from './components/FormulaBar/FormulaBar';
import { SpreadsheetGrid } from './components/Grid/SpreadsheetGrid';
import { SheetTabs } from './components/SheetTabs/SheetTabs';
import { ChartModal } from './components/Charts/ChartModal';
import { TemplatesModal } from './components/Templates/TemplatesModal';
import { FindReplaceModal } from './components/Modals/FindReplaceModal';
import { ShortcutsModal } from './components/Modals/ShortcutsModal';
import { ShareModal } from './components/Modals/ShareModal';
import { HelpModal } from './components/Modals/HelpModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { GoogleTutorialModal } from './components/Modals/GoogleTutorialModal';
import { useSpreadsheetStore } from './store/useSpreadsheetStore';

export const App: React.FC = () => {
  const { theme, permissionMode, setPermissionMode, isLockedView, isFeedbackModalOpen, setIsFeedbackModalOpen } = useSpreadsheetStore();
  return (
    <div
      className={
        'h-screen w-screen flex flex-col overflow-hidden select-none font-sans ' +
        (theme === 'dark' ? 'bg-zinc-950 text-gray-100' : 'bg-white text-gray-800')
      }
    >
      {/* View-Only Alert Banner */}
      {permissionMode === 'view' && (
        <div className="bg-amber-500 text-amber-950 px-4 py-1.5 flex items-center justify-between text-xs font-medium border-b border-amber-600/30 z-50 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px] text-amber-900">
              {isLockedView ? 'lock' : 'visibility'}
            </span>
            <span>
              <strong>View-only mode:</strong> {isLockedView 
                ? 'You have view-only access to this document. Editing and modifications are locked.'
                : 'You can inspect cells, view formulas, and select ranges, but editing is disabled.'}
            </span>
          </div>
          {!isLockedView ? (
            <button 
              onClick={() => setPermissionMode('edit')}
              className="px-2.5 py-0.5 bg-amber-900/10 hover:bg-amber-900/20 text-amber-950 rounded font-semibold text-[11px] transition cursor-pointer border border-amber-900/20"
            >
              Switch to Edit Mode
            </button>
          ) : (
            <span className="px-2 py-0.5 bg-amber-900/10 text-amber-950 rounded font-semibold text-[11px] border border-amber-900/20 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">lock</span>
              Protected
            </span>
          )}
        </div>
      )}

      {/* Top Application Bar (App Launcher, Doc Title, Quick Search Alt+Q, Share, User Profile) */}
      <TopBar />

      {/* Modern Menu Bar (File, Home, Insert, Formulas, Data, View, etc.) */}
      <MenuBar />

      {/* Modern Tabbed Ribbon Toolbar (Excel 365 style with green accents) */}
      <Ribbon />

      {/* Interactive Formula Bar with Autocomplete & fx helper */}
      <FormulaBar />

      {/* Main Core Spreadsheet Grid Area */}
      <SpreadsheetGrid />

      {/* Bottom Sheet Tabs Management & Live Status Bar */}
      <SheetTabs />

      {/* Interactive Chart Generator Modal */}
      <ChartModal />

      {/* Professional Templates Modal */}
      <TemplatesModal />

      {/* Find and Replace Modal */}
      <FindReplaceModal />

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <ShortcutsModal />

      {/* Share & Collaboration Modal */}
      <ShareModal />

      {/* Help, Guide, & Formula Documentation Modal */}
      <HelpModal />

      {/* Spreadsheet Settings & Shortcuts Modal */}
      <SettingsModal />

      {/* Google-Style Interactive Walkthrough & Tutorial Modal */}
      <GoogleTutorialModal />
    </div>
  );
};

export default App;

