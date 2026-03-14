/**
 * ContainerProvisioned event — emitted when IDE session container is ready (COMP-030.6).
 * Architecture: IDE domain, PAT-009
 */

export interface ContainerProvisionedEvent {
  readonly type: "ide.container.provisioned";
  readonly sessionId: string;
  readonly containerId: string;
  readonly timestamp: Date;
}
