import { IVideoConsultationService } from "./IVideoConsultationService";
import { LocalDemonstrationVideoAdapter } from "./LocalDemonstrationVideoAdapter";

/**
 * Video Consultation Service Factory
 * Resolves and provides the appropriate IVideoConsultationService adapter.
 * Defaults to LocalDemonstrationVideoAdapter for zero-credential reproducible operation.
 */
export class VideoServiceFactory {
  private static instance: IVideoConsultationService | null = null;

  public static getVideoService(): IVideoConsultationService {
    if (!this.instance) {
      // Default to LocalDemonstrationVideoAdapter
      this.instance = new LocalDemonstrationVideoAdapter();
    }
    return this.instance;
  }

  public static setVideoService(service: IVideoConsultationService): void {
    this.instance = service;
  }

  public static reset(): void {
    this.instance = null;
  }
}
