/**
 * Health Service
 * Monitors the health of backend services and provides connectivity status
 */

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'down';
  port: number;
  responseTime?: number;
  error?: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'down';
  services: {
    backend: ServiceHealth;
    imageServe: ServiceHealth;
    imageSource: ServiceHealth;
  };
  timestamp: number;
}

class HealthService {
  private lastHealthCheck: SystemHealth | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  /**
   * Perform a comprehensive health check
   */
  async checkSystemHealth(): Promise<SystemHealth> {
    const startTime = Date.now();

    const [backendHealth, imageServeHealth, imageSourceHealth] = await Promise.allSettled([
      this.checkService('/api/v1/cards?limit=1', 5001, 'backend'),
      this.checkService('/images/health', 5002, 'imageServe'),
      this.checkService('/api/image-source/health', 5003, 'imageSource'),
    ]);

    const services = {
      backend: this.parseHealthResult(backendHealth, 5001),
      imageServe: this.parseHealthResult(imageServeHealth, 5002),
      imageSource: this.parseHealthResult(imageSourceHealth, 5003),
    };

    // Determine overall health
    const healthyServices = Object.values(services).filter((s) => s.status === 'healthy').length;
    const totalServices = Object.values(services).length;

    let overall: 'healthy' | 'degraded' | 'down';
    if (healthyServices === totalServices) {
      overall = 'healthy';
    } else if (healthyServices > 0) {
      overall = 'degraded';
    } else {
      overall = 'down';
    }

    const systemHealth: SystemHealth = {
      overall,
      services,
      timestamp: Date.now(),
    };

    this.lastHealthCheck = systemHealth;
    return systemHealth;
  }

  /**
   * Check a specific service endpoint
   */
  private async checkService(
    endpoint: string,
    port: number,
    serviceName: string
  ): Promise<ServiceHealth> {
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(endpoint, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-cache',
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          status: 'healthy',
          port,
          responseTime,
        };
      } else {
        return {
          status: 'degraded',
          port,
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'down',
        port,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Parse health check result from Promise.allSettled
   */
  private parseHealthResult(
    result: PromiseSettledResult<ServiceHealth>,
    port: number
  ): ServiceHealth {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        status: 'down',
        port,
        error: result.reason instanceof Error ? result.reason.message : 'Health check failed',
      };
    }
  }

  /**
   * Start periodic health monitoring
   */
  startHealthMonitoring(intervalMs = 30000): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      this.checkSystemHealth().catch((error) => {
        console.warn('Health check failed:', error);
      });
    }, intervalMs);

    // Perform initial check
    this.checkSystemHealth();
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Get the last health check result (cached)
   */
  getLastHealthCheck(): SystemHealth | null {
    return this.lastHealthCheck;
  }

  /**
   * Quick check if backend is available
   */
  async isBackendAvailable(): Promise<boolean> {
    try {
      const response = await fetch('/api/v1/cards?limit=1', {
        method: 'GET',
        cache: 'no-cache',
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get a user-friendly status message
   */
  getStatusMessage(health: SystemHealth): string {
    const { overall, services } = health;

    switch (overall) {
      case 'healthy':
        return 'All services operational';

      case 'degraded':
        const downServices = Object.entries(services)
          .filter(([_, service]) => service.status === 'down')
          .map(([name]) => name);
        return `Some services unavailable: ${downServices.join(', ')}`;

      case 'down':
        return 'Services unavailable - using offline mode';

      default:
        return 'Status unknown';
    }
  }

  /**
   * Get a health indicator color for UI
   */
  getHealthColor(status: 'healthy' | 'degraded' | 'down'): string {
    switch (status) {
      case 'healthy':
        return '#10B981'; // Green
      case 'degraded':
        return '#F59E0B'; // Yellow/Orange
      case 'down':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  }
}

// Export singleton instance
export const healthService = new HealthService();
