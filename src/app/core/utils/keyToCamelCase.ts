// utils/convert-to-camel.ts
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

export function keysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => keysToCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [toCamelCase(k), keysToCamelCase(v)])
    );
  }
  return obj;
}
