if (!window.electronAPI) {
  (window as any).electronAPI = {
    invoke: (channel: string, ...args: any[]) => {

      return Promise.resolve({ success: true, data: [] });
    }
  };
}
