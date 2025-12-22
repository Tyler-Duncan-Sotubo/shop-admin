export interface AuditLog {
  id: string;
  timestamp: string;
  entity: string;
  entityId: string;
  action: string;
  details: string;
  changes: string;
  ipAddress: string;
  name: string;
  role: string;
}
