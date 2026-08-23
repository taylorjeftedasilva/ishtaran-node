import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, getRequest, postRequest } from '../http/types.js';
import { CreateEventTypeResult, EventTypeResponse, mapCreateEventTypeResult, mapEventTypeResponse } from '../model/workflow.js';

/** Data Plane -- `EventTypes` (2 real routes, same `WorkflowRules` module). */
export class EventTypesResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  create(organizationId: string, name: string): Promise<CreateEventTypeResult> {
    return this.execute(
      postRequest(`/v1/organizations/${organizationId}/event-types`, this.toJson({ name }), false),
      mapCreateEventTypeResult,
    );
  }

  list(organizationId: string): Promise<EventTypeResponse[]> {
    return this.executeList(getRequest(`/v1/organizations/${organizationId}/event-types`), mapEventTypeResponse);
  }
}
