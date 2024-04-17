
import { TransformFnParams } from 'class-transformer';

export class StringToNumberTransformer {
  to(params: TransformFnParams): number {
    return parseFloat(params.value);
  }
}