import {
  areProvidersConfigured,
  shouldShowProviderSetupPrompt,
} from './providerSetup';
import type { CredentialsStatus } from './types';

function credentials(
  volcengineConfigured: boolean,
  arkConfigured: boolean,
): CredentialsStatus {
  return {
    volcengineConfigured,
    arkConfigured,
    asrHealth: { state: 'unknown', checkedAt: null, message: null, consecutiveFailures: 0 },
    llmHealth: { state: 'unknown', checkedAt: null, message: null, consecutiveFailures: 0 },
  };
}

function assertEqual(actual: boolean, expected: boolean, name: string) {
  if (actual !== expected) {
    throw new Error(`${name}: expected ${expected}, got ${actual}`);
  }
}

assertEqual(
  areProvidersConfigured(credentials(true, true)),
  true,
  'configured when ASR and LLM are both ready',
);

assertEqual(
  areProvidersConfigured(credentials(false, true)),
  false,
  'not configured when ASR provider is missing',
);

assertEqual(
  areProvidersConfigured(credentials(true, false)),
  false,
  'not configured when LLM provider is missing',
);

assertEqual(
  shouldShowProviderSetupPrompt(
    credentials(false, false),
    null,
  ),
  true,
  'show first-run prompt when providers are missing and no prompt was seen',
);

assertEqual(
  shouldShowProviderSetupPrompt(
    credentials(false, false),
    '1',
  ),
  false,
  'do not repeat first-run prompt after the user has deferred it in this session',
);

assertEqual(
  shouldShowProviderSetupPrompt(
    credentials(true, true),
    null,
  ),
  false,
  'do not show prompt when providers are already configured',
);
