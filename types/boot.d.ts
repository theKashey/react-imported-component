import {ImportedComponents} from "./types";

export function whenComponentsReady(): Promise<void>;

export function assignImportedComponents(importedComponents: ImportedComponents): void;

export function setConfiguration(config: { SSR?: boolean, hot?: boolean }): void;

export function rehydrateMarks(marks?: Array<string>): Promise<void>;