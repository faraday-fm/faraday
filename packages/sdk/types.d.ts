export interface FaradayEvents {
  on(event: 'themechange', callback: (theme: string) => void);
  off(event: 'themechange', callback: (theme: string) => void);
}

export declare global {
  const faraday: {
    theme: string;
    events: FaradayEvents;
    fs: {
      readFile(filename: string): Promise<string>;
    };
  };
}
