import "reflect-metadata";
import { MetadataKeys } from "../metadata.keys";
export const Controller = (basePath: string): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(MetadataKeys.BASE_PATH, basePath, target);
  };
};
