<script lang="ts">
  import PetRender from './lib/PetRender.svelte';

  let swfUrl = '';
  let petRender: PetRender;
  let status = '请选择SWF文件或输入URL';
  let urlInput = '';
  let customSuffix = '';

  const handleFileSelect = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      swfUrl = URL.createObjectURL(file)+ customSuffix;
      status = `已加载: ${file.name}${customSuffix}`;
    }
  };

  const play = () => {
    petRender?.play();
    status = '播放中...';
  };

  const pause = () => {
    petRender?.pause();
    status = '已暂停';
  };

  const stop = () => {
    petRender?.stop();
    status = '已停止';
  };

  const handleUrlSubmit = () => {
    if (urlInput.startsWith('http://') || urlInput.startsWith('https://')) {
      swfUrl = urlInput + customSuffix;
      status = `已加载URL: ${urlInput}${customSuffix}`;
    } else {
      status = '请输入有效的HTTP/HTTPS URL';
    }
  };
</script>

<main>

  <div class="controls">
    <div class="input-group">
      <input type="file" accept=".swf" on:change={handleFileSelect} />
      <div class="url-input">
        <input 
          type="text" 
          bind:value={urlInput}
          placeholder="输入SWF文件URL"
        />
        <input
          type="text"
          bind:value={customSuffix}
          placeholder="输入后缀参数"
        />
        <button on:click={handleUrlSubmit}>加载URL</button>
      </div>
    </div>
    <div class="player-buttons">
      <button on:click={play} disabled={!swfUrl}>播放</button>
      <button on:click={pause} disabled={!swfUrl}>暂停</button>
      <button on:click={stop} disabled={!swfUrl}>停止</button>
    </div>
  </div>

  <div class="status">{status}</div>

  <div class="player-container">
    <PetRender bind:this={petRender} {swfUrl} />
  </div>
</main>

<style>
  main {
    max-width: 1600px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }

  .controls {
    margin: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    max-width: 500px;
  }

  .url-input {
    display: flex;
    gap: 0.5rem;
  }

  .url-input input {
    flex-grow: 1;
    padding: 0.5rem;
  }

  .player-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .player-container {
    width: 1600px;
    height: 900px;
    margin: 1rem auto;
    border: 1px solid #ccc;
  }

  .status {
    margin: 1rem 0;
    font-style: italic;
    color: #666;
  }

  button {
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
</style>
