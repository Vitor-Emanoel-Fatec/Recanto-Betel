import { RelativiesController } from './relativies.controller.js';

describe('RelativiesController', () => {
  it('protects family data behind authenticated Admin access', () => {
    expect(Reflect.getMetadata('__guards__', RelativiesController)).toHaveLength(2);
    expect(Reflect.getMetadata('roles', RelativiesController)).toEqual(['ADMIN']);
  });
});
