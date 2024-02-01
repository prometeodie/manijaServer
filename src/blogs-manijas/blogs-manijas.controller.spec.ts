import { Test, TestingModule } from '@nestjs/testing';
import { BlogsManijasController } from './blogs-manijas.controller';
import { BlogsManijasService } from './blogs-manijas.service';

describe('BlogsManijasController', () => {
  let controller: BlogsManijasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogsManijasController],
      providers: [BlogsManijasService],
    }).compile();

    controller = module.get<BlogsManijasController>(BlogsManijasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
