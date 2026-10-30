import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Compass,
  Info,
  Layers,
  RotateCw,
  ShieldAlert,
  Sparkles,
  Trash2,
  Volume2,
  Wand2,
  Move,
  Sun,
  Radio,
  FileText,
  PackageOpen,
} from 'lucide-react';
import {
  CATEGORY_META,
  ERA_LABELS,
  SURVIVAL_ITEMS,
} from '../data/survivalData';
import {
  DifficultyMode,
  ItemCategory,
  PlacedItem,
  SurvivalItem,
  TinModifications,
} from '../types/survival';
import { ItemArtwork } from './ItemArtwork';
import {
  playMorseSOS,
  playTinShakeSound,
  playTinSnap,
  playTrapBuzz,
} from '../utils/soundEffects';

interface TinWorkbenchProps {
  mode: DifficultyMode;
  placedItems: PlacedItem[];
  setPlacedItems: React.Dispatch<React.SetStateAction<PlacedItem[]>>;
  tinMods: TinModifications;
  setTinMods: React.Dispatch<React.SetStateAction<TinModifications>>;
  onLoadDemo: () => void;
  onClearTin: () => void;
  onGoToScenario: () => void;
  onGoToPrint: () => void;
  muted: boolean;
}

type TinSurface = 'inside' | 'lid' | 'bottom' | 'topmap';

