import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Compass,
  Flame,
  Lightbulb,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Wand2,
} from 'lucide-react';
import { EMERGENCY_SCENARIOS, SURVIVAL_ITEMS } from '../data/survivalData';
import {
  DifficultyMode,
  ModKey,
  PlacedItem,
  SurvivalItem,
  TinModifications,
} from '../types/survival';
import { ItemArtwork } from './ItemArtwork';
import { playTinSnap, playTrapBuzz } from '../utils/soundEffects';

interface ScenarioChallengeProps {
  mode: DifficultyMode;
  placedItems: PlacedItem[];
  tinMods: TinModifications;
  onLoadDemo: () => void;
  onBackToWorkbench: () => void;
  muted: boolean;
}

const MOD_LABELS: Record<ModKey, { name: string; desc: string }> = {
  polishedMirrorLid: {
    name: '盒蓋反光求救鏡',
    desc: '反射陽光向遠處打求救訊號',
  },
  morseCodeBottom: {
    name: '盒底摩斯密碼表',
    desc: '對照 SOS 三短三長三短訊號',
  },
  waterproofTapeRim: {
    name: '盒邊防水電工膠布',
    desc: '撕下修補撕裂裝備或固定敷料',
  },
  cottonPadding: {
    name: '盒內消毒乾棉花',
    desc: '可加壓止血，撕鬆亦可作點火火絨',
  },
  positionMapTop: {
    name: '盒面位置圖',
    desc: '快速查找物資位置',
  },
  nameCardFilled: {
    name: '緊急聯絡人名卡',
    desc: '手機無電時查閱家人電話及醫療備註',
  },
};

