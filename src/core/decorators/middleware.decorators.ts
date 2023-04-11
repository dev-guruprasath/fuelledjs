// decorators/middleware.ts
import "reflect-metadata";
import { MetadataKeys } from "../metadata.keys";
import { RequestHandler } from "express";

export interface MiddlewareMetadata {
  propertyKey: string | symbol;
  middlewareFunction: RequestHandler;
}

export function Middleware(
  middlewareFunction: RequestHandler
): MethodDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const middlewares: MiddlewareMetadata[] =
      Reflect.getMetadata(MetadataKeys.MIDDLEWARES, target.constructor) || [];
    middlewares.push({
      propertyKey,
      middlewareFunction,
    });
    Reflect.defineMetadata("middlewares", middlewares, target.constructor);
  };
}
