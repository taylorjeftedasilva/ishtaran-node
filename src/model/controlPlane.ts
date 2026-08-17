import { stringFieldOrNull, field } from '../resources/resourceSupport.js';

export interface TokenResult {
  success: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  errorCode: string | null;
}

export function mapTokenResult(raw: unknown): TokenResult {
  return {
    success: Boolean(field(raw, 'success')),
    accessToken: stringFieldOrNull(raw, 'accessToken'),
    refreshToken: stringFieldOrNull(raw, 'refreshToken'),
    expiresAt: stringFieldOrNull(raw, 'expiresAt'),
    errorCode: stringFieldOrNull(raw, 'errorCode'),
  };
}

export interface SignUpResponse {
  organizationId: string;
  memberId: string;
  token: TokenResult;
}

export function mapSignUpResponse(raw: unknown): SignUpResponse {
  return {
    organizationId: stringFieldOrNull(raw, 'organizationId')!,
    memberId: stringFieldOrNull(raw, 'memberId')!,
    token: mapTokenResult(field(raw, 'token')),
  };
}

export interface MemberResponse {
  memberId: string;
  organizationId: string;
  email: string | null;
  role: string | null;
  status: string | null;
  createdAt: string;
  activatedAt: string | null;
  lastLoginAt: string | null;
}

export function mapMemberResponse(raw: unknown): MemberResponse {
  return {
    memberId: stringFieldOrNull(raw, 'memberId')!,
    organizationId: stringFieldOrNull(raw, 'organizationId')!,
    email: stringFieldOrNull(raw, 'email'),
    role: stringFieldOrNull(raw, 'role'),
    status: stringFieldOrNull(raw, 'status'),
    createdAt: stringFieldOrNull(raw, 'createdAt')!,
    activatedAt: stringFieldOrNull(raw, 'activatedAt'),
    lastLoginAt: stringFieldOrNull(raw, 'lastLoginAt'),
  };
}

export interface InviteMemberResult {
  memberId: string;
  plainTextInviteToken: string | null;
}

export function mapInviteMemberResult(raw: unknown): InviteMemberResult {
  return {
    memberId: stringFieldOrNull(raw, 'memberId')!,
    plainTextInviteToken: stringFieldOrNull(raw, 'plainTextInviteToken'),
  };
}

export interface CreatedResourceResponse {
  id: string;
}

export function mapCreatedResourceResponse(raw: unknown): CreatedResourceResponse {
  return { id: stringFieldOrNull(raw, 'id')! };
}

export interface OrganizationResponse {
  organizationId: string;
  name: string | null;
  status: string | null;
  createdAt: string;
}

export function mapOrganizationResponse(raw: unknown): OrganizationResponse {
  return {
    organizationId: stringFieldOrNull(raw, 'organizationId')!,
    name: stringFieldOrNull(raw, 'name'),
    status: stringFieldOrNull(raw, 'status'),
    createdAt: stringFieldOrNull(raw, 'createdAt')!,
  };
}

export interface ApplicationResponse {
  applicationId: string;
  organizationId: string;
  name: string | null;
  status: string | null;
}

export function mapApplicationResponse(raw: unknown): ApplicationResponse {
  return {
    applicationId: stringFieldOrNull(raw, 'applicationId')!,
    organizationId: stringFieldOrNull(raw, 'organizationId')!,
    name: stringFieldOrNull(raw, 'name'),
    status: stringFieldOrNull(raw, 'status'),
  };
}

export interface ApiKeyMetadataResponse {
  apiKeyId: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export function mapApiKeyMetadataResponse(raw: unknown): ApiKeyMetadataResponse {
  return {
    apiKeyId: stringFieldOrNull(raw, 'apiKeyId')!,
    createdAt: stringFieldOrNull(raw, 'createdAt')!,
    lastUsedAt: stringFieldOrNull(raw, 'lastUsedAt'),
  };
}

export interface GenerateApiKeyResult {
  apiKeyId: string;
  plainTextKey: string | null;
}

export function mapGenerateApiKeyResult(raw: unknown): GenerateApiKeyResult {
  return {
    apiKeyId: stringFieldOrNull(raw, 'apiKeyId')!,
    plainTextKey: stringFieldOrNull(raw, 'plainTextKey'),
  };
}

export interface RotateApiKeyResult {
  newApiKeyId: string;
  plainTextKey: string | null;
}

export function mapRotateApiKeyResult(raw: unknown): RotateApiKeyResult {
  return {
    newApiKeyId: stringFieldOrNull(raw, 'newApiKeyId')!,
    plainTextKey: stringFieldOrNull(raw, 'plainTextKey'),
  };
}

export interface AssetResponse {
  assetId: string;
  symbol: string | null;
  name: string | null;
  decimals: number;
  kind: string | null;
  status: string | null;
  createdAt: string;
}

export function mapAssetResponse(raw: unknown): AssetResponse {
  return {
    assetId: stringFieldOrNull(raw, 'assetId')!,
    symbol: stringFieldOrNull(raw, 'symbol'),
    name: stringFieldOrNull(raw, 'name'),
    decimals: Number(field(raw, 'decimals')),
    kind: stringFieldOrNull(raw, 'kind'),
    status: stringFieldOrNull(raw, 'status'),
    createdAt: stringFieldOrNull(raw, 'createdAt')!,
  };
}

export interface NetworkResponse {
  networkId: string;
  code: string | null;
  name: string | null;
  chainId: number | null;
  isTestnet: boolean;
  status: string | null;
  createdAt: string;
}

export function mapNetworkResponse(raw: unknown): NetworkResponse {
  const chainId = field(raw, 'chainId');
  return {
    networkId: stringFieldOrNull(raw, 'networkId')!,
    code: stringFieldOrNull(raw, 'code'),
    name: stringFieldOrNull(raw, 'name'),
    chainId: chainId === null || chainId === undefined ? null : Number(chainId),
    isTestnet: Boolean(field(raw, 'isTestnet')),
    status: stringFieldOrNull(raw, 'status'),
    createdAt: stringFieldOrNull(raw, 'createdAt')!,
  };
}

export interface AssetNetworkResponse {
  assetNetworkId: string;
  assetId: string;
  networkId: string;
  minConfirmations: number;
  minAmount: string | null;
  maxAmount: string | null;
  estimatedFee: string | null;
  contractAddress: string | null;
  status: string | null;
  createdAt: string;
}

export function mapAssetNetworkResponse(raw: unknown): AssetNetworkResponse {
  return {
    assetNetworkId: stringFieldOrNull(raw, 'assetNetworkId')!,
    assetId: stringFieldOrNull(raw, 'assetId')!,
    networkId: stringFieldOrNull(raw, 'networkId')!,
    minConfirmations: Number(field(raw, 'minConfirmations')),
    minAmount: stringFieldOrNull(raw, 'minAmount'),
    maxAmount: stringFieldOrNull(raw, 'maxAmount'),
    estimatedFee: stringFieldOrNull(raw, 'estimatedFee'),
    contractAddress: stringFieldOrNull(raw, 'contractAddress'),
    status: stringFieldOrNull(raw, 'status'),
    createdAt: stringFieldOrNull(raw, 'createdAt')!,
  };
}
