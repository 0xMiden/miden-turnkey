import { Buffer } from "buffer";
import process from "process";

// Polyfill global Buffer and process for browser environment
(globalThis as any).Buffer = Buffer;
(globalThis as any).process = process;
