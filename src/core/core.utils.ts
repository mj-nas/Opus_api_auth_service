import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ValidationError, isObject, validate } from 'class-validator';
import { Request } from 'express';
import { plural } from 'pluralize';
import { APP_MIN_VERSION, APP_VERSION } from 'src/app.config';
import { v1 as uuidv1 } from 'uuid';
import { ZodString, z } from 'zod';

const saltOrRounds = 10;

export async function generateHash(text: string): Promise<string> {
  return await bcrypt.hash(text, saltOrRounds);
}

export async function compareHash(
  text: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compare(text, hash);
}

export const uuid = (): string => uuidv1();

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

export const otp = (length = 6): string =>
  !!process.env.OTP_TEST_MODE
    ? Array(length)
        .fill(null)
        .map((e, i) => i + 1)
        .join('')
    : `${Math.floor(
        Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1),
      )}`;

export const randomString = (length = 10): string =>
  Math.random()
    .toString(36)
    .substring(2, length + 2);

export const snakeCase = (str: string): string =>
  str
    .split(/(?=[A-Z])/)
    .join('_')
    .toLowerCase();

export const isPrimaryInstance = (): boolean =>
  typeof process.env.NODE_APP_INSTANCE === 'undefined' ||
  process.env.NODE_APP_INSTANCE === '0';

export const pluralizeString = (str: string): string => plural(str);

export const addDays = (days: number) => {
  return new Date().setDate(new Date().getDate() + days) || undefined;
};

/**
 * trimFields - function to trim all field in an object
 *
 * @param {any} payload Payload object to be validated
 * @param {string[]} [exclude = []] Fields to be excluded from trim
 *
 *```js
 * const payload = trimFields(
      payload,
      ['password'],
    )
 * ```
 */
export function trimFields(payload: unknown, exclude: string[] = []) {
  if (!isObject(payload)) throw new Error(`Value must be an object`);
  Object.keys(payload).forEach((key) => {
    if (!exclude.includes(key)) {
      if (isObject(payload[key])) {
        payload[key] = trimFields(payload[key], []);
      } else {
        if (typeof payload[key] === 'string') {
          payload[key] = payload[key].trim();
        }
      }
    }
  });
  return payload;
}

/**
 * trimAndValidate - function to trim all field and validate based on dto
 *
 * @param {any} dto DTO definition
 * @param {any} payload Payload object to be validated
 * @param {string[]} [exclude] Fields to be excluded from trim
 *
 *```js
 * const payload = await trimAndValidate(
      LocalAuthDto,
      payload,
      ['password'],
    )
 * ```
 */
export async function trimAndValidate(
  dto: any,
  payload: any,
  exclude?: string[],
) {
  const dtoObj = new dto();
  payload = trimFields(payload, exclude);
  for (const key in payload) {
    dtoObj[key] = payload[key];
  }
  const errors = await validate(dtoObj, {
    whitelist: true,
    validationError: {
      target: false,
    },
  });
  if (errors.length > 0) throw new BadRequestException(errors);
  return payload;
}

export function getNumbersBetweenAsString(start: number, end: number) {
  const numbers: string[] = [];
  for (let index = start; index <= end; index++) {
    numbers.push(`${index}`);
  }
  return numbers;
}

export const extractVersion = (request: Request) => {
  return request.headers['x-application-version'] || `${APP_VERSION}`;
};

export const getVersions = () =>
  getNumbersBetweenAsString(APP_MIN_VERSION, APP_VERSION);

export const parseStringWithWhitespace = (pipes: ZodString) =>
  z
    .string()
    .refine((value) => !/^\s|\s$/.test(value), {
      message: 'Leading or trailing white spaces are not allowed',
    })
    .pipe(pipes);

export const generateRandomPassword = (length: number): string => {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '1234567890';
  const symbols = '!@#&';

  const allChars = uppercaseChars + lowercaseChars + numberChars + symbols;
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length);
    password += allChars[randomIndex];
  }

  return password;
};

/**
 * trimAndValidateCustom - function to trim all field and validate based on dto
 *
 * @param {any} dto DTO definition
 * @param {any} payload Payload object to be validated
 * @param {string[]} [exclude] Fields to be excluded from trim
 *
 *```js
 * const payload = await trimAndValidateCustom(
      LocalAuthDto,
      payload,
      ['password'],
    )
 * ```
 */
export async function trimAndValidateCustom(
  dto: any,
  payload: any,
  exclude?: string[],
): Promise<{ errors?: ValidationError[]; payload?: any }> {
  const dtoObj = new dto();
  payload = trimFields(payload, exclude);
  for (const key in payload) {
    dtoObj[key] = payload[key];
  }
  const errors = await validate(dtoObj, {
    whitelist: true,
    validationError: {
      target: false,
    },
  });
  if (errors.length > 0) return { errors };
  return { payload };
}
