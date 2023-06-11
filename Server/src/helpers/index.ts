import { v4 as uuidv4 } from 'uuid';

export const generateUid = (): string => {
  return uuidv4().toString();
};
