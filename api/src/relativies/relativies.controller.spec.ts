import { Test, TestingModule } from '@nestjs/testing';
import { RelativiesController } from './relativies.controller.js';
import { RelativiesService } from './relativies.service.js';

describe('RelativiesController', () => {
  let controller: RelativiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RelativiesController],
      providers: [RelativiesService],
    }).compile();

    controller = module.get<RelativiesController>(RelativiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
