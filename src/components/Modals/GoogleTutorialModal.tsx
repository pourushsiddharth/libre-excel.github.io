import React, { useState, useEffect, useRef } from 'react';
import { useSpreadsheetStore } from '../../store/useSpreadsheetStore';
import confetti from 'canvas-confetti';

interface TutorialStep {
  targetId: string;
  title: string;
  badge: string;
  description: string;
  shortcut?: string;
  arrowPosition: 'top' | 'bottom' | 'left' | 'right';
  cardPlacement: 'top' | 'bottom' | 'left' | 'right';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    targetId: 'tutorial-target-title',
    title: 'Spreadsheet Title & Cloud Autosave',
    badge: 'Step 1 of 6',
    description: 'Click directly on the document name to rename your spreadsheet in Vedval Excel. All edits are automatically saved to your workspace in real time.',
    shortcut: 'Click to rename',
    arrowPosition: 'top',
    cardPlacement: 'bottom'
  },
  {
    targetId: 'tutorial-target-menubar',
    targetFallbackId: 'tutorial-target-menubar',
    title: 'Vedval Excel Menus',
    badge: 'Step 2 of 6',
    description: 'Access complete File, Edit, View, Insert, Format, Data, Tools, and Help menus with seamless hover switching and spreadsheet operations.',
    arrowPosition: 'top',
    cardPlacement: 'bottom'
  } as any,
  {
    targetId: 'tutorial-target-ribbon',
    title: 'Formatting Ribbon & Type Scales',
    badge: 'Step 3 of 6',
    description: 'Format values as Currency ($), Percent (%), or customize fonts, cell backgrounds, borders, alignments, and text wrap with one click.',
    shortcut: 'Ctrl+B / Ctrl+I / Ctrl+U',
    arrowPosition: 'top',
    cardPlacement: 'bottom'
  },
  {
    targetId: 'tutorial-target-formulabar',
    title: 'Formula Engine & Autocomplete',
    badge: 'Step 4 of 6',
    description: 'Type = in the formula bar to unlock 120+ Excel functions (SUM, AVERAGE, IF, VLOOKUP, COUNT, etc.) with live suggestions.',
    shortcut: 'Type = to compute',
    arrowPosition: 'top',
    cardPlacement: 'bottom'
  },
  {
    targetId: 'tutorial-target-grid',
    title: 'Cell Grid & Copy with Drag Handle',
    badge: 'Step 5 of 6',
    description: 'Click any cell to edit. Drag the blue dot on the bottom-right of the selection to auto-increment numbers, repeat sequences, or adjust formula references.',
    shortcut: 'Drag corner blue dot',
    arrowPosition: 'left',
    cardPlacement: 'right'
  },
  {
    targetId: 'tutorial-target-share',
    title: 'Share & Real-Time Collaboration',
    badge: 'Step 6 of 6',
    description: 'Generate secure View-only or Edit sharing links to collaborate with teammates, clients, or export directly to Microsoft Excel (.xlsx) / CSV.',
    arrowPosition: 'top',
    cardPlacement: 'bottom'
  }
];

