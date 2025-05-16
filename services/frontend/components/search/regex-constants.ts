const IMPORT_REGEX =
  /import(?:\s+\S.*(?:[\n\r\u2028\u2029]\s*|[\t\v\f \xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF])|\s{2,})from\s+['"](@\/|..\/)(.*)['"];/g;
const IMPORT_PATH_MATCH_REGEX =
  /^\S*import(?:\s[\w*\s{},]+from\s)?\s*['"](.+)['"];?/gm;

export { IMPORT_PATH_MATCH_REGEX, IMPORT_REGEX };
