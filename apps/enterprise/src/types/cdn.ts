export interface CDNConfig {
  provider: string;
  domain: string;
  apiKey: string;
  enabled: boolean;
  cacheControl: string;
  compression: boolean;
  sslEnabled: boolean;
  regions: string[];
}

export interface CDNStats {
  bandwidth: number;
  requests: number;
  cacheHitRate: number;
  latency: number;
  errors: number;
} 