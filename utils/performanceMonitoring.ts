interface PerformanceMetric {
    name: string;
    startTime: number;
    duration: number;
    metadata?: Record<string, any>;
}

export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics: PerformanceMetric[] = [];
    private activeMetrics: Map<string, number> = new Map();
    private readonly maxMetrics: number = 1000;

    private constructor() {
        if (typeof window !== 'undefined') {
            // Monitor route changes
            window.addEventListener('popstate', () => {
                this.measurePageLoad();
            });

            // Monitor initial page load
            window.addEventListener('load', () => {
                this.measurePageLoad();
            });
        }
    }

    public static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    public startMetric(name: string, metadata?: Record<string, any>): void {
        this.activeMetrics.set(name, performance.now());
    }

    public endMetric(name: string, metadata?: Record<string, any>): void {
        const startTime = this.activeMetrics.get(name);
        if (startTime === undefined) {
            console.warn(`No start time found for metric: ${name}`);
            return;
        }

        const endTime = performance.now();
        const duration = endTime - startTime;

        this.recordMetric({
            name,
            startTime,
            duration,
            metadata,
        });

        this.activeMetrics.delete(name);
    }

    public measurePageLoad(): void {
        if (typeof window === 'undefined') return;

        const pageLoadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        this.recordMetric({
            name: 'pageLoad',
            startTime: window.performance.timing.navigationStart,
            duration: pageLoadTime,
            metadata: {
                url: window.location.href,
            },
        });
    }

    private recordMetric(metric: PerformanceMetric): void {
        this.metrics.push(metric);

        // Trim old metrics if exceeding maxMetrics
        if (this.metrics.length > this.maxMetrics) {
            this.metrics = this.metrics.slice(-this.maxMetrics);
        }

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log('Performance metric:', metric);
        }
    }

    public getMetrics(options?: {
        name?: string;
        startTime?: number;
        endTime?: number;
    }): PerformanceMetric[] {
        let filteredMetrics = this.metrics;

        if (options?.name) {
            filteredMetrics = filteredMetrics.filter(
                (metric) => metric.name === options.name
            );
        }

        if (options?.startTime) {
            filteredMetrics = filteredMetrics.filter(
                (metric) => metric.startTime >= options.startTime!
            );
        }

        if (options?.endTime) {
            filteredMetrics = filteredMetrics.filter(
                (metric) => metric.startTime <= options.endTime!
            );
        }

        return filteredMetrics;
    }

    public getAverageMetric(name: string): number | null {
        const metrics = this.getMetrics({ name });
        if (metrics.length === 0) return null;

        const total = metrics.reduce((sum, metric) => sum + metric.duration, 0);
        return total / metrics.length;
    }

    public clearMetrics(): void {
        this.metrics = [];
        this.activeMetrics.clear();
    }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// React Hook for measuring component render time
export const usePerformanceMonitoring = (componentName: string) => {
    if (typeof window === 'undefined') return;

    const monitor = PerformanceMonitor.getInstance();
    
    React.useEffect(() => {
        monitor.startMetric(`render_${componentName}`);
        return () => {
            monitor.endMetric(`render_${componentName}`);
        };
    });
};