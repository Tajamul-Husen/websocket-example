import { v4 as uuidv4 } from 'uuid';

export const generateUID = (): string => {
  return uuidv4().toString();
};


export const parseJSON = (data) => {
  try {
    return JSON.parse(data);
  } catch (error) {
    throw new Error('Error parsing JSON');
  }
};
