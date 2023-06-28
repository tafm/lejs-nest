
# LEJS NEST

Módulo não oficial da API do Legis para NestJS com objetivo de facilitar requisições bem como tratamento de webhooks vindos do sistema Legis

## Instalação

Instale o pacote no seu projeto Nest com o comando:

```
npm i --save @lejsutils/nest
```

Para recebimento de eventos de webhooks recebidos do Legis é necessário utilizar o módulo EventEmitter do NestJS em conjunto com o próprio módulo do LEJS Nest

  ```js
import { Module } from  '@nestjs/common';
import { AppController } from  './app.controller';
import { AppService } from  './app.service';
import { EventEmitter2, EventEmitterModule } from  '@nestjs/event-emitter';
import { LegisModule } from  '@lejsutils/nest';

@Module({
	imports: [
		EventEmitterModule.forRoot({
			global:  true,
		}),
		LegisModule.register({
			eventEmitterClass:  EventEmitter2,
			webhooksBasePath:  'api/v1/jusapi',
			webhooksPaths: {
				certificates:  'companyLawsuits'
			}
		})
	],
	controllers: [AppController],
	providers: [AppService],
})

export  class  AppModule {}
```

Essa configuração indica ao módulo para receber os callbacks de certificados no endpoint  <br>
<b>POST: </b>`api/v1/jusapi/companyLawsuits`

A partir dessa configuração básica é possível "ouvir" eventos de leitura de certificados de processos trabalhistas como no exemplo a seguir:

```js
import { Injectable } from  '@nestjs/common';
import { OnEvent } from  '@nestjs/event-emitter';
import { CertificateReport } from  '@lejsutils/nest';

@Injectable()
export classAppService {
	@OnEvent('legisreport.certificate')
	handleCertificate(event: CertificateReport) {
		console.log(event);
	}
}
```
É passado como segundo parâmetro ainda o payload original (como veio do Legis) caso algum detalhe adicional seja necessário
```js
import { Injectable } from  '@nestjs/common';
import { OnEvent } from  '@nestjs/event-emitter';
import { CertificateReport } from  '@lejsutils/nest';
import { CertificatesWebhookResponse } from  "@lejsutils/client/webhooks";

@Injectable()
export classAppService {
	@OnEvent('legisreport.certificate')
	handleCertificate(event: CertificateReport, webhookPayload: CertificatesWebhookResponse) {
		console.log(event);
		console.log(webhookPayload);
	}
}
```
## Traduzindo os eventos em termos do seu domínio

É possível opcionalmente transformar o evento original do pacote através de uma função personalizada
```js
@Module({
	imports: [
		EventEmitterModule.forRoot({
			global:  true,
		}),
		LegisModule.register({
			eventEmitterClass:  EventEmitter2,
			webhooksBasePath:  'api/v1/jusapi',
			webhooksPaths: {
				certificates:  'companyLawsuits'
			},
			customEvents: {
				certificate(report: CertificateReport) {
					const myCustomObject = {
						myCustomObjectId:  `req-${report.requestId}`
					}

					return {
						data: myCustomObject,
						event:  'mycustom.event',
					};
				},
			}
		})
	],
	controllers: [AppController],
	providers: [AppService],
})

export  class  AppModule {}
```

O campo "event" é opcional, caso seja necessário apenas transformação dos dados