// src/utils/encryption.ts
import CryptoJS from 'crypto-js';

const SECRET_KEY = '7mGFCu2Fo6BCHvSJ7UFMx49HXuTX8Y95';

export const encrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decrypt = (ciphertext: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};
