import { Test, TestingModule } from '@nestjs/testing';
import { ArtisansController } from './artisans.controller';
import { ArtisansService } from './artisans.service';

describe('ArtisansController', () => {
  let controller: ArtisansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtisansController],
      providers: [ArtisansService],
    }).compile();

    controller = module.get<ArtisansController>(ArtisansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
