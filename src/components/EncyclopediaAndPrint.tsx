import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  CalendarCheck,
  Printer,
  Scissors,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  CATEGORY_META,
  ERA_LABELS,
  SURVIVAL_ITEMS,
} from '../data/survivalData';
import {
  DifficultyMode,
  ItemEra,
  PlacedItem,
  SurvivalItem,
  TinModifications,
} from '../types/survival';
import { ItemArtwork } from './ItemArtwork';

interface EncyclopediaAndPrintProps {
  mode: DifficultyMode;
  placedItems: PlacedItem[];
  tinMods: TinModifications;
}

export const EncyclopediaAndPrint: React.FC<EncyclopediaAndPrintProps> = ({
  mode,
  placedItems,
  tinMods,
}) => {
  const cols = mode === 'basic' ? 6 : 8;
  const rows = mode === 'basic' ? 4 : 5;

  const [eraFilter, setEraFilter] = useState<'all' | ItemEra>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const itemMap = useMemo(() => {
    const m = new Map<string, SurvivalItem>();
    SURVIVAL_ITEMS.forEach((i) => m.set(i.id, i));
    return m;
  }, []);

  const filteredItems = useMemo(() => {
    return SURVIVAL_ITEMS.filter((item) => {
      if (eraFilter !== 'all' && item.era !== eraFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.englishName.toLowerCase().includes(q) ||
          item.primaryUse.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [eraFilter, searchQuery]);

  return (
    <div className="space-y-8">
      {/* PRINTABLE WORKSHEET & CUT-OUT BLUEPRINT */}
      <div className="bg-white rounded-3xl border-2 border-stone-300 shadow-sm p-6 sm:p-8 print-only-sheet space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <Scissors className="w-3.5 h-3.5" />
              可剪貼放進真實鐵盒 · A4 實體訓練工作紙
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5">
              個人《殘存小包盒面位置圖》與定期檢查紀錄卡
            </h2>
          </div>

          <button
            onClick={() => window.print()}
            className="no-print inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-sm font-bold shadow-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            列印／儲存 PDF 工作紙
          </button>
        </div>

        {/* Cut-out Templates Row: 1. Position Diagram | 2. Name Card + Morse Sticker */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cut-out 1: Position Map */}
          <div className="border-2 border-dashed border-stone-500 rounded-2xl p-4 bg-stone-50/60 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-stone-900">
                ✂ 剪下並用透明膠紙全張封好（放盒內最上層）
              </span>
              <span className="font-mono text-stone-500">
                {cols}×{rows} 格配置圖
              </span>
            </div>

            <div
              className="grid gap-1.5 bg-white p-3 rounded-xl border-2 border-stone-800"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: rows }).map((_, y) =>
                Array.from({ length: cols }).map((__, x) => (
                  <div
                    key={`print-cell-${x}-${y}`}
                    className="aspect-square border border-dashed border-stone-300 rounded flex items-center justify-center text-[9px] text-stone-300 font-mono"
                  >
                    {String.fromCharCode(65 + y)}
                    {x + 1}
                  </div>
                ))
              )}

              {placedItems.map((p) => {
                const def = itemMap.get(p.itemId);
                if (!def) return null;
                const w = p.rotated ? def.height : def.width;
                const h = p.rotated ? def.width : def.height;
                return (
                  <div
                    key={`print-placed-${p.itemId}`}
                    style={{
                      gridColumn: `${p.x + 1} / span ${w}`,
                      gridRow: `${p.y + 1} / span ${h}`,
                    }}
                    className="bg-emerald-50 border-2 border-stone-800 rounded-lg p-1 flex flex-col items-center justify-center text-center"
                  >
                    <span className="text-[11px] font-extrabold text-stone-900 leading-tight">
                      {def.shortLabel}
                    </span>
                    <span className="text-[9px] text-stone-500 font-mono">
                      {String.fromCharCode(65 + p.y)}
                      {p.x + 1}
                    </span>
                  </div>
                );
              })}
            </div>

            {placedItems.length === 0 && (
              <p className="text-xs text-amber-800 font-semibold text-center">
                （目前尚未在第一步擺放物品——你亦可列印空白格仔圖讓團員用鉛筆手繪設計！）
              </p>
            )}
          </div>

          {/* Cut-out 2: Name Card & Morse Sticker */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-stone-500 rounded-2xl p-4 bg-stone-50/60 space-y-2">
              <div className="text-xs font-extrabold text-stone-900">
                ✂ 緊急聯絡人名卡（貼於盒蓋或盒內上層）
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-stone-400">
                <div>
                  <span className="text-stone-500">姓名／小隊：</span>
                  <div className="font-bold text-stone-900 border-b border-stone-300 pb-0.5 min-h-[20px]">
                    {tinMods.ownerName || '__________________'}
                  </div>
                </div>
                <div>
                  <span className="text-stone-500">旅團名稱：</span>
                  <div className="font-bold text-stone-900 border-b border-stone-300 pb-0.5 min-h-[20px]">
                    {tinMods.troopName || '__________________'}
                  </div>
                </div>
                <div>
                  <span className="text-stone-500">緊急聯絡電話：</span>
                  <div className="font-bold text-stone-900 border-b border-stone-300 pb-0.5 min-h-[20px]">
                    {tinMods.emergencyPhone || '__________________'}
                  </div>
                </div>
                <div>
                  <span className="text-stone-500">過敏／醫療備註：</span>
                  <div className="font-bold text-stone-900 border-b border-stone-300 pb-0.5 min-h-[20px]">
                    {tinMods.medicalNote || '__________________'}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-2 border-dashed border-stone-500 rounded-2xl p-4 bg-stone-50/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-stone-900">
                  ✂ 盒底摩斯密碼表（SOS：· · · — — — · · ·）
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1 text-[10px] font-mono bg-white p-2.5 rounded-xl border border-stone-400">
                {[
                  'A ·-',
                  'B -···',
                  'C -·-·',
                  'D -··',
                  'E ·',
                  'F ··-·',
                  'G --·',
                  'H ····',
                  'I ··',
                  'J ·---',
                  'K -·-',
                  'L ·-··',
                  'M --',
                  'N -·',
                  'O ---',
                  'P ·--·',
                  'Q --·-',
                  'R ·-·',
                  'S ···',
                  'T -',
                  'U ··-',
                  'V ···-',
                  'W ·--',
                  'X -··-',
                  'Y -·--',
                  'Z --··',
                  '1 ·----',
                  '2 ··---',
                  '3 ···--',
                  '9 ----·',
                ].map((code) => (
                  <div key={code} className="px-1 py-0.5 bg-stone-50 rounded">
                    {code}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4-Week Inspection Checklist */}
        <div className="border border-stone-300 rounded-2xl p-4 space-y-2.5">
          <div className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 text-emerald-800" />
            童軍每四星期／每次露營前定期檢查表（防止藥物過期或火柴受潮！）
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-stone-700">
            {[
              '□ 藥水膠布、消毒棉片及淨水片包裝完好未過期',
              '□ 蠟封火柴無受潮剝落、磷片乾燥可用',
              '□ 眉鉗、扣針、摺剪／刀片及魚鉤無生鏽且包妥尖端',
              '□ 微型 LED 電筒電池正常發亮（並夾好防誤觸膠片）',
              '□ 消毒乾棉花充足，合上鐵盒搖晃時實淨無咔啦聲',
              '□ 盒口防水電工膠布及盒底密碼表膠紙無鬆脫',
            ].map((chk) => (
              <div key={chk} className="py-1">
                {chk}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FULL ITEM ENCYCLOPEDIA (HIDDEN ON PRINT) */}
      <div className="no-print bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-stone-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-800" />
              殘存包物資全圖鑑（傳統經典 vs 現代改良 vs 陷阱剖析）
            </h3>
            <p className="text-xs text-stone-500">
              收錄全部 {SURVIVAL_ITEMS.length}{' '}
              項教材物資，方便領袖講解新舊演變及一物多用技巧
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋物品名稱或用途..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-emerald-700"
            />
          </div>
        </div>

        {/* Era Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'all', label: '全部顯示' },
              { id: 'both', label: '傳統＋現代核心必備' },
              { id: 'classic', label: '傳統香港童軍經典手作' },
              { id: 'modern', label: '現代求生／急救升級' },
              { id: 'trap', label: '常見錯誤與淘汰陷阱' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setEraFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                eraFilter === f.id
                  ? 'bg-emerald-800 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 space-y-3 flex flex-col justify-between ${
                item.category === 'trap'
                  ? 'bg-rose-50/40 border-rose-200'
                  : 'bg-stone-50/50 border-stone-200'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0">
                      <ItemArtwork itemId={item.id} className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-stone-900">
                        {item.name}
                      </h4>
                      <div className="text-[11px] text-stone-500">
                        {item.englishName}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      ERA_LABELS[item.era].style
                    }`}
                  >
                    {ERA_LABELS[item.era].text}
                  </span>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed">
                  {item.trapReason || item.primaryUse}
                </p>

                {item.hiddenUses.length > 0 && (
                  <div className="bg-white rounded-xl p-2.5 border border-stone-200 space-y-1">
                    <div className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      隱藏用法：
                    </div>
                    <ul className="text-[11px] text-stone-600 space-y-0.5">
                      {item.hiddenUses.map((u, i) => (
                        <li key={i}>• {u}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-stone-200/80 text-[11px] text-stone-500">
                <strong className="text-stone-700">領袖備忘：</strong>
                {item.scoutNote}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
