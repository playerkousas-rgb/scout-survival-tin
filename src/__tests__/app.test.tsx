import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import App from '../App';
import {
  ADVANCED_DEMO_LAYOUT,
  BASIC_DEMO_LAYOUT,
  EMERGENCY_SCENARIOS,
  SURVIVAL_ITEMS,
} from '../data/survivalData';

describe('Scout Survival Tin — Data & Geometry Integrity', () => {
  const itemMap = new Map(SURVIVAL_ITEMS.map((i) => [i.id, i]));

  it('validates BASIC_DEMO_LAYOUT (6x4) has zero overlaps, fits bounds, and uses only Basic items', () => {
    const cols = 6;
    const rows = 4;
    const occupied = new Set<string>();

    for (const placed of BASIC_DEMO_LAYOUT) {
      const def = itemMap.get(placed.itemId);
      expect(def).toBeDefined();
      expect(def!.availableInBasic).toBe(true);
      expect(def!.category).not.toBe('trap');

      const w = placed.rotated ? def!.height : def!.width;
      const h = placed.rotated ? def!.width : def!.height;
      expect(placed.x).toBeGreaterThanOrEqual(0);
      expect(placed.y).toBeGreaterThanOrEqual(0);
      expect(placed.x + w).toBeLessThanOrEqual(cols);
      expect(placed.y + h).toBeLessThanOrEqual(rows);

      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          const cellKey = `${placed.x + dx},${placed.y + dy}`;
          expect(occupied.has(cellKey)).toBe(false);
          occupied.add(cellKey);
        }
      }
    }
  });

  it('validates ADVANCED_DEMO_LAYOUT (8x5) has zero overlaps, fits bounds, and avoids trap items', () => {
    const cols = 8;
    const rows = 5;
    const occupied = new Set<string>();

    for (const placed of ADVANCED_DEMO_LAYOUT) {
      const def = itemMap.get(placed.itemId);
      expect(def).toBeDefined();
      expect(def!.category).not.toBe('trap');

      const w = placed.rotated ? def!.height : def!.width;
      const h = placed.rotated ? def!.width : def!.height;
      expect(placed.x).toBeGreaterThanOrEqual(0);
      expect(placed.y).toBeGreaterThanOrEqual(0);
      expect(placed.x + w).toBeLessThanOrEqual(cols);
      expect(placed.y + h).toBeLessThanOrEqual(rows);

      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          const cellKey = `${placed.x + dx},${placed.y + dy}`;
          expect(occupied.has(cellKey)).toBe(false);
          occupied.add(cellKey);
        }
      }
    }
  });

  it('ensures every scenario has enough valid items available in its target difficulty mode', () => {
    for (const sc of EMERGENCY_SCENARIOS) {
      for (const id of sc.validItemIds) {
        expect(itemMap.has(id)).toBe(true);
      }
      if (sc.minDifficulty === 'basic') {
        const basicValidCount =
          sc.validItemIds.filter((id) => itemMap.get(id)?.availableInBasic)
            .length + (sc.validModKeys?.length || 0);
        expect(basicValidCount).toBeGreaterThanOrEqual(sc.requiredCount);
      }
    }
  });
});

