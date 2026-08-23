import { HttpTransport, IshtaranHttpRequest } from '../http/types.js';
import { mapError } from '../error/errorMapper.js';
import { parseLossless } from '../util/json.js';

/**
 * Common base for every resource -- centralizes request execution + lossless parsing + error
 * mapping, so no resource duplicates this logic.
 */
export abstract class ResourceSupport {
  protected constructor(protected readonly transport: HttpTransport) {}

  protected async execute<T>(request: IshtaranHttpRequest, mapper: (raw: unknown) => T): Promise<T> {
    const response = await this.transport.send(request);
    if (response.status >= 400) {
      throw mapError(response);
    }
    if (!response.body || response.body.trim() === '') {
      return undefined as T;
    }
    const raw = parseLossless(response.body);
    return mapper(raw);
  }

  protected async executeList<T>(request: IshtaranHttpRequest, mapper: (raw: unknown) => T): Promise<T[]> {
    const response = await this.transport.send(request);
    if (response.status >= 400) {
      throw mapError(response);
    }
    if (!response.body || response.body.trim() === '') {
      return [];
    }
    const raw = parseLossless(response.body);
    if (!Array.isArray(raw)) {
      throw new Error('Expected an array response, got a different format');
    }
    return raw.map(mapper);
  }

  protected async executeNoContent(request: IshtaranHttpRequest): Promise<void> {
    const response = await this.transport.send(request);
    if (response.status >= 400) {
      throw mapError(response);
    }
  }

  protected toJson(value: unknown): string {
    return JSON.stringify(value);
  }
}

export function field(raw: unknown, name: string): unknown {
  if (raw === null || typeof raw !== 'object') {
    throw new Error(`Expected an object to read field "${name}"`);
  }
  return (raw as Record<string, unknown>)[name];
}

export function stringField(raw: unknown, name: string): string {
  const value = field(raw, name);
  if (typeof value !== 'string') {
    throw new Error(`Field "${name}" should be a string`);
  }
  return value;
}

export function stringFieldOrNull(raw: unknown, name: string): string | null {
  const value = field(raw, name);
  return value === null || value === undefined ? null : String(value);
}

export function boolField(raw: unknown, name: string): boolean {
  const value = field(raw, name);
  if (typeof value !== 'boolean') {
    throw new Error(`Field "${name}" should be a boolean`);
  }
  return value;
}

export function arrayField<T>(raw: unknown, name: string, mapper: (item: unknown) => T): T[] {
  const value = field(raw, name);
  if (value === null || value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new Error(`Field "${name}" should be an array`);
  }
  return value.map(mapper);
}

export function arrayFieldOrNull<T>(raw: unknown, name: string, mapper: (item: unknown) => T): T[] | null {
  const value = field(raw, name);
  if (value === null || value === undefined) {
    return null;
  }
  if (!Array.isArray(value)) {
    throw new Error(`Field "${name}" should be an array`);
  }
  return value.map(mapper);
}
