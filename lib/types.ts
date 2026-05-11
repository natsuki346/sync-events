export type Phase =
  | "学生"
  | "休学中"
  | "起業準備中"
  | "起業中"
  | "会社員"
  | "フリーランス";

export type Direction = "起業" | "副業" | "転職" | "スキルアップ" | "投資" | "その他";

export type Trait =
  | "クリエイティブ"
  | "論理思考"
  | "行動力"
  | "探究心"
  | "コミュニケーション"
  | "リーダーシップ";

export interface SyncEvent {
  id: string;
  name: string;
  date: string;
  description: string;
  createdAt: string;
}

export interface MyProfile {
  id: string; // permanent UUID, used as participant ID across events
  displayName: string;
  phase: Phase;
  directions: Direction[];
  traits: Trait[];
  hashtags: string[];
  bio: string;
}

export interface Participant {
  id: string; // = MyProfile.id (snapshot at join time)
  eventId: string;
  displayName: string;
  phase: Phase;
  directions: Direction[];
  traits: Trait[];
  hashtags: string[];
  bio: string;
  joinedAt: string;
}

export interface TalkRequest {
  id: string;
  eventId: string;
  fromId: string;
  toId: string;
  createdAt: string;
}

export interface MatchedParticipant extends Participant {
  score: number;
  breakdown: {
    phase: number;
    directions: number;
    traits: number;
    hashtags: number;
  };
}
