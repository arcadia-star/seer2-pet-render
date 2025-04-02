<svelte:options customElement={{ tag: "pet-render" }} />

<script>
  // @ts-nocheck
  import { onMount, onDestroy } from "svelte";
  import { createEventDispatcher } from "svelte";

  export let prop = { url: "" };
  let player = null;
  const swfUrl = "petContainer.swf";
  let container = null;
  let animationMeta = null;
  const dispatch = createEventDispatcher();
  let callbacksReady = false;
  let readyPromiseResolve;
  const readyPromise = new Promise(resolve => {
    readyPromiseResolve = resolve;
  });

  const loadRuffle = async () => {
    if (window.RufflePlayer) return;
  };

  if (!window.handleEventFromSWF) {
    window.handleEventFromSWF = (eventName, data) => {
      console.debug(`收到 SWF 事件: ${eventName}`, data);
      switch (eventName) {
        case "animationComplete":
          dispatch("animationComplete", data);
          break;
        case "hit":
          dispatch("hit", data);
          break;
        default:
          console.warn(`未知事件: ${eventName}`);
      }
    };
  }

  const createPlayer = () => {
    if (!container || !swfUrl) return;

    const Ruffle = window.RufflePlayer?.newest();
    if (!Ruffle) return;

    player = Ruffle.createPlayer();
    player.style.width = "100%";
    player.style.height = "100%";
    container.appendChild(player);

    player
      .ruffle()
      .load({
        url: `${swfUrl}?url=${encodeURIComponent(prop.url)}`,
        allowScriptAccess: true, // 需要允许脚本访问以支持ExternalInterface
        wmode: "transparent",
        logLevel: "debug",
        autoplay: "on",
        unmuteOverlay:"hidden",
        upgradeToHttps: window.location.protocol === "https:",
      })
      .then(() => {
        handleSWFReady();
      });
  };

  const destroyPlayer = () => {
    if (player && container) {
      container.removeChild(player);
      player = null;
    }
  };

  // 处理SWF准备就绪事件
  function handleSWFReady() {
    console.log("swfready");
    readyPromiseResolve();
    dispatch("swfready");
  }

  // 等待完全就绪
  export async function whenReady() {
    await readyPromise;
    while (!callbacksReady) {
      await new Promise(r => setTimeout(r, 16)); // 等待1帧
    }
  }

  onMount(async () => {
    await loadRuffle();
    createPlayer();
    
    // 监听回调就绪事件
    window.addEventListener('message', (e) => {
      if (e.data === 'petRenderCallbacksReady') {
        callbacksReady = true;
      }
    });
  });

  onDestroy(() => {
    destroyPlayer();
  });

  // 设置战斗状态
  export function setState(state) {
    if (!player) return;
    try {
      player.setState(state);
    } catch (e) {
      console.error("调用setState失败:", e);
    }
  }

  // 获取当前状态
  export function getState() {
    if (!player) return null;
    try {
      return player.getState();
    } catch (e) {
      console.error("调用getCurrentState失败:", e);
      return null;
    }
  }

  // 获取可用状态列表
  export function getAvailableStates() {
    if (!player) return [];
    try {
      return player.getAvailableStates();
    } catch (e) {
      console.error("调用getAvailableStates失败:", e);
      return [];
    }
  }

  // 播放控制方法
  export function play() {
    player?.play();
  }

  export function pause() {
    player?.pause();
  }

  export function stop() {
    destroyPlayer();
    createPlayer();
  }

  // 属性变化监听
  $: {
    if (prop.url && player) {
      stop();
    }
  }
</script>

<div bind:this={container} class="pet-container"></div>

<style>
  .pet-container {
    width: 100%;
    height: 100%;
    display: block;
    logo-display: none;
  }
</style>
