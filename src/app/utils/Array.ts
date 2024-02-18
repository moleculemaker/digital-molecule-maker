export function updateAt<T>(arr: T[], index: number, newValue: T) {
  const res = arr.slice();
  res[index] = newValue;
  return res;
}
export function isEmpty<T>(arr: T[]) {
  return arr.every((el) => !el);
}

export function isFull<T>(arr: T[]) {
  return arr.every((el) => !!el);
}
