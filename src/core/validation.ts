import { Request, Response, NextFunction } from "express";
import { validate, ValidationError } from "class-validator";
import { Middleware } from "./decorators/middleware.decorators";

export function Validate(type: any) {
  return Middleware(validationMiddleware(type));
}

export function validationMiddleware<T>(
  type: new () => T
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    validate(Object.assign(new (type as any)(), req.body)).then(
      (errors: ValidationError[]) => {
        if (errors.length > 0) {
          const validationErrors = errors
            .map((error: ValidationError) =>
              Object.values(error.constraints || {})
            )
            .join(", ");
          res.status(400).json({ message: validationErrors });
        } else {
          next();
        }
      }
    );
  };
}
