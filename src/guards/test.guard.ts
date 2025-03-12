import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class TestGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('TestGuard');
    return true;
  }
}
