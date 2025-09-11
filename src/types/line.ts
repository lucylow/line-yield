export interface LiffConfig {
  liffId: string;
  withLogin?: boolean;
}

export interface LiffUser {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface LiffContext {
  type: 'utou' | 'room' | 'group' | 'none';
  userId?: string;
  roomId?: string;
  groupId?: string;
}