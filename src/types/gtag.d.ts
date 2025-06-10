interface Window {
  gtag: (
    command: 'config' | 'event' | 'set',
    targetId: string,
    config?: {
      page_path?: string;
      page_title?: string;
      page_location?: string;
      send_to?: string;
      event_category?: string;
      event_label?: string;
      value?: number;
      non_interaction?: boolean;
      [key: string]: any;
    }
  ) => void;
}

declare const gtag: Window['gtag']; 