export function debug(msg) {
  printErr(msg);
}

export function debugJson(obj) {
  printErr(JSON.stringify(obj));
}

export function randomIndex(array) {
  return Math.floor(Math.random() * array.length);
}


export function randomElement(array) {
  return array[randomIndex(array)];
}

export function portStarBoard(orientation) {
  return [Math.abs(orientation + 1) % 6, Math.abs(orientation - 1) % 6];
}