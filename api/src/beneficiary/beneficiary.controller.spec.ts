import { BeneficiaryController } from './beneficiary.controller.js';

describe('BeneficiaryController', () => {
  it('protects sensitive beneficiary CRUD behind authenticated Admin access', () => {
    expect(Reflect.getMetadata('__guards__', BeneficiaryController)).toHaveLength(2);
    expect(Reflect.getMetadata('roles', BeneficiaryController)).toEqual(['ADMIN']);
  });
});
