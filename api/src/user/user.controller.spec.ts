import { UserController } from './user.controller.js';

describe('UserController', () => {
  it('requires authenticated Admin for every generic user operation', () => {
    expect(Reflect.getMetadata('__guards__', UserController)).toHaveLength(2);
    expect(Reflect.getMetadata('roles', UserController)).toEqual(['ADMIN']);
  });
});
