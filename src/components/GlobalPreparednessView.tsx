import React, { useState } from 'react';
import {
  CheckCircle2,
  CloudLightning,
  Globe,
  HelpCircle,
  Home,
  Shield,
  Smartphone,
  Users,
} from 'lucide-react';
import {
  PREPAREDNESS_TIERS,
  STOCKPILE_SORTING_QUIZ,
} from '../data/survivalData';
import { playTinSnap, playTrapBuzz } from '../utils/soundEffects';

interface GlobalPreparednessViewProps {
  muted: boolean;
}

export const GlobalPreparednessView: React.FC<GlobalPreparednessViewProps> = ({
  muted,
}) => {
  const [answers, setAnswers] = useState<
    Record<string, 'tin' | 'bag72' | 'home'>
  >({});

  const handleGuess = (
    itemId: string,
    choice: 'tin' | 'bag72' | 'home',
    correct: 'tin' | 'bag72' | 'home'
  ) => {
    setAnswers((prev) => ({ ...prev, [itemId]: choice }));
    if (choice === correct) {
      playTinSnap(muted);
    } else {
      playTrapBuzz(muted);
    }
  };

  return (
    <div className="space-y-8">
      {/* Section 1: Why Countries Ask Citizens to Stockpile — Calm Scout Framing */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="max-w-3xl space-y-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900">
            <Globe className="w-3.5 h-3.5" />
            時事延伸教材 · 居安思危而非製造恐慌
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900">
            點解近年各國政府紛紛呼籲市民儲備物資？同童軍「殘存包」有咩關係？
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            近年不論是日本的「日常循環備蓄（Rolling Stock）」、歐盟與北歐各國派發的「72 小時全民應急手冊」，以至香港在超強颱風與極端暴雨後的防災宣傳，背後其實都有非常實際的科學原因——而這正好與童軍百年銘言{' '}
            <strong className="text-emerald-800">「準備 Be Prepared」</strong>{' '}
            一脈相承！
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4 space-y-2">
            <CloudLightning className="w-6 h-6 text-amber-600" />
            <h3 className="font-extrabold text-sm text-stone-900">
              1. 極端天氣更頻繁
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              世紀暴雨、十號風球或水浸可能令大廈短暫停水停電、道路受阻，家中備有數日水糧便無需冒險外出。
            </p>
          </div>

          <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4 space-y-2">
            <Smartphone className="w-6 h-6 text-sky-600" />
            <h3 className="font-extrabold text-sm text-stone-900">
              2. 數碼生活的脆弱性
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              現代人高度依賴手機支付、電子地圖與電磁爐。一旦停電或網絡中斷，傳統現金、紙筆、哨子與火源反而最可靠。
            </p>
          </div>

          <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4 space-y-2">
            <Users className="w-6 h-6 text-emerald-700" />
            <h3 className="font-extrabold text-sm text-stone-900">
              3. 黃金72小時自助互助
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              大型事故發生首三天，救援隊須優先搶救重傷者與長者。市民能自給自足並避免搶購潮，本身就是對社會最大的幫助！
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-2">
            <Shield className="w-6 h-6 text-emerald-800" />
            <h3 className="font-extrabold text-sm text-emerald-950">
              4. 童軍「準備」精神起點
            </h3>
            <p className="text-xs text-emerald-900 leading-relaxed">
              學會收拾一個小小的「隨身殘存包」，就是訓練成員分辨輕重緩急、定期檢查物資與冷靜應變的最佳起點！
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: 3-Tier Preparedness System */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-black text-stone-900 flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-800" />
            三層防災準備體系：由「口袋鐵盒」延伸至「家庭儲備」
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {PREPAREDNESS_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-3xl border-2 overflow-hidden shadow-xs flex flex-col ${tier.colorClass}`}
            >
              <div className={`px-5 py-4 ${tier.headerClass}`}>
                <div className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                  {tier.tierBadge}
                </div>
                <h4 className="text-lg font-extrabold mt-0.5">{tier.title}</h4>
                <div className="text-xs opacity-85 mt-1">{tier.weight}</div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-xs sm:text-sm">
                <div className="space-y-3">
                  <div className="bg-white/80 rounded-xl p-2.5 border border-black/10 text-xs">
                    <span className="font-bold text-stone-900">擺放位置：</span>
                    <span className="text-stone-700">{tier.keepWhere}</span>
                  </div>
                  <p className="text-stone-700 leading-relaxed text-xs">
                    {tier.purpose}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-3.5 border border-black/10 space-y-1.5">
                  <div className="text-xs font-extrabold text-stone-900">
                    代表性物資清單：
                  </div>
                  <ul className="space-y-1 text-xs text-stone-700">
                    {tier.keyItems.map((it, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-700 font-bold">✓</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Interactive Troop Sorting Mini-Game */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              小隊搶答互動：呢件物資應該放邊一層？
            </h3>
            <p className="text-xs text-stone-500">
              團集會時可投影出來讓小隊搶答，學習按「體積、重量與應急時效」正確分工！
            </p>
          </div>
          {Object.keys(answers).length > 0 && (
            <button
              onClick={() => setAnswers({})}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 cursor-pointer"
            >
              重置問答
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STOCKPILE_SORTING_QUIZ.map((q) => {
            const picked = answers[q.id];
            const isCorrect = picked === q.correctTier;
            return (
              <div
                key={q.id}
                className={`rounded-2xl border p-4 space-y-3 transition ${
                  picked
                    ? isCorrect
                      ? 'bg-emerald-50/70 border-emerald-400'
                      : 'bg-amber-50/70 border-amber-400'
                    : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="font-extrabold text-sm text-stone-900 flex items-center justify-between gap-2">
                  <span>{q.name}</span>
                  {picked && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: 'tin', label: '1. 隨身殘存包' },
                      { id: 'bag72', label: '2. 72小時走佬袋' },
                      { id: 'home', label: '3. 家庭循環儲備' },
                    ] as const
                  ).map((opt) => {
                    const active = picked === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleGuess(q.id, opt.id, q.correctTier)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          active
                            ? opt.id === q.correctTier
                              ? 'bg-emerald-700 text-white border-emerald-800'
                              : 'bg-rose-600 text-white border-rose-700'
                            : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {picked && (
                  <p className="text-xs text-stone-700 leading-relaxed pt-1 border-t border-black/10">
                    <strong>
                      {isCorrect ? '答啱喇！' : '再諗諗！正確答案：'}
                    </strong>{' '}
                    {q.reason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
