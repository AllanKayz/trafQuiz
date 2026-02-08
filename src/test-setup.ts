if (!window.electronAPI) {
  (window as any).electronAPI = {
    invoke: (channel: string, ...args: any[]) => {
      console.log(`Mocking Electron IPC: ${channel}`, args);
      return Promise.resolve({ success: true, data: [] });
    },
    on: (channel: string, _func: Function) => {
      console.log(`Mocking Electron ON: ${channel}`);
    },
    removeListener: (channel: string, _func: Function) => {
      console.log(`Mocking Electron removeListener: ${channel}`);
    }
  };
}
