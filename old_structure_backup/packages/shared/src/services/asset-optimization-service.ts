import { z } from 'zod';
import { Logger } from '../monitoring/logger';
import { ErrorService, ErrorCategory, ErrorSeverity } from './error-service';
import { LoggingService } from './logging-service';
import sharp from 'sharp';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

// Asset Optimization Configuration Schema
export const AssetOptimizationConfigSchema = z.object({
  imageOptimization: z.object({
    enabled: z.boolean(),
    formats: z.array(z.enum(['webp', 'avif', 'jpeg', 'png'])),
    quality: z.number().min(0).max(100),
    maxWidth: z.number(),
    responsive: z.boolean(),
    cdn: z.object({
      enabled: z.boolean(),
      domain: z.string().optional(),
      path: z.string().optional()
    })
  }),
  bundling: z.object({
    enabled: z.boolean(),
    minify: z.boolean(),
    sourceMaps: z.boolean(),
    splitChunks: z.boolean(),
    cache: z.boolean()
  }),
  lazyLoading: z.object({
    enabled: z.boolean(),
    preload: z.boolean(),
    prefetch: z.boolean(),
    threshold: z.number()
  }),
  options: z.record(z.unknown()).optional()
});

// Asset Schema
export const AssetSchema = z.object({
  id: z.string(),
  type: z.enum(['image', 'script', 'style', 'component']),
  path: z.string(),
  size: z.number(),
  hash: z.string(),
  metadata: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    format: z.string().optional(),
    quality: z.number().optional(),
    chunks: z.array(z.string()).optional(),
    dependencies: z.array(z.string()).optional()
  }).optional()
});

export type AssetOptimizationConfig = z.infer<typeof AssetOptimizationConfigSchema>;
export type Asset = z.infer<typeof AssetSchema>;

export class AssetOptimizationService {
  private readonly logger: Logger;
  private readonly errorService: ErrorService;
  private readonly loggingService: LoggingService;
  private readonly config: AssetOptimizationConfig;
  private readonly assetCache: Map<string, Asset>;

  constructor(config: AssetOptimizationConfig) {
    this.logger = new Logger();
    this.errorService = new ErrorService();
    this.loggingService = new LoggingService();
    this.config = AssetOptimizationConfigSchema.parse(config);
    this.assetCache = new Map();
  }

