export interface IndexConfig {
  name: string;
  collection: string;
  fields: IndexField[];
  type: 'single' | 'compound' | 'text' | 'geospatial';
  unique: boolean;
  sparse: boolean;
  background: boolean;
  ttl?: number;
  status: 'active' | 'building' | 'failed';
  size: number;
  lastUsed?: Date;
}

export interface IndexField {
  field: string;
  order: 'asc' | 'desc' | '2d' | '2dsphere';
}

export interface IndexStats {
  totalIndexes: number;
  totalSize: number;
  averageSize: number;
  mostUsedIndexes: IndexConfig[];
  recentlyModified: IndexConfig[];
  performanceImpact: {
    readLatency: number;
    writeLatency: number;
    queryTime: number;
  };
}

export interface DatabaseConfig {
  type: 'mongodb' | 'postgresql' | 'mysql';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
  idleTimeout: number;
} 