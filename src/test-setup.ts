if (!window.electronAPI) {
  (window as any).electronAPI = new Proxy({
    on: (channel: string, callback: any) => {
      console.log(`Mocking Electron listener: ${channel}`);
      return () => {};
    }
  }, {
    get: (target, prop) => {
      if (prop in target) return (target as any)[prop];
      return (...args: any[]) => {
        console.log(`Mocking Electron IPC: ${String(prop)}`, args);
        return Promise.resolve({ success: true, data: [] });
      };
    }
  });
}
