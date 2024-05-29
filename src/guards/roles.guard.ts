import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { Reflector } from '@nestjs/core';

import * as jwt from 'jsonwebtoken';


import { AuthService } from 'src/auth/auth.service';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload';

import { PUBLIC_KEY, ROLES_KEY } from 'src/utils/key-decorator';
import { Roles } from 'src/utils/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService:AuthService,
    private readonly reflector: Reflector
  ) {}

  async canActivate( context: ExecutionContext ): Promise<boolean>{

    
    try {
      const isPublic = this.reflector.get<boolean>(
        PUBLIC_KEY,
        context.getHandler()
      )
      
      if(isPublic){
        return true;
      }
      
  
      const request = context.switchToHttp().getRequest<Request>();
      const token = this.extractTokenFromHeader(request);
      const decoded = jwt.verify(token, process.env.JWT_SEED);
      request['user'] = decoded;

      
      if (!token || Array.isArray(token)) {
        throw new UnauthorizedException('Invalid Token');
      }
      
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        token, { secret: process.env.JWT_SEED }
      );

      const roles = this.reflector.get<Roles[]>(
                ROLES_KEY,
                context.getHandler()
              )
      
      if(roles === undefined){
        throw new UnauthorizedException('Invalid Token');
      }
      
      if(payload.roles.some(role => role === 'MASTER')){
        return true;
      }

      const roleAuth = roles.some(role => role === payload.roles[0])
      
      if(!roleAuth){
        throw new UnauthorizedException();
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

}


