export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_REGEX = {
  length: /^.{6,16}$/,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /\d/,
  special: /\W|_/,
  whitespace: /\s/,
  tab: /\t/,
};