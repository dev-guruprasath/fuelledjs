// fuelledApp.ts
import express, {
  Application,
  Request,
  RequestHandler,
  Response,
  Router,
} from "express";
import { IRouter } from "./decorators/route.decorators";
import { MetadataKeys } from "./metadata.keys";
import { MiddlewareMetadata } from "./decorators/middleware.decorators";

export class FuelledApp {
  private app: Application;

  constructor() {
    this.app = express();
    this.setupDefaults();
  }

  private setupDefaults(): void {
    // Set up your default configurations and middlewares here
    this.app.use(express.json());
  }

  public registerController(controller: any): void {
    const controllerInstance = new controller() as any;
    const basePath: string = Reflect.getMetadata(
      MetadataKeys.BASE_PATH,
      controller
    );
    const routers: IRouter[] = Reflect.getMetadata(
      MetadataKeys.ROUTERS,
      controller
    );

    const router = Router();
    routers.forEach(({ method, path, handlerName }) => {
      const middlewares: MiddlewareMetadata[] =
        Reflect.getMetadata(MetadataKeys.MIDDLEWARES, controller) ?? [];
      router[method](
        path,
        ...middlewares
          .filter((item) => item.propertyKey === handlerName)
          .map((item) => item.middlewareFunction),
        async function (req: Request, res: Response) {
          try {
            const result = await controllerInstance[String(handlerName)].bind(
              controllerInstance
            )();
            res.json(result);
          } catch (e: any) {
            res.status(500).json({
              message: `${e?.toString() ?? "Internal Server Error"}`,
            });
          }
        }
      );
    });
    this.app.use(basePath, router);
  }

  public registerControllers(controllers: any[]): void {
    controllers.forEach((controller) => this.registerController(controller));
  }

  public listen(port: number | string, callback?: () => void): void {
    this.app.use("*", function (req: Request, res: Response) {
      res
        .status(404)
        .json({ message: "Sorry! The resource you are looking is not found" });
    });
    this.app.listen(+port, callback);
  }

  public get expressApp(): Application {
    return this.app;
  }
}
