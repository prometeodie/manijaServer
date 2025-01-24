import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';

import * as bcryptjs from 'bcryptjs';

import { CreateUserDto, UpdateAuthDto, LoginDto } from './dto';

import { User } from './entities/user.entity';

import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
import { ErrorManager } from 'src/utils/error.manager';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel( User.name ) 
    private userModel: Model<User>,

    private jwtService: JwtService,
   ) {}

  
  async create(createUserDto: CreateUserDto): Promise<User> {
    
    try {
      
      const { password, ...userData } = createUserDto;
           
      const newUser = new this.userModel({
        password: bcryptjs.hashSync( password, 10 ),
        ...userData
      });

       await newUser.save();
       const { password:_, ...user } = newUser.toJSON();
       
       return user;
      
    } catch (error) {
      if( error.code === 11000 ) {
        throw new BadRequestException({
          message: `${createUserDto.email} already exists!`,
          code: 11000,
        });
      }
      throw new InternalServerErrorException({
        message: 'Something terrible happened!',
        code: error.code || 'UNKNOWN',
      });
    }

  }


  async login( loginDto: LoginDto ):Promise<LoginResponse> {

    try{
      const { email, password } = loginDto;
  
      const user = await this.userModel.findOne({ email });
      if ( !user ) {
        throw new UnauthorizedException('Not valid credentials');
      }
      
      if ( !bcryptjs.compareSync( password, user.password ) ) {
        throw new UnauthorizedException('Not valid credentials');
      }
  
      const { password:_, ...rest  } = user.toJSON();
      const token = this.getJwtToken({ _id: user._id, roles: user.roles, name: user.name, surname: user.surname, nickname: user.nickname })
  
      const userLoggedIn = {
        user: rest,
        token: token
      }
      return userLoggedIn;
    }catch(error){
      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        throw new InternalServerErrorException('An unexpected error occurred');
      }
    }
  
  }


  async findAll(): Promise<User[]> {
    try{
      const response = await this.userModel.find();
      return response;
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  
  async findUserById( id: string ) {
    try{
      const user = await this.userModel.findById( id );
      if ( !user){
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'User does not exist'
        })
      }
      const { password, ...rest } = user.toJSON();
      return rest;
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findUserByIdReturnComplete( id: string ) {
    try{
      const user = await this.userModel.findById( id );
      if ( !user){
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'User does not exist'
        })
      }
      return user;
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }


 async update(id: string, updateAuthDto: UpdateAuthDto) {
    try{

      if(updateAuthDto.password){
        const encryptedPass = bcryptjs.hashSync( updateAuthDto.password, 10 );
        updateAuthDto.password = encryptedPass;
      }

      const user = await this.userModel.findByIdAndUpdate(id, updateAuthDto, { new: true } );
      if (!user) {
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'User does not exist'
        })
      }
      return user;
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async updatePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
        // Obtén al usuario de la base de datos
        const user = await this.findUserByIdReturnComplete(id);
        if (!user) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        // Verifica que la contraseña actual coincida
        const isMatch = await bcryptjs.compare(currentPassword, user.password);
        if (!isMatch) {
          throw new HttpException('Current password is incorrect', HttpStatus.BAD_REQUEST);
        }
        // Hashea la nueva contraseña
        const hashedPassword = await bcryptjs.hash(newPassword, 10);
    await this.userModel.findByIdAndUpdate(id, { password: hashedPassword });
  }

  async remove(id: string) {
    try{
      const user = await this.userModel.findByIdAndDelete(id)
      if ( !user ){
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'User does not exist'
        })}
      return user;
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

    getJwtToken( payload: JwtPayload ) {
      const token =  this.jwtService.sign(payload);
      return token;
    }
  }



