import { RequestContext } from '../auth/context/request-context';

declare global {
  namespace Express {
    interface Request {
      context: RequestContext;
    }
  }
}