export const TinWorkbench: React.FC<TinWorkbenchProps> = ({
  mode,
  placedItems,
  setPlacedItems,
  tinMods,
  setTinMods,
  onLoadDemo,
  onClearTin,
  onGoToScenario,
  onGoToPrint,
  muted,
}) => {
  const cols = mode === 'basic' ? 6 : 8;
  const rows = mode === 'basic' ? 4 : 5;

  const [surface, setSurface] = useState<TinSurface>('inside');
  const [selectedCategory, setSelectedCategory] = useState<'all' | ItemCategory>('all');
  const [holdingItemId, setHoldingItemId] = useState<string | null>(null);
  const [holdingRotated, setHoldingRotated] = useState<boolean>(false);
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null);
  const [inspectedItemId, setInspectedItemId] = useState<string>('whistle');
  const [shakeState, setShakeState] = useState<'idle' | 'rattle' | 'solid'>('idle');
  const [shakeFeedback, setShakeFeedback] = useState<string | null>(null);
  const [morseStep, setMorseStep] = useState<number | null>(null);
  const stopMorseRef = useRef<(() => void) | null>(null);

  // Filter items by mode
  const availableItems = useMemo(() => {
    return SURVIVAL_ITEMS.filter((item) =>
      mode === 'basic' ? item.availableInBasic : true
    );
  }, [mode]);

  const itemMap = useMemo(() => {
    const map = new Map<string, SurvivalItem>();
    SURVIVAL_ITEMS.forEach((it) => map.set(it.id, it));
    return map;
  }, []);

  const placedIds = useMemo(
    () => new Set(placedItems.map((p) => p.itemId)),
    [placedItems]
  );

  // Reset held item & incompatible selection when switching difficulty mode
  useEffect(() => {
    setHoldingItemId(null);
    setHoverCell(null);
    if (!availableItems.some((it) => it.id === inspectedItemId)) {
      setInspectedItemId('whistle');
    }
  }, [mode, availableItems, inspectedItemId]);

  // Keyboard 'R' to rotate held item
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        (e.key === 'r' || e.key === 'R') &&
        holdingItemId &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setHoldingRotated((prev) => !prev);
      } else if (e.key === 'Escape' && holdingItemId) {
        setHoldingItemId(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [holdingItemId]);

  useEffect(() => {
    return () => {
      stopMorseRef.current?.();
    };
  }, []);

  // Build occupancy matrix
  const occupancyGrid = useMemo(() => {
    const grid: (string | null)[][] = Array.from({ length: rows }, () =>
      Array(cols).fill(null)
    );
    placedItems.forEach((p) => {
      const def = itemMap.get(p.itemId);
      if (!def) return;
      const w = p.rotated ? def.height : def.width;
      const h = p.rotated ? def.width : def.height;
      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          const gx = p.x + dx;
          const gy = p.y + dy;
          if (gy >= 0 && gy < rows && gx >= 0 && gx < cols) {
            grid[gy][gx] = p.itemId;
          }
        }
      }
    });
    return grid;
  }, [placedItems, cols, rows, itemMap]);

  const canPlaceAt = (
    itemId: string,
    x: number,
    y: number,
    rotated: boolean,
    ignoreItemId?: string
  ): boolean => {
    const def = itemMap.get(itemId);
    if (!def) return false;
    const w = rotated ? def.height : def.width;
    const h = rotated ? def.width : def.height;
    if (x < 0 || y < 0 || x + w > cols || y + h > rows) return false;

    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const occ = occupancyGrid[y + dy]?.[x + dx];
        if (occ && occ !== ignoreItemId) return false;
      }
    }
    return true;
  };

  const handlePlaceItem = (
    itemId: string,
    x: number,
    y: number,
    rotated: boolean
  ) => {
    const def = itemMap.get(itemId);
    if (!def) return;
    if (!canPlaceAt(itemId, x, y, rotated, itemId)) return;

    setPlacedItems((prev) => {
      const filtered = prev.filter((p) => p.itemId !== itemId);
      return [...filtered, { itemId, x, y, rotated }];
    });
    setInspectedItemId(itemId);
    setHoldingItemId(null);
    setHoverCell(null);

    if (def.category === 'trap') {
      playTrapBuzz(muted);
    } else {
      playTinSnap(muted);
    }
  };

  const handleRemovePlaced = (itemId: string) => {
    setPlacedItems((prev) => prev.filter((p) => p.itemId !== itemId));
    if (holdingItemId === itemId) setHoldingItemId(null);
  };

  const handleRotatePlaced = (itemId: string) => {
    const existing = placedItems.find((p) => p.itemId === itemId);
    const def = itemMap.get(itemId);
    if (!existing || !def) return;
    if (def.width === def.height) return;

    const nextRot = !existing.rotated;
    if (canPlaceAt(itemId, existing.x, existing.y, nextRot, itemId)) {
      setPlacedItems((prev) =>
        prev.map((p) =>
          p.itemId === itemId ? { ...p, rotated: nextRot } : p
        )
      );
      playTinSnap(muted);
    } else {
      // Pick it up in rotated state so user can place it where it fits
      handleRemovePlaced(itemId);
      setHoldingItemId(itemId);
      setHoldingRotated(nextRot);
    }
  };

  const handleMovePlaced = (itemId: string) => {
    const existing = placedItems.find((p) => p.itemId === itemId);
    if (!existing) return;
    const prevRot = existing.rotated;
    handleRemovePlaced(itemId);
    setHoldingItemId(itemId);
    setHoldingRotated(prevRot);
    setInspectedItemId(itemId);
  };

  const handleTrayItemClick = (item: SurvivalItem) => {
    setInspectedItemId(item.id);
    if (placedIds.has(item.id)) {
      // Highlight it; don't accidentally remove unless user clicks remove
      setSurface('inside');
      return;
    }
    setSurface('inside');
    if (holdingItemId === item.id) {
      setHoldingItemId(null);
    } else {
      setHoldingItemId(item.id);
      setHoldingRotated(false);
    }
  };

  // Auto-find first valid slot button for quick mobile packing
  const handleQuickAutoSlot = (item: SurvivalItem) => {
    setInspectedItemId(item.id);
    setSurface('inside');
    if (placedIds.has(item.id)) return;

    for (const rot of [false, true]) {
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (canPlaceAt(item.id, x, y, rot)) {
            handlePlaceItem(item.id, x, y, rot);
            return;
          }
        }
      }
    }
    // If doesn't fit automatically, hold it so user sees why
    setHoldingItemId(item.id);
    setHoldingRotated(false);
  };

  const triggerShakeTest = () => {
    setSurface('inside');
    const hasItems = placedItems.length > 0;
    playTinShakeSound(tinMods.cottonPadding, hasItems, muted);

    if (!hasItems) {
      setShakeState('solid');
      setShakeFeedback('鐵盒目前是空的！請先揀選求生物品放入鐵盒。');
    } else if (tinMods.cottonPadding) {
      setShakeState('solid');
      setShakeFeedback(
        '通過領袖搖盒檢查！壓扁的消毒棉花填滿了盒內空隙，完全沒有「咔啦咔啦」聲響，火柴與工具亦不會互相撞擊受損！'
      );
    } else {
      setShakeState('rattle');
      setShakeFeedback(
        '咔啦咔啦響！盒內有空隙，行山時不但發出噪音，火柴頭更可能摩擦受損或刮穿藥品包裝！快開啟下方「壓扁消毒棉花填隙」！'
      );
    }
    window.setTimeout(() => setShakeState('idle'), 650);
  };

  const triggerMorseDemo = () => {
    stopMorseRef.current?.();
    stopMorseRef.current = playMorseSOS(muted, (step) => {
      setMorseStep(step);
    });
  };

  // Compute Readiness Assessment across 6 pillars
  const readiness = useMemo(() => {
    const packedDefs = placedItems
      .map((p) => itemMap.get(p.itemId))
      .filter((x): x is SurvivalItem => Boolean(x));

    const trapsPacked = packedDefs.filter((d) => d.category === 'trap');
    const hasSignal =
      packedDefs.some((d) => d.category === 'signal') ||
      tinMods.polishedMirrorLid;
    const hasFireLight = packedDefs.some((d) => d.category === 'fire');
    const hasNav = packedDefs.some((d) => d.category === 'nav');
    const firstAidCount = packedDefs.filter(
      (d) => d.category === 'firstaid'
    ).length;
    const repairCount = packedDefs.filter(
      (d) => d.category === 'repair'
    ).length;

    const modCount = [
      tinMods.polishedMirrorLid,
      tinMods.morseCodeBottom,
      tinMods.waterproofTapeRim,
      tinMods.cottonPadding,
      tinMods.positionMapTop,
      tinMods.nameCardFilled,
    ].filter(Boolean).length;

    let rawScore = 0;
    if (hasSignal) rawScore += 16;
    if (hasFireLight) rawScore += 16;
    if (hasNav) rawScore += 16;
    rawScore += Math.min(20, firstAidCount * 7);
    rawScore += Math.min(14, repairCount * 5);
    rawScore += modCount * 3; // up to 18 pts for full tin craft!
    rawScore -= trapsPacked.length * 12;

    const score = Math.max(0, Math.min(100, rawScore));

    const usedCells = packedDefs.reduce(
      (acc, d) => acc + d.width * d.height,
      0
    );

    return {
      score,
      usedCells,
      totalCells: cols * rows,
      trapsPacked,
      pillars: [
        { label: '求救與通訊', ok: hasSignal },
        { label: '照明／生火', ok: hasFireLight },
        { label: '導航與記錄', ok: hasNav },
        { label: '急救護理 (≥2項)', ok: firstAidCount >= 2 },
        { label: '修補維生 (≥2項)', ok: repairCount >= 2 },
        { label: '盒身改裝 (≥4項)', ok: modCount >= 4 },
      ],
      modCount,
    };
  }, [placedItems, itemMap, tinMods, cols, rows]);

  const filteredTrayItems = useMemo(() => {
    if (selectedCategory === 'all') return availableItems;
    return availableItems.filter((it) => it.category === selectedCategory);
  }, [availableItems, selectedCategory]);

  const inspectedItem =
    itemMap.get(inspectedItemId) || availableItems[0] || SURVIVAL_ITEMS[0];
  const inspectedPlaced = placedItems.find(
    (p) => p.itemId === inspectedItem.id
  );
  const holdingItem = holdingItemId ? itemMap.get(holdingItemId) : null;

  // Ghost preview computation
  const ghostCells = useMemo(() => {
    const map = new Map<string, boolean>();
    if (!holdingItem || !hoverCell) return map;
    const w = holdingRotated ? holdingItem.height : holdingItem.width;
    const h = holdingRotated ? holdingItem.width : holdingItem.height;
    const valid = canPlaceAt(
      holdingItem.id,
      hoverCell.x,
      hoverCell.y,
      holdingRotated,
      holdingItem.id
    );
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        map.set(`${hoverCell.x + dx},${hoverCell.y + dy}`, valid);
      }
    }
    return map;
  }, [holdingItem, hoverCell, holdingRotated, occupancyGrid]);

  return (
    <div className="space-y-6">
      {/* Top Action & Tin Surface Selector Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 mr-1">
            360° 檢視及改裝鐵盒：
          </span>
          {(
            [
              {
                id: 'inside',
                label: '1. 盒內空間收納',
                icon: PackageOpen,
                done: placedItems.length >= 6,
              },
              {
                id: 'lid',
                label: '2. 盒蓋反光鏡',
                icon: Sun,
                done: tinMods.polishedMirrorLid,
              },
              {
                id: 'bottom',
                label: '3. 盒底密碼與封邊',
                icon: Radio,
                done: tinMods.morseCodeBottom && tinMods.waterproofTapeRim,
              },
              {
                id: 'topmap',
                label: '4. 位置圖與人名卡',
                icon: FileText,
                done: tinMods.positionMapTop && tinMods.nameCardFilled,
              },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = surface === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSurface(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  active
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.done && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      active ? 'bg-amber-300' : 'bg-emerald-600'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={triggerShakeTest}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 transition cursor-pointer"
            title="童軍領袖檢查殘存包的經典方法：搖一搖聽聽有沒有咔啦聲！"
          >
            <Volume2 className="w-4 h-4" />
            搖盒防響測試
          </button>
          <button
            onClick={onLoadDemo}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 transition cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            領袖示範排位
          </button>
          <button
            onClick={onClearTin}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-stone-100 text-stone-700 hover:bg-rose-50 hover:text-rose-700 border border-stone-200 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            清空重執
          </button>
        </div>
      </div>

      {/* Main 12-Col Grid: Left/Center = Interactive Tin + Item Tray | Right = Inspector & Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT 7 COLS: THE INTERACTIVE METAL TIN + TRAY */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Holding Banner */}
          {holdingItem && surface === 'inside' && (
            <div className="bg-emerald-900 text-white rounded-2xl p-3.5 shadow-md flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <ItemArtwork itemId={holdingItem.id} className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-sm font-bold">
                    正準備放入：{holdingItem.name}（
                    {holdingRotated ? holdingItem.height : holdingItem.width}×
                    {holdingRotated ? holdingItem.width : holdingItem.height}{' '}
                    格）
                  </div>
                  <div className="text-xs text-emerald-200">
                    請點擊下方鐵盒格仔擺放，或按「旋轉 90°」（鍵盤 R 鍵）調整方向
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {holdingItem.width !== holdingItem.height && (
                  <button
                    onClick={() => setHoldingRotated((r) => !r)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400 text-stone-950 text-xs font-bold hover:bg-amber-300 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    旋轉 90°
                  </button>
                )}
                <button
                  onClick={() => setHoldingItemId(null)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold cursor-pointer"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* Shake Feedback Toast */}
          {shakeFeedback && (
            <div
              className={`rounded-xl p-3.5 border text-sm flex items-start justify-between gap-3 ${
                tinMods.cottonPadding && placedItems.length > 0
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-amber-50 border-amber-400 text-amber-950'
              }`}
            >
              <div className="flex items-start gap-2">
                {tinMods.cottonPadding && placedItems.length > 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span>{shakeFeedback}</span>
              </div>
              <button
                onClick={() => setShakeFeedback(null)}
                className="text-xs underline opacity-75 hover:opacity-100 shrink-0 cursor-pointer"
              >
                關閉
              </button>
            </div>
          )}

          {/* THE TACTILE THROAT-LOZENGE TIN CONTAINER */}
          <div className="bg-stone-200/70 rounded-3xl p-4 sm:p-6 border border-stone-300 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-700" />
                <h2 className="font-bold text-stone-800 text-sm sm:text-base">
                  {mode === 'basic'
                    ? '幼童軍基礎鐵盒（6 × 4 格 · 喉糖鐵盒）'
                    : '童軍／深資進階鐵盒（8 × 5 格 · 使立消／薄荷糖鐵盒）'}
                </h2>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-stone-700 border border-stone-300">
                已用空間：{readiness.usedCells} / {readiness.totalCells} 格
              </span>
            </div>

            {/* Tin Outer Metallic Rim */}
            <div
              className={`relative mx-auto max-w-2xl rounded-[2rem] p-3 sm:p-4 shadow-xl transition-all ${
                tinMods.waterproofTapeRim
                  ? 'bg-stone-900 ring-4 ring-stone-800'
                  : 'brushed-tin border-2 border-slate-400'
              } ${
                shakeState === 'rattle'
                  ? 'animate-tin-rattle'
                  : shakeState === 'solid'
                  ? 'animate-tin-solid'
                  : ''
              }`}
            >
              {/* Top Hinge Notches */}
              <div className="absolute -top-1.5 left-1/4 w-10 h-2.5 rounded-full bg-slate-500 border border-slate-600 shadow-sm" />
              <div className="absolute -top-1.5 right-1/4 w-10 h-2.5 rounded-full bg-slate-500 border border-slate-600 shadow-sm" />

              {tinMods.waterproofTapeRim && (
                <div className="absolute -bottom-2.5 right-6 bg-stone-900 text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-400/50 shadow">
                  已纏防水電工膠布封邊
                </div>
              )}

              {/* SURFACE 1: INSIDE SPATIAL GRID */}
              {surface === 'inside' && (
                <div className="brushed-tin-well rounded-[1.4rem] p-2.5 sm:p-3.5 border-2 border-slate-500/60 shadow-inner relative">
                  {/* Cotton Padding Visual Layer */}
                  {tinMods.cottonPadding && (
                    <div
                      className="absolute inset-2 rounded-2xl pointer-events-none opacity-45"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle, #ffffff 35%, rgba(248,250,252,0.5) 70%)',
                      }}
                    />
                  )}

                  {/* Spatial Grid */}
                  <div
                    className="relative grid gap-1.5 select-none"
                    style={{
                      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                    }}
                    onMouseLeave={() => setHoverCell(null)}
                  >
                    {Array.from({ length: rows }).map((_, y) =>
                      Array.from({ length: cols }).map((__, x) => {
                        const key = `${x},${y}`;
                        const ghostValid = ghostCells.get(key);
                        const isGhost = ghostCells.has(key);

                        return (
                          <div
                            key={key}
                            onDragOver={(e) => {
                              e.preventDefault();
                              if (!hoverCell || hoverCell.x !== x || hoverCell.y !== y) {
                                setHoverCell({ x, y });
                              }
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const droppedId = e.dataTransfer.getData('text/plain');
                              const targetId = droppedId || holdingItemId;
                              if (targetId) {
                                const rot =
                                  targetId === holdingItemId ? holdingRotated : false;
                                if (canPlaceAt(targetId, x, y, rot, targetId)) {
                                  handlePlaceItem(targetId, x, y, rot);
                                }
                              }
                              setHoverCell(null);
                            }}
                            onMouseEnter={() => {
                              if (holdingItemId) setHoverCell({ x, y });
                            }}
                            onClick={() => {
                              if (holdingItemId) {
                                handlePlaceItem(holdingItemId, x, y, holdingRotated);
                              }
                            }}
                            className={`aspect-square rounded-lg border transition-colors flex items-center justify-center ${
                              isGhost
                                ? ghostValid
                                  ? 'bg-emerald-400/55 border-emerald-700 border-2 cursor-pointer z-20'
                                  : 'bg-rose-400/55 border-rose-700 border-2 cursor-not-allowed z-20'
                                : holdingItemId
                                ? 'bg-white/35 border-slate-500/40 hover:bg-emerald-200/40 cursor-pointer'
                                : 'bg-slate-900/10 border-slate-600/25'
                            }`}
                          >
                            <span className="text-[10px] font-mono text-slate-600/45 pointer-events-none">
                              {String.fromCharCode(65 + y)}
                              {x + 1}
                            </span>
                          </div>
                        );
                      })
                    )}

                    {/* Placed Items Overlay positioned via CSS Grid */}
                    {placedItems.map((placed) => {
                      const def = itemMap.get(placed.itemId);
                      if (!def) return null;
                      const w = placed.rotated ? def.height : def.width;
                      const h = placed.rotated ? def.width : def.height;
                      const isSelected = inspectedItemId === def.id;
                      const isTrap = def.category === 'trap';

                      return (
                        <div
                          key={placed.itemId}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', def.id);
                            setHoldingItemId(def.id);
                            setHoldingRotated(placed.rotated);
                            setInspectedItemId(def.id);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (holdingItemId && holdingItemId !== def.id) return;
                            setInspectedItemId(def.id);
                          }}
                          style={{
                            gridColumn: `${placed.x + 1} / span ${w}`,
                            gridRow: `${placed.y + 1} / span ${h}`,
                          }}
                          className={`z-10 rounded-xl border-2 p-1.5 flex flex-col items-center justify-center text-center shadow-sm transition cursor-pointer relative overflow-hidden ${
                            def.color
                          } ${def.borderColor} ${def.textColor} ${
                            holdingItemId === def.id
                              ? 'pointer-events-none opacity-45'
                              : isSelected
                              ? 'ring-3 ring-emerald-800 shadow-md scale-[1.01]'
                              : 'hover:brightness-97'
                          }`}
                        >
                          {isTrap && (
                            <span className="absolute top-1 right-1 bg-rose-600 text-white text-[9px] font-bold px-1 rounded">
                              陷阱!
                            </span>
                          )}
                          <ItemArtwork
                            itemId={def.id}
                            className={
                              w === 1 && h === 1
                                ? 'w-6 h-6 sm:w-7 sm:h-7'
                                : 'w-7 h-7 sm:w-9 sm:h-9'
                            }
                          />
                          <span className="text-[10px] sm:text-xs font-bold leading-tight mt-0.5 line-clamp-1">
                            {def.shortLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick controls for currently selected placed item + Cotton Toggle */}
                  <div className="mt-3 pt-2.5 border-t border-slate-500/30 flex flex-wrap items-center justify-between gap-2">
                    <label className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-900 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tinMods.cottonPadding}
                        onChange={(e) =>
                          setTinMods((m) => ({
                            ...m,
                            cottonPadding: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 accent-emerald-700"
                      />
                      <span>塞入壓扁消毒棉花填滿空隙（防響＋止血＋引火絨）</span>
                    </label>

                    {inspectedPlaced && (
                      <div className="flex items-center gap-1.5 bg-white/90 px-2.5 py-1 rounded-xl border border-slate-400">
                        <span className="text-xs font-bold text-stone-700 mr-1">
                          {inspectedItem.shortLabel}：
                        </span>
                        {inspectedItem.width !== inspectedItem.height && (
                          <button
                            onClick={() => handleRotatePlaced(inspectedItem.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold cursor-pointer"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            旋轉
                          </button>
                        )}
                        <button
                          onClick={() => handleMovePlaced(inspectedItem.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-900 text-xs font-semibold cursor-pointer"
                        >
                          <Move className="w-3.5 h-3.5" />
                          移位
                        </button>
                        <button
                          onClick={() => handleRemovePlaced(inspectedItem.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-semibold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          取出
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SURFACE 2: INNER LID SIGNAL MIRROR */}
              {surface === 'lid' && (
                <div
                  className={`rounded-[1.4rem] p-5 sm:p-6 border-2 border-slate-500/60 min-h-[290px] flex flex-col justify-between transition-all ${
                    tinMods.polishedMirrorLid
                      ? 'mirror-polished'
                      : 'bg-amber-900/20'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-md space-y-2">
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        <Sun className="w-3.5 h-3.5" />
                        香港童軍經典工藝：盒蓋求救鏡
                      </span>
                      <h3 className="text-lg font-extrabold text-stone-900">
                        {tinMods.polishedMirrorLid
                          ? '盒蓋內側已打磨拋光成「反光求救鏡」！'
                          : '原裝喉糖鐵盒內蓋（尚未打磨反光面）'}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                        傳統童軍會用幼砂紙及金屬拋光膏磨去鐵盒內蓋的油漆，或貼上高反光鏡面貼紙。晴天時反射陽光，閃光訊號遠至{' '}
                        <strong>10 公里外</strong>的山頭或搜救直升機都能看見！
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        playTinSnap(muted);
                        setTinMods((m) => ({
                          ...m,
                          polishedMirrorLid: !m.polishedMirrorLid,
                        }));
                      }}
                      className={`px-4 py-2.5 rounded-xl font-bold text-sm shadow transition cursor-pointer ${
                        tinMods.polishedMirrorLid
                          ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                          : 'bg-amber-500 text-stone-950 hover:bg-amber-400'
                      }`}
                    >
                      {tinMods.polishedMirrorLid
                        ? '已完成打磨拋光 ✓'
                        : '動手打磨盒蓋／貼反光鏡面'}
                    </button>
                  </div>

                  {/* Interactive Sighting Diagram */}
                  <div className="mt-4 bg-white/85 backdrop-blur rounded-2xl p-4 border border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-700">
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                      <div className="font-bold text-amber-900 mb-1">
                        步驟一：貼近下巴反射
                      </div>
                      將磨亮的盒蓋放在眼下臉頰旁，讓陽光反射到你伸出的手掌心上，看見亮斑。
                    </div>
                    <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200">
                      <div className="font-bold text-sky-900 mb-1">
                        步驟二：雙指 V 字瞄準
                      </div>
                      另一隻手伸直比出「V」字手勢，將遠處搜救隊或直升機夾在兩指中間。
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="font-bold text-emerald-900 mb-1">
                        步驟三：掃射三短三長三短
                      </div>
                      微調盒蓋角度，令陽光亮斑剛好落在 V 字指縫上，光束便精準射向目標！
                    </div>
                  </div>
                </div>
              )}

              {/* SURFACE 3: TIN BOTTOM MORSE CODE & WATERPROOF TAPE */}
              {surface === 'bottom' && (
                <div className="bg-slate-800 text-slate-100 rounded-[1.4rem] p-5 sm:p-6 border-2 border-slate-600 min-h-[290px] space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        盒底外側：摩斯密碼表 ＆ 盒口防水封邊
                      </h3>
                      <p className="text-xs text-slate-300">
                        用透明闊膠紙將密碼表整張封貼在盒底，濕水都唔甩！
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          playTinSnap(muted);
                          setTinMods((m) => ({
                            ...m,
                            morseCodeBottom: !m.morseCodeBottom,
                          }));
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          tinMods.morseCodeBottom
                            ? 'bg-emerald-500 text-stone-950'
                            : 'bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-500'
                        }`}
                      >
                        {tinMods.morseCodeBottom
                          ? '已貼摩斯密碼表 ✓'
                          : '+ 貼上摩斯密碼表'}
                      </button>

                      <button
                        onClick={() => {
                          playTinSnap(muted);
                          setTinMods((m) => ({
                            ...m,
                            waterproofTapeRim: !m.waterproofTapeRim,
                          }));
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          tinMods.waterproofTapeRim
                            ? 'bg-amber-400 text-stone-950'
                            : 'bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-500'
                        }`}
                      >
                        {tinMods.waterproofTapeRim
                          ? '已纏防水電工膠布 ✓'
                          : '+ 纏繞防水電工膠布'}
                      </button>
                    </div>
                  </div>

                  {/* Morse Chart Sticker */}
                  <div
                    className={`rounded-2xl p-4 border-2 transition ${
                      tinMods.morseCodeBottom
                        ? 'bg-amber-50 text-stone-900 border-amber-300 shadow-md'
                        : 'bg-slate-900/50 text-slate-400 border-dashed border-slate-600'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="font-extrabold text-sm flex items-center gap-2">
                        <span>國際求救訊號 SOS：</span>
                        <span className="font-mono tracking-widest bg-stone-900 text-amber-300 px-2.5 py-0.5 rounded-lg">
                          · · · — — — · · ·
                        </span>
                      </div>
                      <button
                        onClick={triggerMorseDemo}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-bold hover:bg-orange-500 cursor-pointer"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        試播 SOS 聲光訊號
                        {morseStep !== null && morseStep >= 0 && (
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-300 animate-ping" />
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 text-[11px] font-mono">
                      {[
                        ['A', '· —'],
                        ['B', '— · · ·'],
                        ['C', '— · — ·'],
                        ['D', '— · ·'],
                        ['E', '·'],
                        ['F', '· · — ·'],
                        ['G', '— — ·'],
                        ['H', '· · · ·'],
                        ['I', '· ·'],
                        ['K', '— · —'],
                        ['L', '· — · ·'],
                        ['M', '— —'],
                        ['N', '— ·'],
                        ['O', '— — —'],
                        ['P', '· — — ·'],
                        ['R', '· — ·'],
                        ['S', '· · ·'],
                        ['T', '—'],
                        ['U', '· · —'],
                        ['V', '· · · —'],
                        ['W', '· — —'],
                        ['Y', '— · — —'],
                        ['1', '· — — — —'],
                        ['9', '— — — — ·'],
                      ].map(([ch, code]) => (
                        <div
                          key={ch}
                          className="px-2 py-1 rounded bg-black/5 flex items-center justify-between"
                        >
                          <span className="font-bold">{ch}</span>
                          <span>{code}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SURFACE 4: POSITION MAP & NAME CARD */}
              {surface === 'topmap' && (
                <div className="bg-amber-50 rounded-[1.4rem] p-4 sm:p-5 border-2 border-amber-300 min-h-[290px] grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Auto-generated Position Diagram */}
                  <div className="bg-white rounded-xl p-3.5 border border-stone-300 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm">
                          盒面最上層：物品位置圖
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          依你盒內排位即時生成，方便緊急時一眼搵到物資
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={tinMods.positionMapTop}
                        onChange={(e) =>
                          setTinMods((m) => ({
                            ...m,
                            positionMapTop: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 accent-emerald-700 cursor-pointer"
                      />
                    </div>

                    {/* Mini Blueprint Preview */}
                    <div
                      className="grid gap-1 bg-stone-100 p-2 rounded-lg border border-stone-300"
                      style={{
                        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                      }}
                    >
                      {Array.from({ length: rows }).map((_, y) =>
                        Array.from({ length: cols }).map((__, x) => (
                          <div
                            key={`bp-${x}-${y}`}
                            className="aspect-square border border-dashed border-stone-300 rounded-sm"
                          />
                        ))
                      )}
                      {placedItems.map((p) => {
                        const def = itemMap.get(p.itemId);
                        if (!def) return null;
                        const w = p.rotated ? def.height : def.width;
                        const h = p.rotated ? def.width : def.height;
                        return (
                          <div
                            key={`bp-item-${p.itemId}`}
                            style={{
                              gridColumn: `${p.x + 1} / span ${w}`,
                              gridRow: `${p.y + 1} / span ${h}`,
                            }}
                            className="bg-emerald-50 border border-emerald-700 rounded-sm flex items-center justify-center p-0.5 text-[9px] font-bold text-emerald-950 text-center leading-none overflow-hidden"
                          >
                            {def.shortLabel}
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={onGoToPrint}
                      className="w-full py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                    >
                      打開可列印 1:1 位置圖工作紙 →
                    </button>
                  </div>

                  {/* Right: Scout Name & Emergency Card */}
                  <div className="bg-white rounded-xl p-3.5 border border-stone-300 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm">
                          緊急聯絡人名卡（防水封膠）
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          資料只保留於此瀏覽器，可輸入示範代號
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={tinMods.nameCardFilled}
                        onChange={(e) =>
                          setTinMods((m) => ({
                            ...m,
                            nameCardFilled: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 accent-emerald-700 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="block font-semibold text-stone-600 mb-0.5">
                          成員姓名／童軍稱號：
                        </label>
                        <input
                          type="text"
                          value={tinMods.ownerName}
                          onChange={(e) =>
                            setTinMods((m) => ({
                              ...m,
                              ownerName: e.target.value,
                              nameCardFilled: true,
                            }))
                          }
                          placeholder="例：陳小狼（飛鷹小隊）"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 focus:outline-none focus:border-emerald-700"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-600 mb-0.5">
                          所屬旅團：
                        </label>
                        <input
                          type="text"
                          value={tinMods.troopName}
                          onChange={(e) =>
                            setTinMods((m) => ({
                              ...m,
                              troopName: e.target.value,
                            }))
                          }
                          placeholder="例：香港童軍第 XXX 旅"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 focus:outline-none focus:border-emerald-700"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-semibold text-stone-600 mb-0.5">
                            緊急聯絡電話：
                          </label>
                          <input
                            type="text"
                            value={tinMods.emergencyPhone}
                            onChange={(e) =>
                              setTinMods((m) => ({
                                ...m,
                                emergencyPhone: e.target.value,
                              }))
                            }
                            placeholder="例：9XXX-XXXX"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 focus:outline-none focus:border-emerald-700"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-stone-600 mb-0.5">
                            藥物過敏／備註：
                          </label>
                          <input
                            type="text"
                            value={tinMods.medicalNote}
                            onChange={(e) =>
                              setTinMods((m) => ({
                                ...m,
                                medicalNote: e.target.value,
                              }))
                            }
                            placeholder="例：無藥物敏感 / G6PD"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 focus:outline-none focus:border-emerald-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ITEM SELECTION TRAY */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-stone-900 text-base">
                  物資補給桌（點擊揀選再放入鐵盒，或直接拖曳／快放）
                </h3>
                <p className="text-xs text-stone-500">
                  小心！桌上混入了幾件<strong>「不適合放入殘存包的陷阱物品」</strong>，考考成員能否分辨！
                </p>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'all', label: '全部物資' },
                  { id: 'signal', label: '求救通訊' },
                  { id: 'fire', label: '生火照明' },
                  { id: 'nav', label: '導航記錄' },
                  { id: 'firstaid', label: '急救護理' },
                  { id: 'repair', label: '修補維生' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Tray Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {filteredTrayItems.map((item) => {
                const isPacked = placedIds.has(item.id);
                const isHeld = holdingItemId === item.id;
                const isInspected = inspectedItemId === item.id;

                return (
                  <div
                    key={item.id}
                    draggable={!isPacked}
                    onDragStart={(e) => {
                      if (isPacked) return;
                      e.dataTransfer.setData('text/plain', item.id);
                      setHoldingItemId(item.id);
                      setHoldingRotated(false);
                      setInspectedItemId(item.id);
                      setSurface('inside');
                    }}
                    onClick={() => handleTrayItemClick(item)}
                    className={`rounded-xl border p-2.5 flex flex-col justify-between transition cursor-pointer select-none ${
                      isPacked
                        ? 'bg-stone-50 border-emerald-300 opacity-75'
                        : isHeld
                        ? 'bg-emerald-50 border-emerald-700 ring-2 ring-emerald-700 shadow-sm'
                        : isInspected
                        ? 'bg-amber-50/50 border-amber-400 shadow-sm'
                        : 'bg-white border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <ItemArtwork itemId={item.id} className="w-8 h-8 shrink-0" />
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                        {item.width}×{item.height}格
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className="text-xs font-bold text-stone-900 leading-snug">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                        {item.summary}
                      </div>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-stone-100 flex items-center justify-between">
                      {isPacked ? (
                        <>
                          <span className="text-[11px] font-bold text-emerald-700">
                            ✓ 已在盒內
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePlaced(item.id);
                            }}
                            className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
                          >
                            取出
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-[11px] text-stone-500">
                            {isHeld ? '請點鐵盒格仔' : '點選詳情'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickAutoSlot(item);
                            }}
                            className="px-2 py-0.5 rounded bg-emerald-800 text-white text-[11px] font-bold hover:bg-emerald-700 cursor-pointer"
                          >
                            + 放入
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLS: ITEM USAGE INSPECTOR + READINESS DASHBOARD */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-4">
          {/* ITEM USAGE INSPECTOR CARD */}
          <div className="bg-white rounded-2xl border-2 border-stone-300 shadow-sm overflow-hidden">
            <div
              className={`px-5 py-4 border-b flex items-start justify-between gap-3 ${
                inspectedItem.category === 'trap'
                  ? 'bg-rose-50 border-rose-200'
                  : 'bg-stone-50 border-stone-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-center shrink-0">
                  <ItemArtwork itemId={inspectedItem.id} className="w-9 h-9" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        CATEGORY_META[inspectedItem.category].badgeClass
                      }`}
                    >
                      {CATEGORY_META[inspectedItem.category].label}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        ERA_LABELS[inspectedItem.era].style
                      }`}
                    >
                      {ERA_LABELS[inspectedItem.era].text}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-stone-900 leading-tight">
                    {inspectedItem.name}
                  </h3>
                  <div className="text-xs text-stone-500 font-medium">
                    {inspectedItem.englishName} · 佔位 {inspectedItem.width}×
                    {inspectedItem.height} 格
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4 text-sm">
              {inspectedItem.trapReason && (
                <div className="rounded-xl bg-rose-50 border border-rose-300 p-3.5 text-rose-950 flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-rose-900 mb-0.5">
                      為什麼這是「殘存包陷阱」？
                    </div>
                    <p className="text-xs leading-relaxed">
                      {inspectedItem.trapReason}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 mb-1 flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  核心求生用途
                </h4>
                <p className="text-stone-700 leading-relaxed text-xs sm:text-sm">
                  {inspectedItem.primaryUse}
                </p>
              </div>

              {inspectedItem.hiddenUses.length > 0 && (
                <div className="bg-amber-50/70 rounded-xl p-3.5 border border-amber-200">
                  <h4 className="text-xs font-extrabold text-amber-900 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    童軍「一物多用」隱藏技巧
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-800">
                    {inspectedItem.hiddenUses.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-bold text-amber-700">•</span>
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-xs text-stone-700 leading-relaxed">
                <span className="font-bold text-stone-900 flex items-center gap-1 mb-0.5">
                  <Info className="w-3.5 h-3.5 text-emerald-700" />
                  傳統 vs 現代教材筆記：
                </span>
                {inspectedItem.scoutNote}
              </div>

              {inspectedItem.safetyTip && (
                <div className="rounded-xl bg-orange-50 border border-orange-200 p-2.5 text-xs text-orange-900">
                  <strong>安全守則：</strong>
                  {inspectedItem.safetyTip}
                </div>
              )}
            </div>
          </div>

          {/* READINESS SCORE & 6 PILLARS CARD */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-base flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  殘存包「準備度」領袖評核
                </h3>
                <p className="text-xs text-stone-500">
                  集齊五大求生類別＋完成盒身改裝，並避開陷阱物資
                </p>
              </div>
              <div className="text-right">
                <div
                  className={`text-2xl font-black ${
                    readiness.score >= 85
                      ? 'text-emerald-700'
                      : readiness.score >= 55
                      ? 'text-amber-600'
                      : 'text-stone-600'
                  }`}
                >
                  {readiness.score}
                  <span className="text-xs font-bold text-stone-400">
                    {' '}
                    / 100
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  readiness.score >= 85
                    ? 'bg-emerald-600'
                    : readiness.score >= 55
                    ? 'bg-amber-500'
                    : 'bg-stone-400'
                }`}
                style={{ width: `${readiness.score}%` }}
              />
            </div>

            {/* Trap Alert */}
            {readiness.trapsPacked.length > 0 && (
              <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 text-xs text-rose-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong>發現不當物品（每個扣 12 分）：</strong>
                  你在盒內放入了{' '}
                  {readiness.trapsPacked.map((t) => `【${t.shortLabel}】`).join('、')}
                  ，建議點擊取出！
                </div>
              </div>
            )}

            {/* 6 Pillars Checklist */}
            <div className="grid grid-cols-2 gap-2">
              {readiness.pillars.map((p) => (
                <div
                  key={p.label}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    p.ok
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-stone-50 border-stone-200 text-stone-500'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      p.ok ? 'text-emerald-600' : 'text-stone-300'
                    }`}
                  />
                  <span>{p.label}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={onGoToScenario}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
              >
                用呢個殘存包挑戰「突發求生情境」→
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
