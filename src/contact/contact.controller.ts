import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { error } from 'console';

@Controller('message')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  public async create(
    @Body() createContactDto: CreateContactDto,
    @Res() res: Response) {
      try{
        await this.contactService.create(createContactDto);
          return res.status(HttpStatus.OK).json({
            message:'Message has been saved',
          })
      }catch(error){
        
      }
    return this.contactService.create(createContactDto);
  }

  @Get()
  public async findAll(
    @Res() res: Response
  ) {
    try{
      const messages = await this.contactService.findAll();
      return res.status(HttpStatus.OK).json(messages);
    }catch(error){
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: `Error finding the Messages ${error.message}`
      });
    }
  }

  @Get(':id')
  public async findOne(
    @Param('id') id: string,
    @Res()  res: Response
    ) {
      try{
        const message = await this.contactService.findOne(id);
        return res.status(HttpStatus.OK).json(message);
      }catch(error){
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: `Error finding the Message ${error.message}`
        }); 
      }
  }

  @Patch('edit/:id')
  public async update(
    @Param('id') id: string, 
    @Body() updateContactDto: UpdateContactDto,
    @Res() res: Response
    ) {
      try{
          await this.contactService.update(id, updateContactDto);
          return res.status(HttpStatus.OK).json({
            message:`Message has been actualized`
            })
        }catch(error){
        return res.status(HttpStatus.CONFLICT).json({
          message:`Failed to updated the message ${error}`
        })   
      }
  }

  @Delete('delete/:id')
  public async remove(
    @Param('id') id: string,
    @Res() res: Response
    ) {
    try{
      await this.contactService.remove(id);
      return res.status(HttpStatus.OK).json({
        message:'Deleted'
      })   
    }catch(error){
      return res.status(HttpStatus.CONFLICT).json({
        message:`Failed to delete the event ${error.message}`
      })      
  }
  }
}
