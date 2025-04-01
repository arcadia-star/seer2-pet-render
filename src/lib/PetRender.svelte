<svelte:options customElement={{ tag: "pet-render" }} />

<script>
  // @ts-nocheck
  import { onMount, onDestroy } from "svelte";

  export let swfUrl = "";

  let player = null;
  let container = null;

  const loadRuffle = async () => {
    if (window.RufflePlayer) return;
  };

  const createPlayer = () => {
    if (!container || !swfUrl) return;

    const Ruffle = window.RufflePlayer?.newest();
    if (!Ruffle) return;

    player = Ruffle.createPlayer();
    player.style.width = "100%";
    player.style.height = "100%";
    container.appendChild(player);

    player.ruffle().load({
      url: swfUrl,
      allowScriptAccess: false,
      wmode: 'transparent',
    });
  };

  const destroyPlayer = () => {
    if (player && container) {
      container.removeChild(player);
      player = null;
    }
  };

  onMount(async () => {
    await loadRuffle();
    createPlayer();
  });

  onDestroy(() => {
    destroyPlayer();
  });

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
    if (swfUrl && player) {
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
  }
</style>