describe('Scout Survival Tin — Full Interactive User Journey', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders workbench, allows packing, rotation, trap warning, rattle check, and full tin customization', () => {
    render(<App />);

    expect(
      screen.getByText('童軍互動「殘存小包」訓練工作坊')
    ).toBeInTheDocument();
    expect(screen.getByText(/已用空間：0 \/ 40 格/)).toBeInTheDocument();

    // Click '扁平高音求生哨' card in tray to hold it, rotate 90 deg, and place at A1
    fireEvent.click(screen.getAllByText('扁平高音求生哨')[0]);
    expect(screen.getByText(/正準備放入：扁平高音求生哨/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /旋轉 90°/ }));
    expect(screen.getByText(/1×2 格/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('A1'));
    expect(screen.getByText(/已用空間：2 \/ 40 格/)).toBeInTheDocument();

    // Test shake check WITHOUT cotton -> warns about rattle
    fireEvent.click(screen.getByRole('button', { name: /搖盒防響測試/ }));
    expect(screen.getByText(/咔啦咔啦響/)).toBeInTheDocument();

    // Enable cotton padding and re-test shake -> passes inspection!
    const cottonCheckbox = screen.getByRole('checkbox', {
      name: /塞入壓扁消毒棉花填滿空隙/,
    });
    fireEvent.click(cottonCheckbox);
    fireEvent.click(screen.getByRole('button', { name: /搖盒防響測試/ }));
    expect(screen.getByText(/通過領袖搖盒檢查/)).toBeInTheDocument();

    // Test placing a Trap item ('牛奶朱古力條') -> triggers trap penalty banner
    const chocoCard = screen
      .getByText('牛奶朱古力條')
      .closest('div[draggable]') as HTMLElement;
    fireEvent.click(within(chocoCard).getByRole('button', { name: '+ 放入' }));
    expect(screen.getByText(/發現不當物品/)).toBeInTheDocument();

    // Remove the trap item -> clears trap warning
    fireEvent.click(within(chocoCard).getByRole('button', { name: '取出' }));
    expect(screen.queryByText(/發現不當物品/)).not.toBeInTheDocument();

    // Test 360° Lid Mirror & Bottom Morse surfaces
    fireEvent.click(screen.getByRole('button', { name: /2. 盒蓋反光鏡/ }));
    fireEvent.click(
      screen.getByRole('button', { name: /動手打磨盒蓋／貼反光鏡面/ })
    );
    expect(
      screen.getByText(/盒蓋內側已打磨拋光成「反光求救鏡」/)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /3. 盒底密碼與封邊/ }));
    fireEvent.click(screen.getByRole('button', { name: /\+ 貼上摩斯密碼表/ }));
    fireEvent.click(
      screen.getByRole('button', { name: /\+ 纏繞防水電工膠布/ })
    );
    expect(screen.getByText('已貼摩斯密碼表 ✓')).toBeInTheDocument();

    // Load full leader demo -> hits 100/100 score!
    fireEvent.click(screen.getByRole('button', { name: /領袖示範排位/ }));
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('completes Scenario Challenge using packed items and adapts cleanly to Basic (Cub Scout) mode', () => {
    render(<App />);

    // Load demo in Advanced mode first, then switch to Scenarios
    fireEvent.click(screen.getByRole('button', { name: /領袖示範排位/ }));
    fireEvent.click(screen.getByRole('button', { name: /2. 突發求生情境實戰/ }));

    // Scenario 1: pick 3 valid tools (扁平高音求生哨, 迷你鈕扣指南針, 短鉛筆與防水記事紙)
    fireEvent.click(screen.getByRole('button', { name: /扁平高音求生哨/ }));
    fireEvent.click(screen.getByRole('button', { name: /迷你鈕扣指南針/ }));
    fireEvent.click(screen.getByRole('button', { name: /短鉛筆與防水記事紙/ }));

    fireEvent.click(
      screen.getByRole('button', { name: /確認組合並執行應急行動/ })
    );
    expect(screen.getByText(/成功化解危機/)).toBeInTheDocument();
    expect(screen.getByText('已過關')).toBeInTheDocument();

    // Select Scenario 4 (Advanced-only) then switch to Basic Mode -> verifies safe clamp to Scenario 1
    fireEvent.click(
      screen.getByRole('button', { name: /情境四：山野驟雨失溫/ })
    );
    fireEvent.click(
      screen.getByRole('button', { name: /基礎模式（幼童軍 6×4）/ })
    );
    expect(
      screen.queryByRole('button', { name: /情境四：山野驟雨失溫/ })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /情境一：西貢山嶺濃霧失散求救/ })
    ).toBeInTheDocument();
  });

  it('renders Global Preparedness 3-tier comparison & quiz, plus Printable Worksheet & Encyclopedia', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<App />);

    // Load demo so position map has items
    fireEvent.click(screen.getByRole('button', { name: /領袖示範排位/ }));

    // Tab 3: Global Preparedness
    fireEvent.click(
      screen.getByRole('button', { name: /3. 各國儲糧與防災延伸/ })
    );
    expect(
      screen.getByText(/點解近年各國政府紛紛呼籲市民儲備物資/)
    ).toBeInTheDocument();

    // Answer first sorting quiz item
    const tinButtons = screen.getAllByRole('button', {
      name: '1. 隨身殘存包',
    });
    fireEvent.click(tinButtons[0]);
    expect(screen.getByText(/答啱喇！/)).toBeInTheDocument();

    // Tab 4: Printable Position Map & Encyclopedia
    fireEvent.click(
      screen.getByRole('button', { name: /4. 位置圖列印與全圖鑑/ })
    );
    expect(
      screen.getByText(/個人《殘存小包盒面位置圖》與定期檢查紀錄卡/)
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /列印／儲存 PDF 工作紙/ })
    );
    expect(printSpy).toHaveBeenCalledTimes(1);

    // Filter Encyclopedia by Trap items
    fireEvent.click(
      screen.getByRole('button', { name: '常見錯誤與淘汰陷阱' })
    );
    expect(screen.getByText('散裝紅藥水／紫藥水小樽')).toBeInTheDocument();
    printSpy.mockRestore();
  });
});
