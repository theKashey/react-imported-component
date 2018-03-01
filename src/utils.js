import crc32 from 'crc-32';

const encipherImport = string => crc32.str(string).toString(32);

export { encipherImport }