export const ScenarioChallenge: React.FC<ScenarioChallengeProps> = ({
  mode,
  placedItems,
  tinMods,
  onLoadDemo,
  onBackToWorkbench,
  muted,
}) => {
  const scenarios = useMemo(() => {
    return EMERGENCY_SCENARIOS.filter((s) =>
      mode === 'basic' ? s.minDifficulty === 'basic' : true
    );
  }, [mode]);

  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);

  useEffect(() => {
    if (activeScenarioIdx >= scenarios.length) {
      setActiveScenarioIdx(0);
      setSelectedTools([]);
      setSubmitted(false);
    }
  }, [scenarios.length, activeScenarioIdx]);

  const scenario = scenarios[activeScenarioIdx] || scenarios[0];

  const itemMap = useMemo(() => {
    const m = new Map<string, SurvivalItem>();
    SURVIVAL_ITEMS.forEach((i) => m.set(i.id, i));
    return m;
  }, []);

  const myItems = useMemo(() => {
    return placedItems
      .map((p) => itemMap.get(p.itemId))
      .filter((x): x is SurvivalItem => Boolean(x));
  }, [placedItems, itemMap]);

  const myEnabledMods = useMemo(() => {
    const keys: ModKey[] = [
      'polishedMirrorLid',
      'morseCodeBottom',
      'waterproofTapeRim',
      'cottonPadding',
      'nameCardFilled',
    ];
    return keys.filter((k) => Boolean(tinMods[k]));
  }, [tinMods]);

  const toggleSelectTool = (toolKey: string) => {
    if (submitted) return;
    playTinSnap(muted);
    setSelectedTools((prev) =>
      prev.includes(toolKey)
        ? prev.filter((k) => k !== toolKey)
        : [...prev, toolKey]
    );
  };

  const switchScenario = (idx: number) => {
    setActiveScenarioIdx(idx);
    setSelectedTools([]);
    setSubmitted(false);
  };

  // Evaluate submission
  const evaluation = useMemo(() => {
    const validSet = new Set<string>([
      ...scenario.validItemIds,
      ...(scenario.validModKeys?.map((k) => `mod:${k}`) || []),
    ]);

    const hits = selectedTools.filter((t) => validSet.has(t));
    const misses = selectedTools.filter((t) => !validSet.has(t));

    // Check what valid items the user forgot to pack in their tin!
    const packedIdSet = new Set([
      ...myItems.map((i) => i.id),
      ...myEnabledMods.map((k) => `mod:${k}`),
    ]);

    const missingInTinNames: string[] = [];
    scenario.validItemIds.forEach((id) => {
      const def = itemMap.get(id);
      if (def && (mode === 'advanced' || def.availableInBasic) && !packedIdSet.has(id)) {
        missingInTinNames.push(def.name);
      }
    });
    scenario.validModKeys?.forEach((mk) => {
      if (!packedIdSet.has(`mod:${mk}`)) {
        missingInTinNames.push(MOD_LABELS[mk].name);
      }
    });

    const passed =
      hits.length >= scenario.requiredCount && misses.length <= 1;

    return {
      hits,
      misses,
      passed,
      missingInTinNames,
    };
  }, [scenario, selectedTools, myItems, myEnabledMods, itemMap, mode]);

  const handleSubmit = () => {
    setSubmitted(true);
    if (evaluation.passed) {
      playTinSnap(muted);
      if (!solvedIds.includes(scenario.id)) {
        setSolvedIds((prev) => [...prev, scenario.id]);
      }
    } else {
      playTrapBuzz(muted);
    }
  };

  return (
    <div className="space-y-6">
      {/* Empty Tin Reminder if user jumped straight here */}
      {myItems.length < 4 && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-amber-950 text-sm sm:text-base">
                你的殘存包目前只有 {myItems.length} 件物品！
              </h3>
              <p className="text-xs sm:text-sm text-amber-900 mt-0.5">
                情境挑戰會直接讀取你<strong>自己執好的殘存包</strong>——如果盒內無帶齊工具，遇到突發危機就會發現「無架生可用」！
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onBackToWorkbench}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-amber-400 text-amber-950 text-xs font-bold hover:bg-amber-100 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              返回自己執盒
            </button>
            <button
              onClick={onLoadDemo}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
            >
              <Wand2 className="w-4 h-4" />
              載入標準示範殘存包測試
            </button>
          </div>
        </div>
      )}

      {/* Scenario Selector Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {scenarios.map((sc, idx) => {
          const isCurrent = idx === activeScenarioIdx;
          const isDone = solvedIds.includes(sc.id);
          return (
            <button
              key={sc.id}
              onClick={() => switchScenario(idx)}
              className={`text-left rounded-2xl p-4 border-2 transition cursor-pointer ${
                isCurrent
                  ? 'bg-emerald-900 text-white border-emerald-900 shadow-md'
                  : 'bg-white text-stone-800 border-stone-200 hover:border-emerald-600'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isCurrent
                      ? 'bg-amber-400 text-stone-950'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {sc.badge}
                </span>
                {isDone && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    已過關
                  </span>
                )}
              </div>
              <div className="font-extrabold text-sm leading-snug">
                {sc.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Scenario Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="bg-stone-900 text-white p-5 sm:p-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300">
            <MapPin className="w-4 h-4" />
            {scenario.locationTag}
          </div>
          <h2 className="text-xl sm:text-2xl font-black">{scenario.title}</h2>
          <p className="text-sm sm:text-base text-stone-200 leading-relaxed max-w-3xl">
            {scenario.situation}
          </p>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-extrabold text-stone-900 text-sm sm:text-base flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-700" />
              {scenario.promptQuestion}
            </h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              已揀選：{selectedTools.length} 項（建議揀 3 項核心工具）
            </span>
          </div>

          {/* Open Member's Own Tin to Pick Tools */}
          <div className="bg-stone-100 rounded-2xl p-4 border border-stone-200 space-y-4">
            <div className="text-xs font-bold text-stone-600 uppercase tracking-wider">
              打開你的隨身殘存包（只顯示你已放入盒內及已完成改裝的項目）：
            </div>

            {myItems.length === 0 && myEnabledMods.length === 0 ? (
              <div className="text-center py-8 text-stone-500 text-sm">
                你的鐵盒空空如也！請先返回第一步執拾殘存包，或按上方「載入標準示範殘存包」。
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {myItems.map((item) => {
                  const chosen = selectedTools.includes(item.id);
                  const isValid = scenario.validItemIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleSelectTool(item.id)}
                      className={`p-3 rounded-xl border-2 text-left transition flex flex-col items-start gap-1.5 cursor-pointer ${
                        submitted && chosen
                          ? isValid
                            ? 'bg-emerald-50 border-emerald-600'
                            : 'bg-rose-50 border-rose-500'
                          : chosen
                          ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                          : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <ItemArtwork itemId={item.id} className="w-7 h-7" />
                        {submitted && chosen && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isValid
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-600 text-white'
                            }`}
                          >
                            {isValid ? '有效!' : '不適用'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold leading-snug">
                        {item.name}
                      </div>
                    </button>
                  );
                })}

                {myEnabledMods.map((mk) => {
                  const key = `mod:${mk}`;
                  const chosen = selectedTools.includes(key);
                  const isValid = Boolean(scenario.validModKeys?.includes(mk));
                  return (
                    <button
                      key={key}
                      onClick={() => toggleSelectTool(key)}
                      className={`p-3 rounded-xl border-2 text-left transition flex flex-col justify-between gap-1.5 cursor-pointer ${
                        submitted && chosen
                          ? isValid
                            ? 'bg-emerald-50 border-emerald-600'
                            : 'bg-rose-50 border-rose-500'
                          : chosen
                          ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-sm'
                          : 'bg-amber-50/60 text-stone-800 border-amber-300 hover:border-amber-500'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-950">
                          盒身改裝
                        </span>
                        {submitted && chosen && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isValid
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-600 text-white'
                            }`}
                          >
                            {isValid ? '有效!' : '次要'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold leading-snug">
                        {MOD_LABELS[mk].name}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submit / Reset Buttons */}
          {!submitted ? (
            <div className="flex items-center gap-3">
              <button
                disabled={selectedTools.length === 0}
                onClick={handleSubmit}
                className="px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-bold text-sm transition cursor-pointer disabled:cursor-not-allowed"
              >
                確認組合並執行應急行動！
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Result Feedback Panel */}
              <div
                className={`rounded-2xl p-5 border-2 space-y-3 ${
                  evaluation.passed
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                    : 'bg-amber-50 border-amber-400 text-stone-900'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {evaluation.passed ? (
                      <ShieldCheck className="w-6 h-6 text-emerald-700" />
                    ) : (
                      <Flame className="w-6 h-6 text-amber-600" />
                    )}
                    <h4 className="text-base sm:text-lg font-black">
                      {evaluation.passed
                        ? `成功化解危機！你揀中了 ${evaluation.hits.length} 項關鍵求生工具！`
                        : `差少少！你揀中了 ${evaluation.hits.length} 項有效工具（需最少 ${scenario.requiredCount} 項且避免亂揀無關物品）`}
                    </h4>
                  </div>

                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setSelectedTools([]);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs font-bold text-stone-800 hover:bg-stone-100 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    重新揀選
                  </button>
                </div>

                {/* Missing from Tin Warning — huge learning moment! */}
                {evaluation.missingInTinNames.length > 0 && (
                  <div className="bg-white/90 rounded-xl p-3.5 border border-amber-300 text-xs text-stone-800">
                    <strong className="text-amber-900">
                      執盒檢討發現：
                    </strong>{' '}
                    你的殘存包內原來未預備好{' '}
                    <span className="font-bold text-rose-700">
                      {evaluation.missingInTinNames.join('、')}
                    </span>
                    ！可返回「第一步：執盒工作坊」補齊裝備。
                  </div>
                )}

                {/* Step-by-step tactical breakdown */}
                <div className="bg-white rounded-xl p-4 border border-emerald-200 space-y-2.5">
                  <div className="font-extrabold text-sm text-emerald-900">
                    {scenario.comboExplanation.headline}
                  </div>
                  <ol className="space-y-2 text-xs sm:text-sm text-stone-700 list-decimal list-inside">
                    {scenario.comboExplanation.steps.map((step, i) => (
                      <li key={i} className="leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ol>
                  <div className="pt-2 border-t border-stone-100 flex items-start gap-2 text-xs text-amber-900 font-semibold">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{scenario.comboExplanation.scoutWisdom}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
