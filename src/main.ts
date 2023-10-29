import { NestFactory } from "@nestjs/core";
import { print } from "listening-on";
import { WinstonModule } from "nest-winston";
import { logger } from "src/utils/logger";
import { AppModule } from "./app/app.module";
import { env } from "./db/env";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({ instance: logger }),
  });
  await app.listen(env.WEB_PORT);
  print(env.WEB_PORT);
}
bootstrap();
