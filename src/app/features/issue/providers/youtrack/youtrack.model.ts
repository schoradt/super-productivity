import { BaseIssueProviderCfg } from '../../issue.model';

export interface YoutrackCfg extends BaseIssueProviderCfg {
  server: string;
  token?: string;
}
