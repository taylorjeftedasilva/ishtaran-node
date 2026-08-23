import { arrayFieldOrNull, boolField, field, stringField, stringFieldOrNull } from '../resources/resourceSupport.js';

/**
 * DEC-032 -- an explicit link (never ownership) between an Organization and an
 * `AccountHolder`/`Account`. `authorizedApplicationIds` is scoped to THIS Relationship -- never
 * leaks to another Organization related to the same AccountHolder. Returned by `accounts.list()`.
 */
export interface OrganizationAccountResponse {
  relationshipId: string;
  accountId: string;
  accountHolderId: string;
  externalId: string | null;
  relationshipStatus: string | null;
  accountStatus: string | null;
  createdAt: string;
  authorizedApplicationIds: string[];
}

export function mapOrganizationAccountResponse(raw: unknown): OrganizationAccountResponse {
  return {
    relationshipId: stringFieldOrNull(raw, 'relationshipId')!,
    accountId: stringFieldOrNull(raw, 'accountId')!,
    accountHolderId: stringFieldOrNull(raw, 'accountHolderId')!,
    externalId: stringFieldOrNull(raw, 'externalId'),
    relationshipStatus: stringFieldOrNull(raw, 'relationshipStatus'),
    accountStatus: stringFieldOrNull(raw, 'accountStatus'),
    createdAt: stringFieldOrNull(raw, 'createdAt')!,
    authorizedApplicationIds: arrayFieldOrNull(raw, 'authorizedApplicationIds', (x) => String(x)) ?? [],
  };
}

export interface CreateAccountHolderInvitationResult {
  invitationId: string;
  /** Plain text -- only exists in this response, once. Never persisted/logged by the SDK. */
  plainTextToken: string;
  expiresAt: string;
}

export function mapCreateAccountHolderInvitationResult(raw: unknown): CreateAccountHolderInvitationResult {
  return {
    invitationId: stringFieldOrNull(raw, 'invitationId')!,
    plainTextToken: stringField(raw, 'plainTextToken'),
    expiresAt: stringFieldOrNull(raw, 'expiresAt')!,
  };
}

/**
 * DEC-032 -- result of `accountHolders.signup()`/`.login()`. A dedicated type (never
 * `TokenResult` from `controlPlane.ts`): the `AccountHolder` has no Refresh Token in this
 * version (MVP, scope deliberately reduced by the backend) and never carries
 * `organizationId`/`Role`.
 */
export interface AccountHolderTokenResult {
  success: boolean;
  accessToken: string | null;
  expiresAt: string | null;
  errorCode: string | null;
}

export function mapAccountHolderTokenResult(raw: unknown): AccountHolderTokenResult {
  return {
    success: boolField(raw, 'success'),
    accessToken: stringFieldOrNull(raw, 'accessToken'),
    expiresAt: stringFieldOrNull(raw, 'expiresAt'),
    errorCode: stringFieldOrNull(raw, 'errorCode'),
  };
}

export interface AccountHolderResponse {
  accountHolderId: string;
  accountId: string;
  email: string | null;
  hasCredentials: boolean;
  status: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

export function mapAccountHolderResponse(raw: unknown): AccountHolderResponse {
  return {
    accountHolderId: stringFieldOrNull(raw, 'accountHolderId')!,
    accountId: stringFieldOrNull(raw, 'accountId')!,
    email: stringFieldOrNull(raw, 'email'),
    hasCredentials: boolField(raw, 'hasCredentials'),
    status: stringFieldOrNull(raw, 'status'),
    createdAt: stringFieldOrNull(raw, 'createdAt')!,
    lastLoginAt: stringFieldOrNull(raw, 'lastLoginAt'),
  };
}

export interface ClaimAccountHolderInvitationResult {
  success: boolean;
  relationshipId: string | null;
  errorCode: string | null;
}

export function mapClaimAccountHolderInvitationResult(raw: unknown): ClaimAccountHolderInvitationResult {
  return {
    success: boolField(raw, 'success'),
    relationshipId: stringFieldOrNull(raw, 'relationshipId'),
    errorCode: stringFieldOrNull(raw, 'errorCode'),
  };
}

export interface SignUpAndClaimAccountHolderInvitationResult {
  success: boolean;
  relationshipId: string | null;
  token: AccountHolderTokenResult | null;
  errorCode: string | null;
}

export function mapSignUpAndClaimAccountHolderInvitationResult(raw: unknown): SignUpAndClaimAccountHolderInvitationResult {
  const tokenRaw = field(raw, 'token');
  return {
    success: boolField(raw, 'success'),
    relationshipId: stringFieldOrNull(raw, 'relationshipId'),
    token: tokenRaw === null || tokenRaw === undefined ? null : mapAccountHolderTokenResult(tokenRaw),
    errorCode: stringFieldOrNull(raw, 'errorCode'),
  };
}
