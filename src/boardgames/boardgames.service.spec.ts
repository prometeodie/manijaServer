import { Test, TestingModule } from '@nestjs/testing';
import { BoardgamesService } from './BoardgamesService';

describe('BoardgamesService', () => {
  let service: BoardgamesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoardgamesService],
    }).compile();

    service = module.get<BoardgamesService>(BoardgamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
