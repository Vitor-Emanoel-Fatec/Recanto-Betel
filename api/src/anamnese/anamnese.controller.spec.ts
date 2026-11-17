import { AnamneseController } from './anamnese.controller.js';

describe('AnamneseController access policy', () => {
  it('requires authentication and role checks for every route', () => {
    const guards = Reflect.getMetadata('__guards__', AnamneseController);
    expect(guards).toHaveLength(2);
    for (const method of ['create', 'find', 'update', 'delete']) {
      expect(Reflect.getMetadata('roles', AnamneseController.prototype[method])).toBeDefined();
    }
  });

  it('allows Parent create/read/update but reserves delete for Admin', () => {
    expect(Reflect.getMetadata('roles', AnamneseController.prototype.create)).toEqual(['ADMIN', 'PARENT']);
    expect(Reflect.getMetadata('roles', AnamneseController.prototype.find)).toEqual(['ADMIN', 'PARENT']);
    expect(Reflect.getMetadata('roles', AnamneseController.prototype.update)).toEqual(['ADMIN', 'PARENT']);
    expect(Reflect.getMetadata('roles', AnamneseController.prototype.delete)).toEqual(['ADMIN']);
  });
});
