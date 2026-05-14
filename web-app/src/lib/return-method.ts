import { ReturnMethod } from '@prisma/client';
import type { ReturnMethodValue } from '@/types/lending';

const PUBLIC_TO_PRISMA_RETURN_METHOD: Record<ReturnMethodValue, ReturnMethod> = {
  'in-person': ReturnMethod.IN_PERSON,
  'drop-box': ReturnMethod.DROP_BOX,
  shipping: ReturnMethod.SHIPPING,
  courier: ReturnMethod.COURIER
};

const PRISMA_TO_PUBLIC_RETURN_METHOD: Record<ReturnMethod, ReturnMethodValue> = {
  [ReturnMethod.IN_PERSON]: 'in-person',
  [ReturnMethod.DROP_BOX]: 'drop-box',
  [ReturnMethod.SHIPPING]: 'shipping',
  [ReturnMethod.COURIER]: 'courier'
};

export const toPrismaReturnMethod = (
  returnMethod?: ReturnMethodValue
): ReturnMethod | undefined => {
  if (!returnMethod) {
    return undefined;
  }

  return PUBLIC_TO_PRISMA_RETURN_METHOD[returnMethod];
};

export const toPublicReturnMethod = (
  returnMethod?: ReturnMethod | null
): ReturnMethodValue | undefined => {
  if (!returnMethod) {
    return undefined;
  }

  return PRISMA_TO_PUBLIC_RETURN_METHOD[returnMethod];
};
