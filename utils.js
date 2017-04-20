export function debug(msg) {
  printErr(msg);
}

export function debugJson(obj) {
  printErr(JSON.stringify(obj));
}

