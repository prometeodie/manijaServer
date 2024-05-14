import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/jwt-payload';
import { AuthService } from '../auth.service';
import { Reflector } from '@nestjs/core';
import { PUBLIC_KEY } from '../utils/key-decorator';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {

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
      const isTokenExpired = this.isTokenExpired(decoded)
      
  
      if (!token || Array.isArray(token)) {
        throw new UnauthorizedException('Invalid Token');
      }
      
      if(isTokenExpired){
        throw new UnauthorizedException('Token Expired');
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        token, { secret: process.env.JWT_SEED }
      );
        
      const user = await this.authService.findUserById( payload.id );
      if ( !user ) throw new UnauthorizedException('User does not exists');
      if ( !user.isActive ) throw new UnauthorizedException('User is not active');
      
      request['user'] = user;
      
    } catch (error) {
      throw new UnauthorizedException();
    }
   
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private isTokenExpired(decoded: string | jwt.JwtPayload){
    if (typeof decoded === 'string') {
      throw new UnauthorizedException('Invalid token');
    }
  
    if (!decoded) {
      throw new UnauthorizedException('Token is missing or invalid');
    }
  
    if (decoded.exp) {
      const expirationDate = new Date(decoded.exp * 1000);
      const currentDate = new Date();
      return expirationDate < currentDate;
    }
  
    return true;
  }
}
