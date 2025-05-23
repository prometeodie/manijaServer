import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Res, HttpStatus, UnauthorizedException, Req, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';

import { CreateUserDto, LoginDto, UpdateAuthDto } from './dto';

import { LoginResponse } from './interfaces/login-response';
import { User } from './entities/user.entity';
import { Response } from 'express';

import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { RolesAccess } from 'src/decorators/roles.decorator';
import { PublicAccess } from 'src/decorators/public.decorator';
import { Roles } from 'src/utils/roles.enum';
import { ChangePasswordDto } from './dto/update.user.pass-auth.dto';

@Controller('auth')
@UseGuards( AuthGuard, RolesGuard )
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Post('register')
@RolesAccess(Roles.MASTER)
async create(
  @Body() createUserDto: CreateUserDto,
  @Res() res: Response
) {
  try {
    await this.authService.create(createUserDto);
    return res.status(HttpStatus.OK).json({
      message: 'User was created',
    });
  } catch (error) {
    const statusCode = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const customCode = error.response?.code || 'UNKNOWN';
    const message = error.response?.message || 'An unexpected error occurred';

    return res.status(statusCode).json({
      message,
      code: customCode,
    });
  }
}

  @PublicAccess()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
  ) {
    try {
      const loginReponse = await this.authService.login(loginDto);
      return res
        .status(HttpStatus.OK)
        .json({ message: 'Logged in successfully', user: loginReponse.user, token: loginReponse.token });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Invalid credentials',
          status: 401
        });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `There was an error processing the request: ${error.message}`,
      });
    }
  }
    
  @RolesAccess(Roles.MASTER)
  @Get('all-users')
  async findAll( 
    @Request() req: Request,
    @Res() res:Response
  ) {
      try{
        const findAllReponse = await this.authService.findAll();
        return res.status(HttpStatus.OK).json(findAllReponse);
      }catch(error){
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `There was an error processing the request ${error.message}`,
        });
      }
  }

  @RolesAccess(Roles.ADMIN)
  @Get('check-token')
  checkToken( 
    @Request() req: Request,
    @Res() res:Response
  ): LoginResponse | Response {
      try{
        const user = req['user'] as User;
        const userAndToken = {
          user,
          token: this.authService.getJwtToken({ _id: user._id, roles: user.roles, name: user.name, surname: user.surname, nickname: user.nickname })
        }
        res.status(HttpStatus.OK).json(userAndToken);
      }catch(error){
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `There was an error processing the request ${error.message}`,
        });
      }
  }

  @RolesAccess(Roles.MASTER)
  @Get('user/:id')
  async findOne(
    @Param('id') id: string,
    @Res() res:Response
  ) {
    try{
      const user = await this.authService.findUserById(id);
      return res.status(HttpStatus.OK).json(user);
    }catch(error){
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `There was an error processing the request ${error.message}`,
      });
    }
  }

  @RolesAccess(Roles.MASTER)
  @Patch('update-user/:id')
  async update(
    @Param('id') id: string, 
    @Body() updateAuthDto: UpdateAuthDto,
    @Res() res:Response
  ) {
    try{
      const user = await this.authService.update(id, updateAuthDto); 
      return res.status(HttpStatus.OK).json({message:'user was updated'});
    }catch(error){
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `There was an error processing the request ${error.message}`,
      });
    }
  }
  
  @RolesAccess(Roles.ADMIN)
  @UseGuards(AuthGuard)
  @Patch('change-password')
  async changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
    const userId = req.user._id;
    const { currentPassword, newPassword } = changePasswordDto;
    await this.authService.updatePassword(userId, currentPassword, newPassword);

    return { message: 'Password updated successfully' };
  }

  @RolesAccess(Roles.MASTER)
  @Delete('delete-user/:id')
  async remove(
    @Param('id') id: string,
    @Res() res:Response
  ) {
    try{
      await this.authService.remove(id);
      return res.status(HttpStatus.OK).json({message:'user was deleted'});
    }catch(error){
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `There was an error processing the request ${error.message}`,
      });
    }
  }
}
