import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Compass,
  Flame,
  Globe,
  Package,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  ADVANCED_DEMO_LAYOUT,
  BASIC_DEMO_LAYOUT,
} from './data/survivalData';
import {
  DifficultyMode,
  PlacedItem,
  TinModifications,
} from './types/survival';
import { TinWorkbench } from './components/TinWorkbench';
import { ScenarioChallenge } from './components/ScenarioChallenge';
import { GlobalPreparednessView } from './components/GlobalPreparednessView';
import { EncyclopediaAndPrint } from './components/EncyclopediaAndPrint';
import { playTinSnap } from './utils/soundEffects';

type ActiveTab = 'workbench' | 'scenarios' | 'global' | 'print';

const DEFAULT_MODS: TinModifications = {
  polishedMirrorLid: false,
  morseCodeBottom: false,
  waterproofTapeRim: false,
  cottonPadding: false,
  positionMapTop: false,
  nameCardFilled: false,
  ownerName: '',
  troopName: '',
  emergencyPhone: '',
  medicalNote: '',
};

export function App() {
  const [mode, setMode] = useState<DifficultyMode>('advanced');
  const [activeTab, setActiveTab] = useState<ActiveTab>('workbench');
  const [muted, setMuted] = useState<boolean>(false);

  const [basicPlaced, setBasicPlaced] = useState<PlacedItem[]>(() => {
    try {
      const saved = localStorage.getItem('scout_tin_basic_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [advancedPlaced, setAdvancedPlaced] = useState<PlacedItem[]>(() => {
    try {
      const saved = localStorage.getItem('scout_tin_advanced_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tinMods, setTinMods] = useState<TinModifications>(() => {
    try {
      const saved = localStorage.getItem('scout_tin_mods_v1');
      return saved ? { ...DEFAULT_MODS, ...JSON.parse(saved) } : DEFAULT_MODS;
    } catch {
      return DEFAULT_MODS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('scout_tin_basic_v1', JSON.stringify(basicPlaced));
    } catch {
      // ignore storage errors in restricted iframes
    }
  }, [basicPlaced]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'scout_tin_advanced_v1',
        JSON.stringify(advancedPlaced)
      );
    } catch {
      // ignore
    }
  }, [advancedPlaced]);

  useEffect(() => {
    try {
      localStorage.setItem('scout_tin_mods_v1', JSON.stringify(tinMods));
    } catch {
      // ignore
    }
  }, [tinMods]);

  const placedItems = mode === 'basic' ? basicPlaced : advancedPlaced;
  const setPlacedItems =
    mode === 'basic' ? setBasicPlaced : setAdvancedPlaced;

  const handleLoadDemo = () => {
    playTinSnap(muted);
    if (mode === 'basic') {
      setBasicPlaced(BASIC_DEMO_LAYOUT);
    } else {
      setAdvancedPlaced(ADVANCED_DEMO_LAYOUT);
    }
    setTinMods((prev) => ({
      ...prev,
      polishedMirrorLid: true,
      morseCodeBottom: true,
      waterproofTapeRim: true,
      cottonPadding: true,
      positionMapTop: true,
      nameCardFilled: true,
      ownerName: prev.ownerName || '飛鷹小隊示範員',
      troopName: prev.troopName || '香港童軍旅團',
    }));
  };

  const handleClearTin = () => {
    setPlacedItems([]);
    setTinMods((prev) => ({
      ...prev,
      polishedMirrorLid: false,
      morseCodeBottom: false,
      waterproofTapeRim: false,
      cottonPadding: false,
      positionMapTop: false,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* TOP SCOUT HEADER */}
      <header className="no-print bg-[#183D2F] text-white border-b-4 border-amber-500 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          {/* Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-inner shrink-0 font-black">
              <Compass className="w-6 h-6 text-[#183D2F]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded bg-purple-700 text-purple-100">
                  準備 · BE PREPARED
                </span>
                <span className="text-xs text-emerald-200 hidden sm:inline">
                  山野求生 × 全民應急防災教材
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight mt-0.5">
                童軍互動「殘存小包」訓練工作坊
              </h1>
            </div>
          </div>

          {/* Right Controls: Section Difficulty Switcher & Mute */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-black/25 p-1 rounded-xl flex items-center border border-white/15">
              <button
                onClick={() => setMode('basic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  mode === 'basic'
                    ? 'bg-amber-400 text-stone-950 shadow-xs'
                    : 'text-emerald-100 hover:text-white'
                }`}
              >
                基礎模式（幼童軍 6×4）
              </button>
              <button
                onClick={() => setMode('advanced')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  mode === 'advanced'
                    ? 'bg-amber-400 text-stone-950 shadow-xs'
                    : 'text-emerald-100 hover:text-white'
                }`}
              >
                進階模式（童軍／深資 8×5）
              </button>
            </div>

            <button
              onClick={() => setMuted((m) => !m)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title={muted ? '開啟音效' : '靜音模式'}
            >
              {muted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* MAIN 4-STEP NAVIGATION BAR */}
        <div className="bg-[#122E23] border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto no-scrollbar gap-1 py-2">
            {(
              [
                {
                  id: 'workbench',
                  label: '1. 互動執盒工作坊',
                  sub: '收拾鐵盒＋查看用法',
                  icon: Package,
                },
                {
                  id: 'scenarios',
                  label: '2. 突發求生情境實戰',
                  sub: '用自己個盒解難',
                  icon: Flame,
                },
                {
                  id: 'global',
                  label: '3. 各國儲糧與防災延伸',
                  sub: '殘存包 vs 走佬袋',
                  icon: Globe,
                },
                {
                  id: 'print',
                  label: '4. 位置圖列印與全圖鑑',
                  sub: 'A4 工作紙＋新舊對照',
                  icon: BookOpen,
                },
              ] as const
            ).map((nav) => {
              const Icon = nav.icon;
              const isAct = activeTab === nav.id;
              return (
                <button
                  key={nav.id}
                  onClick={() => setActiveTab(nav.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-left shrink-0 transition cursor-pointer ${
                    isAct
                      ? 'bg-[#F5F2EA] text-stone-900 shadow-sm'
                      : 'text-emerald-100/85 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isAct ? 'text-emerald-800' : 'text-amber-300'
                    }`}
                  />
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold leading-tight">
                      {nav.label}
                    </div>
                    <div
                      className={`text-[10px] hidden md:block ${
                        isAct ? 'text-stone-500' : 'text-emerald-200/70'
                      }`}
                    >
                      {nav.sub}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'workbench' && (
          <TinWorkbench
            mode={mode}
            placedItems={placedItems}
            setPlacedItems={setPlacedItems}
            tinMods={tinMods}
            setTinMods={setTinMods}
            onLoadDemo={handleLoadDemo}
            onClearTin={handleClearTin}
            onGoToScenario={() => setActiveTab('scenarios')}
            onGoToPrint={() => setActiveTab('print')}
            muted={muted}
          />
        )}

        {activeTab === 'scenarios' && (
          <ScenarioChallenge
            mode={mode}
            placedItems={placedItems}
            tinMods={tinMods}
            onLoadDemo={handleLoadDemo}
            onBackToWorkbench={() => setActiveTab('workbench')}
            muted={muted}
          />
        )}

        {activeTab === 'global' && <GlobalPreparednessView muted={muted} />}

        {activeTab === 'print' && (
          <EncyclopediaAndPrint
            mode={mode}
            placedItems={placedItems}
            tinMods={tinMods}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="no-print border-t border-stone-300/80 bg-stone-200/50 py-4 px-4 sm:px-6 text-center text-xs text-stone-600">
        童軍銘言：<strong>準備（Be Prepared）</strong> ·
        建議每四星期檢查並更新殘存包物資 · 居安思危，冷靜助人自助
      </footer>
    </div>
  );
}

export default App;
