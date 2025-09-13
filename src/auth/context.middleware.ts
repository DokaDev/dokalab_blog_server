import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RequestContext } from './request-context';
import { CurrentUserDto } from './dto/current-user.dto';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    let user: CurrentUserDto | null = null;

    // console.log('context middleware 통과함');

    const auth = req.headers['authorization'];
    if (auth?.startsWith('Bearer ')) {
      try {
        // console.log('auth로 기어들어온 문자열: ', auth);

        // TODO: auth jwt 파싱하여 검증
        user = {
          id: 1,
          nickname: 'doka',
          isAdmin: false, // adminrequired 데코레이터

          userInput: auth,
        };
      } catch {
        user = null;
      }
    }
    if (user) {
      req.context = new RequestContext(req, res, user);
    } else {
      req.context = new RequestContext(req, res);
    }
    // console.log('req.context: ', req.context);

    next();
  }
}
