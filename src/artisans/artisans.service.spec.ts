import { Test, TestingModule } from '@nestjs/testing';
import { ArtisansService } from './artisans.service';

describe('ArtisansService', () => {
  let service: ArtisansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArtisansService],
    }).compile();

    service = module.get<ArtisansService>(ArtisansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
