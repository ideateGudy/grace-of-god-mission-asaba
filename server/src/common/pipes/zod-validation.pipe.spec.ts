import { BadRequestException } from '@nestjs/common';
import { createContactSchema } from '@ggm/types';
import { ZodValidationPipe } from './zod-validation.pipe.js';

describe('ZodValidationPipe', () => {
  const pipe = new ZodValidationPipe(createContactSchema);

  it('returns the parsed, normalized body', () => {
    expect(pipe.transform({
      name: '  Ada  ',
      email: 'ada@example.com',
      message: '  Please contact me  ',
      consent: true,
    })).toMatchObject({ name: 'Ada', message: 'Please contact me' });
  });

  it('rejects invalid and unexpected fields with a 400 response', () => {
    expect(() => pipe.transform({
      name: '',
      message: '',
      isAdmin: true,
    })).toThrow(BadRequestException);
  });
});
