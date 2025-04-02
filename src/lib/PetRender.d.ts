import { SvelteComponentTyped } from 'svelte';

export interface AnimationCompleteEvent {
  detail: {
    instanceId: string;
    animationName?: string;
    [key: string]: unknown;
  };
}

export interface HitEvent {
  detail: {
    instanceId: string;
    hitType?: string;
    [key: string]: unknown;
  };
}

export interface SWFReadyEvent {
  detail: {
    instanceId: string;
  };
}

export default class PetRender extends SvelteComponentTyped<{
  url: string;
  onswfready?: (event: CustomEvent<SWFReadyEvent>) => void;
  onanimationComplete?: (event: CustomEvent<AnimationCompleteEvent>) => void;
  onhit?: (event: CustomEvent<HitEvent>) => void;
}> {
  /** 设置战斗状态 */
  setState(state: string): void;
  
  /** 获取当前状态 */
  getState(): string | null;
  
  /** 获取可用状态列表 */
  getAvailableStates(): string[];
  
  /** 播放动画 */
  play(): void;
  
  /** 暂停动画 */
  pause(): void;
  
  /** 停止动画 */
  stop(): void;
  
  /** 等待组件完全就绪 */
  whenReady(): Promise<void>;
}
