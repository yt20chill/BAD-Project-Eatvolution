import { NestFactory } from "@nestjs/core";
import { print } from "listening-on";
import { AppModule } from "./app/app.module";
import { env } from "./db/env";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(env.WEB_PORT);
  print(env.WEB_PORT);
}
bootstrap();
