import { Controller, Post, Inject, Body } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  CertificatesWebhookResponse,
  CertificatesWebhookResponseSchema,
} from "@lejsutils/client/webhooks";
import { CertificateReport } from "./events";

export const createDynamicController = (controllerOptions: {
  basePath: string;
  certificatesCallbackPath: string;
  customEvents?: {
    certificate?: (
      report: CertificateReport,
      webhookPayload?: CertificatesWebhookResponse
    ) => { data: any; event?: string };
  };
}) => {
  @Controller(controllerOptions.basePath)
  class LegisController {
    constructor(@Inject("EventEmitter2") public eventEmitter: EventEmitter2) {}

    @Post(controllerOptions.certificatesCallbackPath)
    handleLegisCertificateCallback(@Body() body: CertificatesWebhookResponse) {
      CertificatesWebhookResponseSchema.parse(body);
      if (this.eventEmitter) {
        let report: CertificateReport;
        if (body.result.success) {
          report = {
            document: body.data.document,
            lawsuits: body.result.response.resposta.flatMap((res) =>
              res.processos.map((process) => ({
                id: process.numero_unico,
                location: process.vara,
              }))
            ),
            requestId: body.data.id,
            sucess: true,
            court: body.result.response.tribunal,
          };
        } else {
          report = {
            document: body.data.document,
            requestId: body.data.id,
            sucess: false,
          };
        }

        let eventName = "legisreport.certificate";
        if (controllerOptions.customEvents?.certificate) {
          const { data, event } =
            controllerOptions.customEvents?.certificate(report);
          report = data;
          eventName = event ?? eventName;
        }
        this.eventEmitter.emit(eventName, report, body);
      }
      return "";
    }
  }

  return LegisController;
};
