import { ParentController } from './parent.controller.js';

describe('ParentController', () => {
  it('protects direct Parent CRUD behind authenticated Admin access', () => {
    expect(Reflect.getMetadata('__guards__', ParentController)).toHaveLength(2);
    expect(Reflect.getMetadata('roles', ParentController)).toEqual(['ADMIN']);
  });
});
