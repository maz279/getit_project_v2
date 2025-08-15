/**
 * FraudDetectionService.ts
 * Basic fraud detection service to prevent import errors
 */

export default class FraudDetectionService {
  constructor() {
    console.log('[FraudDetectionService] Initialized');
  }

  async detectFraud(data: any): Promise<boolean> {
    // Basic implementation - always returns false for now
    return false;
  }

  getServiceStats() {
    return {
      status: 'operational',
      checksPerformed: 0,
      fraudDetected: 0
    };
  }
}