  // Image Optimization
  public async optimizeImage(
    imagePath: string,
    options?: {
      format?: 'webp' | 'avif' | 'jpeg' | 'png';
      quality?: number;
      width?: number;
      height?: number;
    }
  ): Promise<Buffer> {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();

      // Apply optimizations
      if (options?.width || options?.height) {
        image.resize(options.width, options.height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Convert to specified format
      const format = options?.format || this.getOptimalFormat(metadata.format);
      const quality = options?.quality || this.config.imageOptimization.quality;

      let optimizedBuffer: Buffer;
      switch (format) {
        case 'webp':
          optimizedBuffer = await image.webp({ quality }).toBuffer();
          break;
        case 'avif':
          optimizedBuffer = await image.avif({ quality }).toBuffer();
          break;
        case 'jpeg':
          optimizedBuffer = await image.jpeg({ quality }).toBuffer();
          break;
        case 'png':
          optimizedBuffer = await image.png({ quality }).toBuffer();
          break;
        default:
          optimizedBuffer = await image.toBuffer();
      }

      // Generate responsive images if enabled
      if (this.config.imageOptimization.responsive) {
        await this.generateResponsiveImages(imageBuffer, format, quality);
      }

      await this.logAudit('optimize', 'image', imagePath, {
        format,
        quality,
        originalSize: imageBuffer.length,
        optimizedSize: optimizedBuffer.length
      });

      return optimizedBuffer;
    } catch (error) {
      throw this.errorService.createError(
        'IMAGE_OPTIMIZATION_FAILED',
        ErrorCategory.ASSET,
        ErrorSeverity.ERROR,
        'Failed to optimize image',
        { imagePath, error }
      );
    }
  }

  // Component Lazy Loading
  public async registerLazyComponent(
    componentPath: string,
    options?: {
      preload?: boolean;
      prefetch?: boolean;
      threshold?: number;
    }
  ): Promise<string> {
    try {
      const componentId = this.generateComponentId(componentPath);
      const componentContent = await fs.readFile(componentPath, 'utf-8');

      const asset: Asset = {
        id: componentId,
        type: 'component',
        path: componentPath,
        size: componentContent.length,
        hash: this.generateHash(componentContent),
        metadata: {
          chunks: this.extractChunks(componentContent),
          dependencies: this.extractDependencies(componentContent)
        }
      };

      this.assetCache.set(componentId, asset);

      // Generate lazy loading code
      const lazyCode = this.generateLazyLoadingCode(componentId, options);

      await this.logAudit('register', 'component', componentId, {
        preload: options?.preload,
        prefetch: options?.prefetch,
        threshold: options?.threshold
      });

      return lazyCode;
    } catch (error) {
      throw this.errorService.createError(
        'COMPONENT_REGISTRATION_FAILED',
        ErrorCategory.ASSET,
        ErrorSeverity.ERROR,
        'Failed to register lazy component',
        { componentPath, error }
      );
    }
  }

  // Asset Bundling
  public async bundleAssets(
    entryPoints: string[],
    options?: {
      minify?: boolean;
      sourceMaps?: boolean;
      splitChunks?: boolean;
    }
  ): Promise<Record<string, string>> {
    try {
      const bundles: Record<string, string> = {};

      // Implement bundling logic here
      // This would typically use a bundler like esbuild, Webpack, or Vite
      // For now, we'll just return a placeholder

      await this.logAudit('bundle', 'assets', 'bundle', {
        entryPoints,
        options
      });

      return bundles;
    } catch (error) {
      throw this.errorService.createError(
        'ASSET_BUNDLING_FAILED',
        ErrorCategory.ASSET,
        ErrorSeverity.ERROR,
        'Failed to bundle assets',
        { entryPoints, error }
      );
    }
  }

  // Helper methods
  private getOptimalFormat(originalFormat?: string): 'webp' | 'avif' | 'jpeg' | 'png' {
    // Implement format selection logic based on browser support and image type
    return 'webp';
  }

  private async generateResponsiveImages(
    imageBuffer: Buffer,
    format: string,
    quality: number
  ): Promise<void> {
    const sizes = [320, 640, 960, 1280, 1920];
    const image = sharp(imageBuffer);

    for (const size of sizes) {
      await image
        .resize(size)
        .toFormat(format as any, { quality })
        .toFile(`responsive-${size}.${format}`);
    }
  }

  private generateComponentId(path: string): string {
    return `component_${this.generateHash(path)}`;
  }

  private generateHash(content: string): string {
    return createHash('md5').update(content).digest('hex');
  }

  private extractChunks(content: string): string[] {
    // Implement chunk extraction logic
    return [];
  }

  private extractDependencies(content: string): string[] {
    // Implement dependency extraction logic
    return [];
  }

  private generateLazyLoadingCode(
    componentId: string,
    options?: {
      preload?: boolean;
      prefetch?: boolean;
      threshold?: number;
    }
  ): string {
    const threshold = options?.threshold || this.config.lazyLoading.threshold;
    const preload = options?.preload ?? this.config.lazyLoading.preload;
    const prefetch = options?.prefetch ?? this.config.lazyLoading.prefetch;

    return `
      const ${componentId} = lazy(() => import('./${componentId}'));
      ${preload ? `preloadComponent('${componentId}');` : ''}
      ${prefetch ? `prefetchComponent('${componentId}');` : ''}
      <Suspense fallback={<Loading />}>
        <${componentId} />
      </Suspense>
    `;
  }

  private async logAudit(
    action: string,
    resource: string,
    resourceId: string,
    changes?: Record<string, unknown>
  ): Promise<void> {
    await this.loggingService.info('Asset optimization audit log', {
      action,
      resource,
      resourceId,
      changes,
      timestamp: new Date()
    });
  }

  // Cleanup
  public async cleanup(): Promise<void> {
    this.assetCache.clear();
  }
} 