export const GoogleTutorialModal: React.FC = () => {
  const { isTutorialOpen, setIsTutorialOpen } = useSpreadsheetStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const step = TUTORIAL_STEPS[currentStepIndex];

  // Recalculate target element position whenever step or window changes
  useEffect(() => {
    if (!isTutorialOpen) return;

    const updateRect = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        // Fallback default center position
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    const timer = setTimeout(updateRect, 60);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
      clearTimeout(timer);
    };
  }, [isTutorialOpen, currentStepIndex, step.targetId]);

  if (!isTutorialOpen) return null;

  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.25 } });
      setIsTutorialOpen(false);
      setCurrentStepIndex(0);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // Compute Popover Position dynamically relative to target element
  let cardTop = 120;
  let cardLeft = 100;
  let arrowStyle: React.CSSProperties = {};

  if (targetRect) {
    const cardWidth = 340;
    const cardHeight = 180;
    const padding = 14;

    if (step.cardPlacement === 'bottom') {
      cardTop = targetRect.bottom + padding;
      cardLeft = Math.max(16, Math.min(window.innerWidth - cardWidth - 20, targetRect.left + (targetRect.width / 2) - 80));
      // Arrow pointing up to the target
      arrowStyle = {
        top: -7,
        left: Math.max(24, Math.min(cardWidth - 24, targetRect.left + (targetRect.width / 2) - cardLeft - 7)),
        borderLeft: '7px solid transparent',
        borderRight: '7px solid transparent',
        borderBottom: '7px solid #ffffff'
      };
    } else if (step.cardPlacement === 'right') {
      cardTop = Math.max(80, Math.min(window.innerHeight - cardHeight - 30, targetRect.top + 60));
      cardLeft = Math.min(window.innerWidth - cardWidth - 30, targetRect.left + 160);
      arrowStyle = {
        left: -7,
        top: 24,
        borderTop: '7px solid transparent',
        borderBottom: '7px solid transparent',
        borderRight: '7px solid #ffffff'
      };
    } else {
      cardTop = targetRect.bottom + padding;
      cardLeft = Math.max(16, targetRect.left);
    }
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] select-none font-sans overflow-hidden pointer-events-auto"
      onClick={() => setIsTutorialOpen(false)}
    >
      {/* Target Focus Cutout / Pulsing Beacon */}
      {targetRect && (
        <>
          {/* Animated Glow Border surrounding the active highlighted feature */}
          <div 
            className="fixed pointer-events-none transition-all duration-300 rounded-lg ring-4 ring-[#0b57d0]/40 border-2 border-[#0b57d0] z-[10000] shadow-[0_0_24px_rgba(11,87,208,0.45)] animate-pulse"
            style={{
              top: Math.max(0, targetRect.top - 3),
              left: Math.max(0, targetRect.left - 3),
              width: targetRect.width + 6,
              height: targetRect.height + 6,
            }}
          />

          {/* Pointing SVG Curved/Wavy Directional Arrow Indicator */}
          <div 
            className="fixed pointer-events-none z-[10001] transition-all duration-300 flex items-center justify-center"
            style={{
              top: step.cardPlacement === 'bottom' ? targetRect.bottom + 1 : targetRect.top + 45,
              left: step.cardPlacement === 'bottom' 
                ? Math.max(20, targetRect.left + (targetRect.width / 2) - 16) 
                : targetRect.left + 120,
            }}
          >
            {step.cardPlacement === 'bottom' ? (
              <svg width="34" height="28" viewBox="0 0 34 28" fill="none" className="text-[#0b57d0] filter drop-shadow">
                {/* Curved Arrow pointer */}
                <path d="M17 28L7 12H27L17 28Z" fill="#0b57d0" />
                <path d="M17 12V2" stroke="#0b57d0" strokeWidth="3" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none" className="text-[#0b57d0] filter drop-shadow">
                <path d="M34 17L18 7V27L34 17Z" fill="#0b57d0" />
                <path d="M18 17H2" stroke="#0b57d0" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
          </div>
        </>
      )}

      {/* Floating Tutorial Popover Card */}
      <div 
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className="fixed z-[10002] w-[340px] bg-white rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.18)] border border-slate-100 p-4.5 transition-all duration-200 text-xs"
        style={{
          top: cardTop,
          left: cardLeft
        }}
      >
        {/* Triangle Arrow Pinned to Card */}
        <div 
          className="absolute w-0 h-0 filter drop-shadow-xs"
          style={arrowStyle}
        />

        {/* Card Header */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-blue-50 text-[#0b57d0] uppercase">
              {step.badge}
            </span>
            {step.shortcut && (
              <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60 font-mono">
                {step.shortcut}
              </span>
            )}
          </div>

          <button 
            onClick={() => setIsTutorialOpen(false)}
            className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Close Tutorial"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Card Content */}
        <div className="space-y-2 mt-1">
          <h4 className="font-semibold text-slate-900 text-[14px] leading-tight">
            {step.title}
          </h4>
          <p className="text-slate-600 text-xs leading-relaxed font-normal">
            {step.description}
          </p>
        </div>

        {/* Card Footer with Progress Dots & Step Controls */}
        <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
          {/* Step Indicators */}
          <div className="flex items-center gap-1.5">
            {TUTORIAL_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex 
                    ? 'w-5 bg-[#0b57d0]' 
                    : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                }`}
                title={`Step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-medium text-xs transition cursor-pointer"
              >
                Back
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-3.5 py-1.5 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full font-medium text-xs shadow-2xs transition transform active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <span>{isLast ? 'Done' : 'Next'}</span>
              <span className="material-symbols-outlined text-[14px]">
                {isLast ? 'check' : 'arrow_forward'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
