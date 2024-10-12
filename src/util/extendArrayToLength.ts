export function extendArrayToLength<T>(arr: T[], length: number, fill: T) {
  if (arr.length >= length) {
    return arr;
  }
  const diff = length - arr.length;
  const fillItems = new Array(diff).fill(fill);
  return arr.concat(fillItems);
}
