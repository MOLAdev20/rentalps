import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodObject<any>): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // 1. req.body aman untuk ditimpa langsung
      req.body = parsed.body;
      
      // 2. req.query (Getter Only): Kita bersihin dulu isinya, lalu inject data hasil parse Zod
      if (parsed.query) {
        for (const key in req.query) {
          delete req.query[key];
        }
        Object.assign(req.query, parsed.query);
      }
      
      // 3. req.params (Getter Only): Lakukan hal yang sama untuk params
      if (parsed.params) {
        for (const key in req.params) {
          delete req.params[key];
        }
        Object.assign(req.params, parsed.params);
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: 'fail',
          errors: error.issues.map(issue => ({
            field: issue.path.join('.').replace(/^(body|query|params)\./, ''),
            message: issue.message
          }))
        });
        return;
      }
      
      next(error);
    }
  };
};