# 童軍互動「殘存小包」訓練工作坊 (Scout Interactive Survival Tin Workshop)

專為童軍團集會、遠足考章及全民防災教育設計的 React + TypeScript + Tailwind CSS 互動教學應用，貫徹童軍銘言 **「準備（Be Prepared）」**。

## 主要功能

1. **跨組別雙難度切換**
   - **基礎模式（幼童軍 6×4 格）**：圖示清晰、說明淺白，並自動過濾裸露刀片、生火火柴及過時藥水等高風險物資。
   - **進階模式（童軍／深資童軍 8×5 格）**：完整涵蓋 1:25,000 透明膠片座標尺（Romer Card）、蠟封火柴、摩斯密碼表、魚絲細鉤等經典工藝與現代改良物資對照。
2. **可動式 360° 互動鐵盒工作坊**
   - 支援**拖放（Drag & Drop）**、**觸控點擊擺放**及 **90° 旋轉排位**，混入常見錯誤陷阱物品（如易溶牛奶朱古力、已淘汰紅藥水、大型尿袋等）。
   - 可切換改裝鐵盒四個部位：**盒內收納與消毒棉花填隙**、**盒蓋打磨反光求救鏡**、**盒底摩斯密碼表（附 SOS 聲光播放）與防水電工膠布封邊**、**盒面自動生成位置圖與緊急聯絡人名卡**。
   - 內置領袖經典檢查法：**「搖盒防響測試」**。
3. **突發求生情境實戰**
   - 直接讀取成員自己執好的殘存包，挑戰山野濃霧迷途、石澗擦傷拔刺、大帽山驟雨失溫，以及現代城市極端天氣大停電情境。
4. **各國儲糧與防災延伸專區**
   - 客觀講解為何各國提倡應急儲備，透過「三層防災準備體系」（隨身殘存包 vs 72小時走佬袋 vs 家庭日常循環儲備 Rolling Stock）及小隊分類搶答遊戲建立正確防災觀念。
5. **1:1 盒面位置圖列印與全圖鑑**
   - 一鍵列印 A4 實體工作紙（含依成員排位自動繪製的盒面位置圖、人名卡、盒底摩斯密碼貼紙及每四星期檢查表），可直接剪下封膠放入真實喉糖鐵盒。

---

## 本地開發與自動化測試

需安裝 Node.js（建議 v18 或 v20+）：

```bash
npm install
npm test        # 執行 Vitest 單元與全流程互動測試
npm run dev     # 啟動開發伺服器 (http://localhost:5173)
npm run build   # 輸出投產版本至 dist/
```

---

## 上傳至 Git 並連接 Vercel 部署步驟

此專案已包含 `.gitignore` 及 `vercel.json`，解壓縮後可直接推送至 GitHub / GitLab：

```bash
git init
git add .
git commit -m "Initial commit: 童軍互動殘存包工作坊"
git branch -M main
git remote add origin <你的-Git-Repository-網址>
git push -u origin main
```

推送完成後：
1. 登入 [Vercel](https://vercel.com/) 並按 **Add New... → Project**。
2. 選擇剛才上傳的 Git Repository 按 **Import**。
3. Vercel 會自動識別 **Vite** 框架（Build Command：`npm run build`、Output Directory：`dist`），直接按 **Deploy** 即可獲得公開網址！
