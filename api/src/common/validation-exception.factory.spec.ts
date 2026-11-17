import { describe, expect, it } from 'vitest';
import type { ValidationError } from 'class-validator';
import { createValidationException } from './validation-exception.factory.js';

describe('createValidationException', () => {
  it('uses Portuguese labels and retains nested field paths for the form', () => {
    const errors: ValidationError[] = [{
      property: 'beneficiary',
      children: [{
        property: 'name',
        constraints: { minLength: 'name must be longer than or equal to 2 characters' },
      }],
    }];

    const response = createValidationException(errors).getResponse() as {
      message: string[];
      fields: string[];
    };

    expect(response.message).toEqual([
      'O campo Nome do beneficiário deve possuir pelo menos 2 caracteres.',
    ]);
    expect(response.fields).toEqual(['beneficiary.name']);
  });

  it('does not expose unknown property names in user-facing messages', () => {
    const errors: ValidationError[] = [{
      property: 'internalSecretField',
      constraints: { isNotEmpty: 'internalSecretField should not be empty' },
    }];

    const response = createValidationException(errors).getResponse() as {
      message: string[];
      fields: string[];
    };

    expect(response.message).toEqual(['Preencha os campos obrigatórios do formulário.']);
    expect(response.message.join(' ')).not.toContain('internalSecretField');
    expect(response.fields).toEqual(['internalSecretField']);
  });

  it('labels array fields by their human-readable group and row number', () => {
    const errors: ValidationError[] = [{
      property: 'relatives',
      children: [{
        property: '0',
        children: [{
          property: 'relation',
          constraints: { isNotEmpty: 'relation should not be empty' },
        }],
      }],
    }];

    const response = createValidationException(errors).getResponse() as {
      message: string[];
    };

    expect(response.message).toEqual(['O campo Familiar 1 - parentesco é obrigatório.']);
  });

  it('does not mistake array indices for length limits', () => {
    const errors: ValidationError[] = [{
      property: 'relatives',
      children: [{
        property: '0',
        children: [{
          property: 'name',
          constraints: { minLength: 'name must be longer than or equal to 3 characters' },
        }],
      }],
    }];

    const response = createValidationException(errors).getResponse() as {
      message: string[];
    };

    expect(response.message).toEqual([
      'O campo Familiar 1 - Nome deve possuir pelo menos 3 caracteres.',
    ]);
  });
});
