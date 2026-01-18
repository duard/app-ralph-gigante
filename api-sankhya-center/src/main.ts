import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import * as os from 'os' // Importar o módulo 'os'

// Define timezone para America/Sao_Paulo
process.env.TZ = 'America/Sao_Paulo'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  })

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe())

  // Enable global exception filter for detailed error logging
  app.useGlobalFilters(new AllExceptionsFilter())

  // Enable global logging interceptor for development
  app.useGlobalInterceptors(new LoggingInterceptor())

  app.enableCors({
    origin: true, // Allow any origin for development
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Enable credentials to allow cookies/sessions
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    exposedHeaders: 'Content-Range,X-Content-Range', // Important for pagination headers
  })

  const config = new DocumentBuilder()
    .setTitle('API Sankhya Center')
    .setDescription('API para integração com Sankhya')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000
  await app.listen(port)

  // Logar IPs disponíveis e porta
  const interfaces = os.networkInterfaces()
  const addresses: string[] = []
  for (const name in interfaces) {
    for (const iface of interfaces[name]!) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address)
      }
    }
  }
  const localAddress = `http://localhost:${port}`
  const networkAddresses = addresses
    .map((addr) => `http://${addr}:${port}`)
    .join(', ')

  console.log(`\nAPI Sankhya Center running on:`)
  console.log(`- Local:   ${localAddress}`)
  if (networkAddresses) {
    console.log(`- Network: ${networkAddresses}`)
  }
  console.log(`Swagger UI: ${localAddress}/api`)
  console.log(`Port: ${port}\n`)
}
bootstrap()
