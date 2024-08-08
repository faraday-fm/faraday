export type Theme = {
  fontFamily: string;
  colors: Record<string, string>;
};

export interface FaradayEvents {
  on(event: "themechange", callback: (theme: Theme) => void);
  off(event: "themechange", callback: (theme: Theme) => void);
}

export declare global {
  const faraday: {
    theme: Theme;
    events: FaradayEvents;
    fs: {
      readFile(filename: string): Promise<string>;
    };
  };
}
