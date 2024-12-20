import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationError, useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { Environment } from './config';
import { TrimPipe } from './core/pipes/trim.pipe';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 5001,
      },
    },
  );
  // const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // app.enableVersioning({
  //   type: VersioningType.CUSTOM,
  //   defaultVersion: getVersions(),
  //   extractor: extractVersion,
  // });
  /* Loading config */
  const config = app.get(ConfigService);
  const env = config.get<Environment>('env');
  // if (env !== Environment.Production) {
  //   /* Morgan logger in non-production env */
  //   app.use(morgan('tiny'));
  //   /* Swagger documentation */
  //   /* Only available in non-production env */
  //   const document = SwaggerModule.createDocument(app, SwaggerConfig);
  //   SwaggerModule.setup('/docs', app, document, SwaggerOptions);
  // }
  /* Body parsers */
  // app.use(json({ limit: '5mb' }));
  // app.use(urlencoded({ extended: true, limit: '5mb' }));
  /* Validation */
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(
    new TrimPipe(),
    new ValidationPipe({
      whitelist: true,
      transform: true,
      validationError: { target: false },
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new BadRequestException(validationErrors);
      },
    }),
  );
  /* Trust proxy config */
  // app.set('trust proxy', 1);
  /* Helmet */
  // app.use(helmet({ crossOriginResourcePolicy: false }));
  /* CORS */
  // app.enableCors();
  /* Compression */
  // app.use(compression());
  /* MVC setup */
  // app.setBaseViewsDir(join(__dirname, 'views'));
  // app.setViewEngine('hbs');
  // if (isPrimaryInstance()) {
  //   /* Micro service setup */
  //   app.connectMicroservice<MicroserviceOptions>(config.get('ms'));
  //   await app.startAllMicroservices();
  // }
  /* Init socket */
  // if (config.get('useSocketIO')) {
  //   initAdapters(app);
  // }
  /* Starting app */
  const port = config.get('port');
  await app.listen(() =>
    console.log(`Microservice is listening on port ${port}`),
  );
}
bootstrap();
