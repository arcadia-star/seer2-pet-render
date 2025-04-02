<svelte:options customElement={{ tag: "pet-render" }} />

<script>
  // @ts-nocheck
  import { onMount, onDestroy } from "svelte";

  export let prop = { url: "" };
  let player = null;
  const swfUrl = "petContainer.swf";
  let container = null;
  let animationMeta = null;
  let callbacks = {
    onAnimationComplete: null,
    onHit: null,
  };

  const loadRuffle = async () => {
    if (window.RufflePlayer) return;
  };

  if (!window.handleEventFromSWF) {
    window.handleEventFromSWF = (eventName, data) => {
      console.debug(`收到 SWF 事件: ${eventName}`, data);
      switch (eventName) {
        case "animationComplete":
          if (callbacks.onAnimationComplete) {
            callbacks.onAnimationComplete(data);
          }
          break;
        case "hit":
          if (callbacks.onHit) {
            callbacks.onHit(data);
          }
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

    player.ruffle().load({
      url: `${swfUrl}?url=${encodeURIComponent(prop.url)}`,
      allowScriptAccess: true, // 需要允许脚本访问以支持ExternalInterface
      wmode: "transparent",
      logLevel: "debug",
      "upgradeToHttps": window.location.protocol === "https:",
    });

    // 监听SWF事件
    player.addEventListener("loadedmetadata", handleSWFReady);
  };

  const destroyPlayer = () => {
    if (player && container) {
      player.removeEventListener("loadedmetadata", handleSWFReady);
      container.removeChild(player);
      player = null;
    }
  };

  // 处理SWF准备就绪事件
  function handleSWFReady() {
    console.log("swfready");
    dispatchEvent(new CustomEvent("swfready"));
  }

  // 处理动画完成事件
  function handleAnimationComplete(e) {
    if (!player || !callbacks.onAnimationComplete) return;
    const state = getState();
    if (state) {
      callbacks.onAnimationComplete({
        state: state,
        duration: e.duration,
      });
    }
  }

  // 处理命中事件
  function handleHit(e) {
    if (callbacks.onHit) {
      callbacks.onHit({
        state: getState(),
      });
    }
  }

  // 接收动画元数据
  function handleAnimationMeta(meta) {
    animationMeta = meta;
    dispatchEvent(new CustomEvent("animationmetaready", { detail: meta }));
  }

  onMount(async () => {
    await loadRuffle();
    createPlayer();
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
