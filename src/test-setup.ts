if (!window.electronAPI) {
  (window as any).electronAPI = {
    invoke: (channel: string, ...args: any[]) => {

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
