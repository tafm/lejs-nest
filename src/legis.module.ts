import { DynamicModule, Module } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CertificatesWebhookResponse } from "@lejsutils/client/webhooks";
import { CertificateReport } from "./events";
import { createDynamicController } from "./legis.controller";

type options = {
  eventEmitterClass: typeof EventEmitter2;
  webhooksBasePath: string;
  webhooksPaths: {
    certificates: string;
  };
  customEvents?: {
    certificate?: (
      report: CertificateReport,
      webhookPayload?: CertificatesWebhookResponse
    ) => { data: any; event?: string };
  };
};

@Module({
  controllers: [],
  providers: [],
  exports: [],
})
export class LegisModule {
  static register(options: options): DynamicModule {
    return {
      module: LegisModule,
      providers: [
        {
          provide: "EventEmitter2",
          useExisting: options.eventEmitterClass,
        },
      ],
      controllers: [
        createDynamicController({
          basePath: options.webhooksBasePath,
          certificatesCallbackPath: options.webhooksPaths.certificates,
          customEvents: options.customEvents,
        }),
      ],
    };
  }
}
