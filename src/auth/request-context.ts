import { Request, Response } from 'express';
import { CurrentUserDto } from './dto/current-user.dto';

export class RequestContext {
  constructor(
    public req: Request,
    public res: Response,
    public currentUser?: CurrentUserDto,
  ) {}
}
