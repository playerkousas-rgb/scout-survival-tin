export type DifficultyMode = 'basic' | 'advanced';

export type ItemCategory =
  | 'signal'
  | 'fire'
  | 'nav'
  | 'firstaid'
  | 'repair'
  | 'trap';

export type ItemEra = 'classic' | 'modern' | 'both' | 'trap';

export interface SurvivalItem {
  id: string;
  name: string;
  englishName: string;
  shortLabel: string;
  width: number;
  height: number;
  category: ItemCategory;
  era: ItemEra;
  availableInBasic: boolean;
  essentialInBasic?: boolean;
  color: string;
  borderColor: string;
  textColor: string;
  summary: string;
  primaryUse: string;
  hiddenUses: string[];
  scoutNote: string;
  safetyTip?: string;
  trapReason?: string;
}

export interface PlacedItem {
  itemId: string;
  x: number;
  y: number;
  rotated: boolean;
}

export interface TinModifications {
  polishedMirrorLid: boolean;
  morseCodeBottom: boolean;
  waterproofTapeRim: boolean;
  cottonPadding: boolean;
  positionMapTop: boolean;
  nameCardFilled: boolean;
  ownerName: string;
  troopName: string;
  emergencyPhone: string;
  medicalNote: string;
}

export type ModKey =
  | 'polishedMirrorLid'
  | 'morseCodeBottom'
  | 'waterproofTapeRim'
  | 'cottonPadding'
  | 'positionMapTop'
  | 'nameCardFilled';

export interface EmergencyScenario {
  id: string;
  title: string;
  badge: string;
  locationTag: string;
  minDifficulty: DifficultyMode;
  situation: string;
  promptQuestion: string;
  validItemIds: string[];
  validModKeys?: ModKey[];
  requiredCount: number;
  comboExplanation: {
    headline: string;
    steps: string[];
    scoutWisdom: string;
  };
}

export interface StockpileQuizItem {
  id: string;
  name: string;
  correctTier: 'tin' | 'bag72' | 'home';
  reason: string;
}
