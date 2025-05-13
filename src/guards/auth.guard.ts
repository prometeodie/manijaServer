import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


import { Reflector } from '@nestjs/core';

import * as jwt from 'jsonwebtoken';

import { AuthService } from 'src/auth/auth.service';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload';
import { PUBLIC_KEY } from 'src/utils/key-decorator';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private jwtService: JwtService,
    private authService:AuthService,
    private readonly reflector: Reflector
  ) {}


  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const isPublic = this.reflector.get<boolean>(
        PUBLIC_KEY,
        context.getHandler()
      );

      if (isPublic) {
        return true;
      }

      const request = context.switchToHttp().getRequest<Request>();
      const token = this.extractTokenFromHeader(request);

      if (!token || Array.isArray(token)) {
        throw new UnauthorizedException('Invalid Token');
      }

      // ✅ Decode sin verificar firma ni expiración
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      const isTokenExpired = this.isTokenExpired(decoded);

      if (isTokenExpired) {
        throw new UnauthorizedException('Token Expired');
      }

      // ✅ Verificar firma después de chequear expiración
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        token,
        { secret: process.env.JWT_SEED }
      );

      const user = await this.authService.findUserById(payload._id);
      if (!user) throw new UnauthorizedException('User does not exist');
      if (!user.isActive) throw new UnauthorizedException('User is not active');

      request['user'] = user;

      return true;

    } catch (error) {
      // 🔁 Mantener mensaje original
      throw error;
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private isTokenExpired(decoded: jwt.JwtPayload | string): boolean {
    if (typeof decoded === 'string' || !decoded || !decoded.exp) {
      throw new UnauthorizedException('Invalid token');
    }

    return decoded.exp * 1000 < Date.now();
  }
}

