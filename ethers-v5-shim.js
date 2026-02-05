// Ethers v5 compatibility shim for thirdweb
// Maps ethers v5 imports to ethers v6 equivalents
import * as ethers from "ethers";

export const Interface = ethers.Interface;
export const isAddress = ethers.isAddress;
export const defineReadOnly = (obj, name, value) => {
  Object.defineProperty(obj, name, {
    value,
    writable: false,
    enumerable: true,
    configurable: false,
  });
};

// Re-export everything from ethers v6
export * from "ethers";
