import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, deleteRequest, getRequest, postRequest } from '../http/types.js';
import { InviteMemberResult, MemberResponse, TokenResult, mapInviteMemberResult, mapMemberResponse, mapTokenResult } from '../model/controlPlane.js';
import { EnumValue } from '../model/enumFactory.js';

/** Control Plane — `Members` (7 rotas reais, IdentityAccess). */
export class MembersResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  invite(organizationId: string, email: string, role: EnumValue<number>): Promise<InviteMemberResult> {
    const body = this.toJson({ email, role: role.rawValue });
    return this.execute(postRequest(`/v1/organizations/${organizationId}/members`, body, false), mapInviteMemberResult);
  }

  /** Devolve o token real de acesso — mesmo mecanismo de `auth.login()` preenche a sessão do client. */
  acceptInvite(inviteToken: string, password: string): Promise<TokenResult> {
    const body = this.toJson({ inviteToken, password });
    return this.execute(postRequest('/v1/members/accept-invite', body, false), mapTokenResult);
  }

  list(organizationId: string): Promise<MemberResponse[]> {
    return this.executeList(getRequest(`/v1/organizations/${organizationId}/members`), mapMemberResponse);
  }

  assignRole(memberId: string, newRole: EnumValue<number>): Promise<void> {
    const body = this.toJson({ newRole: newRole.rawValue });
    return this.executeNoContent(postRequest(`/v1/members/${memberId}/role`, body, false));
  }

  suspend(memberId: string, reason?: string): Promise<void> {
    const body = this.toJson({ reason: reason ?? '' });
    return this.executeNoContent(postRequest(`/v1/members/${memberId}/suspend`, body, false));
  }

  reactivate(memberId: string): Promise<void> {
    return this.executeNoContent(postRequest(`/v1/members/${memberId}/reactivate`, undefined, false));
  }

  remove(memberId: string): Promise<void> {
    return this.executeNoContent(deleteRequest(`/v1/members/${memberId}`));
  }
}
