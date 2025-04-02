<script lang="ts">
  import PetRender from "./lib/PetRender.svelte";
  import { ActionState } from "./actionscript/FighterActionType";

  let prop = { url: "fight/100.swf" };
  let petRender: PetRender;
  let status = "请选择SWF文件或输入URL";
  let urlInput = "fight/100.swf";
  let currentState = "";
  let animationMeta: any = null;
  let debugLogs: string[] = [];
  let availableStates: string[] = [];
  let lastState = "";

  const handleFileSelect = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      prop.url = URL.createObjectURL(file);
      status = `已加载: ${file.name}`;
    }
  };

  const handleAnimationComplete = (e: CustomEvent) => {
    if (currentState !== lastState) {
      addLog(`动画完成: ${JSON.stringify(e.detail)}`);
      console.log(e.detail);
      lastState = currentState;
    }
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
    lastState = ""; // 重置lastState以强制下次动画完成时记录
  };

  const getState = () => {
    currentState = petRender?.getState() || "";
    addLog(`当前状态: ${currentState}`);
    return currentState;
  };

  const handleUrlSubmit = () => {
    prop.url = urlInput;
    status = `已加载URL: ${urlInput}`;
  };

  const handleSWFReady = () => {
    addLog("SWF准备就绪");
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
          <input type="file" accept=".swf" on:change={handleFileSelect} />
          <div class="url-input">
            <input
              type="text"
              bind:value={urlInput}
              placeholder="输入SWF文件URL"
            />
            <button on:click={handleUrlSubmit}>加载URL</button>
          </div>
        </div>
        <div class="player-buttons">
          <button on:click={play} disabled={!prop.url}>播放</button>
          <button on:click={pause} disabled={!prop.url}>暂停</button>
          <button on:click={stop} disabled={!prop.url}>停止</button>
        </div>
        <div class="state-buttons">
          {#each Object.values(ActionState) as state}
            <button
              on:click={() => setState(state)}
              disabled={!prop.url || !availableStates.includes(state)}
            >
              {state}
            </button>
          {/each}
        </div>
        <button
          on:click={() => {
            getState();
            updateAvailableStates();
          }}
          disabled={!prop.url}>获取当前状态</button
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
          {prop}
          on:swfready={handleSWFReady}
          on:animationComplete={handleAnimationComplete}
          on:hit={handleHit}
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
    max-width: 1800px;
    margin: 0 auto;
    padding: 2rem;
  }

  .container {
    display: flex;
    gap: 2rem;
  }

  .left-panel {
    flex: 1;
    max-width: 400px;
  }

  .right-panel {
    flex: 2;
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
    width: 1200px;
    height: 600px;
    border: 1px solid #ccc;
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
    margin-top: 1rem;
    max-height: 300px;
    overflow-y: auto;
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 4px;
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
