import { describe, expect, it } from 'vitest';
import { buildClientConfig, describeConfig } from './clientConfig.js';
import { Environment } from './environment.js';
import { LOCAL_BASE_URL, SANDBOX_BASE_URL } from './endpoints.js';

describe('buildClientConfig', () => {
  it('resolves Environment.Local to the real local default without explicit baseUrl', () => {
    const config = buildClientConfig({ environment: Environment.Local });
    expect(config.baseUrl).toBe(LOCAL_BASE_URL);
  });

  it('resolves Environment.Sandbox to the real sandbox default without explicit baseUrl', () => {
    const config = buildClientConfig({ environment: Environment.Sandbox });
    expect(config.baseUrl).toBe(SANDBOX_BASE_URL);
  });

  it('throws for Environment.Production without explicit baseUrl', () => {
    expect(() => buildClientConfig({ environment: Environment.Production })).toThrow();
  });

  it('explicit baseUrl always wins regardless of environment', () => {
    const config = buildClientConfig({ environment: Environment.Sandbox, baseUrl: 'https://custom.example.com' });
    expect(config.baseUrl).toBe('https://custom.example.com');
  });

  it('insecure TLS override only allowed for Local', () => {
    expect(() =>
      buildClientConfig({
        environment: Environment.Sandbox,
        baseUrl: 'https://custom.example.com',
        allowInsecureTlsForLocalDevelopment: true,
      }),
    ).toThrow();
  });

  it('insecure TLS override allowed for Local', () => {
    const config = buildClientConfig({ environment: Environment.Local, allowInsecureTlsForLocalDevelopment: true });
    expect(config.allowInsecureTlsForLocalDevelopment).toBe(true);
  });

  it('describeConfig never leaks the API key in plain text', () => {
    const config = buildClientConfig({ environment: Environment.Local, apiKey: 'supersecretapikeyvalue1234567890' });
    const described = describeConfig(config);
    expect(described).toContain('****');
    expect(described).not.toContain('supersecretapikeyvalue1234567890');
  });

  it('defaults are sane and finite, never infinite timeout', () => {
    const config = buildClientConfig({});
    expect(config.connectTimeoutMs).toBeGreaterThan(0);
    expect(config.requestTimeoutMs).toBeGreaterThan(0);
    expect(config.userAgent.startsWith('ishtaran-node/')).toBe(true);
  });
});
