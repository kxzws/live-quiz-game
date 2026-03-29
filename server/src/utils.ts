import { createHash } from "node:crypto";

export const generateSimpleCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

export const getHash = (value: string): string => {
  const hash = createHash("sha256");

  hash.update(value);

  return hash.digest("hex");
};
