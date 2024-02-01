import { Test, TestingModule } from '@nestjs/testing';
import { BlogsManijasService } from './blogs-manijas.service';

describe('BlogsManijasService', () => {
  let service: BlogsManijasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlogsManijasService],
    }).compile();

    service = module.get<BlogsManijasService>(BlogsManijasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
