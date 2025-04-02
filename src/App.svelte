<script lang="ts">
  import PetRender from "./lib/PetRender.svelte";
  import { ActionState } from "./actionscript/FighterActionType";

  let url = $state("fight/100.swf");
  let petRender: PetRender;
  let status = $state("请选择SWF文件或输入URL");
  let urlInput = $state("fight/100.swf");
  let currentState = $state("");
  let animationMeta: any = null;
  let debugLogs: string[] = $state([]);
  let availableStates: string[] = $state([]);
  let reverse = $state(false);

  const handleFileSelect = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      url = URL.createObjectURL(file);
      status = `已加载: ${file.name}`;
    }
  };

  const handleAnimationComplete = (e: CustomEvent) => {
    addLog(`动画完成: ${JSON.stringify(e.detail)}`);
    console.log(e.detail);
  };

  const handleHit = (e: CustomEvent) => {
    addLog(`命中事件: ${JSON.stringify(e.detail)}`);
    console.log(e.detail);
  };

  const addLog = (message: string) => {
    debugLogs = [message, ...debugLogs].slice(0, 50);
  };

  const play = () => {
    petRender?.play();
    status = "播放中...";
    addLog("播放命令已发送");
  };

  const pause = () => {
    petRender?.pause();
    status = "已暂停";
    addLog("暂停命令已发送");
  };

  const stop = () => {
    petRender?.stop();
    status = "已停止";
    addLog("停止命令已发送");
  };

  const setState = (state: string) => {
    petRender?.setState(state);
    currentState = state;
    addLog(`设置状态: ${state}`);
  };

  const getState = () => {
    currentState = petRender?.getState() || "";
    addLog(`当前状态: ${currentState}`);
    return currentState;
  };

  const handleUrlSubmit = () => {
    url = urlInput;
    status = `已加载URL: ${urlInput}`;
  };

  const handleSWFReady = async () => {
    addLog("SWF准备就绪");
    await petRender?.whenReady();
    addLog("所有就绪条件满足");
    getState();
    updateAvailableStates();
  };

  const updateAvailableStates = () => {
    availableStates = petRender?.getAvailableStates() || [];
    addLog(`可用状态: ${JSON.stringify(availableStates)}`);
  };
</script>

<main>
  <div class="container">
    <div class="left-panel">
      <div class="controls">
        <div class="input-group">
          <input type="file" accept=".swf" onchange={handleFileSelect} />
          <div class="url-input">
            <input
              type="text"
              bind:value={urlInput}
              placeholder="输入SWF文件URL"
            />
            <button onclick={handleUrlSubmit}>加载URL</button>
          </div>
        </div>
        <div class="reverse-control">
          <label>
            <input type="checkbox" bind:checked={reverse} />
            水平翻转
          </label>
        </div>
        <div class="player-buttons">
          <button onclick={play} disabled={!url}>播放</button>
          <button onclick={pause} disabled={!url}>暂停</button>
          <button onclick={stop} disabled={!url}>停止</button>
        </div>
        <div class="state-buttons">
          {#each Object.values(ActionState) as state}
            <button
              onclick={() => setState(state)}
              disabled={!url || !availableStates.includes(state)}
            >
              {state}
            </button>
          {/each}
        </div>
        <button
          onclick={() => {
            getState();
            updateAvailableStates();
          }}
          disabled={!url}>获取当前状态</button
        >
      </div>

      <div class="status">{status}</div>
      <div class="debug-info">
        <h3>当前状态: {currentState}</h3>
        {#if animationMeta}
          <h3>动画元数据</h3>
          <pre>{JSON.stringify(animationMeta, null, 2)}</pre>
        {/if}
      </div>
    </div>

    <div class="right-panel">
      <div class="player-container">
        <PetRender
          bind:this={petRender}
          {url}
          on:swfready={handleSWFReady}
          on:animationComplete={handleAnimationComplete}
          on:hit={handleHit}
          {reverse}
        />
      </div>
      <div class="debug-logs">
        <h3>调试日志</h3>
        {#each debugLogs as log}
          <div class="log-entry">{log}</div>
        {/each}
      </div>
    </div>
  </div>
</main>

<style>
  main {
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
  }

  .container {
    display: grid;
    grid-template-columns: 300px 1fr;
    width: 100%;
    height: 100%;
    gap: 0;
  }

  .left-panel {
    background: #f0f0f0;
    padding: 1rem;
    height: 100vh;
    overflow-y: auto;
  }

  .right-panel {
    position: relative;
  }

  .controls {
    margin: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .url-input {
    display: flex;
    gap: 0.5rem;
  }

  .url-input input {
    flex-grow: 1;
    padding: 0.5rem;
  }

  .player-buttons,
  .state-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .state-buttons button {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
  }

  .player-container {
    width: 100%;
    height: 100%;
    border: 1px solid #ccc;
    margin: 0 auto;
  }

  .status {
    margin: 1rem 0;
    font-style: italic;
    color: #000;
  }

  button {
    padding: 0.5rem 1rem;
    cursor: pointer;
  }

  .debug-info {
    margin: 1rem 0;
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 4px;
  }

  .debug-logs {
    position: fixed;
    right: 20px;
    top: 20px;
    width: 400px;
    max-height: 80vh;
    overflow-y: auto;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 100;
  }

  .log-entry {
    padding: 0.5rem;
    border-bottom: 1px solid #ddd;
    font-family: monospace;
    font-size: 0.9rem;
    color: #000;
  }

  pre {
    white-space: pre-wrap;
    font-size: 0.8rem;
  }
</style>
