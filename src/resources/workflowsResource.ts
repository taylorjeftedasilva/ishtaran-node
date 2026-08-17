import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, getRequest, postRequest } from '../http/types.js';
import {
  ConditionInput,
  CreateRuleResult,
  CreateWorkflowResult,
  CreateWorkflowVersionResult,
  StateInput,
  TransitionInput,
  WorkflowResponse,
  WorkflowVersionResponse,
  mapCreateRuleResult,
  mapCreateWorkflowResult,
  mapCreateWorkflowVersionResult,
  mapWorkflowResponse,
  mapWorkflowVersionResponse,
} from '../model/workflow.js';

/** Data Plane — `WorkflowRules` (7 rotas de Workflow/Version/Rule; Events/EventTypes em recursos próprios). */
export class WorkflowsResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  create(organizationId: string, name: string): Promise<CreateWorkflowResult> {
    return this.execute(
      postRequest(`/v1/organizations/${organizationId}/workflows`, this.toJson({ name }), false),
      mapCreateWorkflowResult,
    );
  }

  list(organizationId: string): Promise<WorkflowResponse[]> {
    return this.executeList(getRequest(`/v1/organizations/${organizationId}/workflows`), mapWorkflowResponse);
  }

  get(workflowId: string): Promise<WorkflowResponse> {
    return this.execute(getRequest(`/v1/workflows/${workflowId}`), mapWorkflowResponse);
  }

  createVersion(workflowId: string, states: StateInput[], transitions: TransitionInput[]): Promise<CreateWorkflowVersionResult> {
    const body = this.toJson({ states, transitions });
    return this.execute(postRequest(`/v1/workflows/${workflowId}/versions`, body, false), mapCreateWorkflowVersionResult);
  }

  getVersion(workflowId: string, workflowVersionId: string): Promise<WorkflowVersionResponse> {
    return this.execute(getRequest(`/v1/workflows/${workflowId}/versions/${workflowVersionId}`), mapWorkflowVersionResponse);
  }

  publishVersion(workflowId: string, workflowVersionId: string): Promise<void> {
    return this.executeNoContent(postRequest(`/v1/workflows/${workflowId}/versions/${workflowVersionId}/publish`, undefined, false));
  }

  createRule(
    workflowId: string,
    workflowVersionId: string,
    fromStateId: string,
    toStateId: string,
    eventTypeId: string,
    conditions: ConditionInput[],
  ): Promise<CreateRuleResult> {
    const body = this.toJson({ fromStateId, toStateId, eventTypeId, conditions });
    return this.execute(postRequest(`/v1/workflows/${workflowId}/versions/${workflowVersionId}/rules`, body, false), mapCreateRuleResult);
  }
}
