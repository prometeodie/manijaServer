import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

import { CreateUserDto, LoginDto, UpdateAuthDto } from './dto';
import { AuthGuard } from './guards/auth.guard';
import { LoginResponse } from './interfaces/login-response';
import { User } from './entities/user.entity';
import { Response } from 'express';
import { PublicAccess } from './decorators/public.decorator';

// TODO: poner los guards en el "export class AuthController" y crear el public para q deje pasar y el de los roles segun el video de youtube
// TODO:aplicar bien todos los guards  entender como fucnionan
// TODO:ver como conectarr y poner guards al resto de secciones


@Controller('auth')
@UseGuards( AuthGuard )
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Post('/register')
  async create(
    @Body() createUserDto: CreateUserDto,
    @Res() res:Response
  ) {
    try{
      await this.authService.create(createUserDto);
      return res.status(HttpStatus.OK).json({
        message:'User was created',
      })
    }catch(error){
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `There was an error processing the request ${error.message}`,
      });
    }
  }

  @PublicAccess()
  @Post('/login')
  async login( 
    @Body() loginDto: LoginDto,
    @Res() res:Response  ) { 
      try{
        const loginReponse = await this.authService.login( loginDto );
        return res.status(HttpStatus.OK).json({ message: 'Logged in successfully', user: loginReponse });
      }catch(error){
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `There was an error processing the request ${error.message}`,
        });
    }
  }


  @Get()
  async findAll( 
    @Request() req: Request,
    @Res() res:Response
  ) {
      try{
        const findAllReponse = await this.authService.findAll();
        return res.status(HttpStatus.OK).json({users:findAllReponse});
      }catch(error){
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `There was an error processing the request ${error.message}`,
        });
      }
  }

  // LoginResponse
  @Get('check-token')
  checkToken( 
    @Request() req: Request,
    @Res() res:Response
  ): LoginResponse | Response {
      try{
        const user = req['user'] as User;
        const userAndToken = {
          user,
          token: this.authService.getJwtToken({ id: user._id })
        }
        res.status(HttpStatus.OK).json(userAndToken);
      }catch(error){
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `There was an error processing the request ${error.message}`,
        });
      }
  }

  @Get('/user/:id')
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

  @Patch('/update-user/:id')
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

  @Delete('/delete-user/:id')
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
