import { T } from '../../../../t.const';
import {
  IssueContentConfig,
  IssueFieldType,
} from '../../issue-content/issue-content.model';
import { IssueProviderKey } from '../../issue.model';
import { YoutrackIssue, YoutrackIssueTag } from './youtrack-issue.model';

export const YOUTRACK_ISSUE_CONTENT_CONFIG: IssueContentConfig<YoutrackIssue> = {
  issueType: 'GITLAB' as IssueProviderKey,
  fields: [
    {
      label: T.F.ISSUE.ISSUE_CONTENT.SUMMARY,
      type: IssueFieldType.LINK,
      value: (issue: YoutrackIssue) => `${issue.summary} #${issue.numberInProject}`,
      getLink: (_issue: YoutrackIssue) => '',
    },
    {
      label: T.F.ISSUE.ISSUE_CONTENT.STATUS,
      value: 'state',
      type: IssueFieldType.TEXT,
    },
    {
      label: T.F.ISSUE.ISSUE_CONTENT.ASSIGNEE,
      type: IssueFieldType.LINK,
      value: (issue: YoutrackIssue) => issue.reporter?.fullName,
      getLink: (_issue: YoutrackIssue) => '',
      isVisible: (issue: YoutrackIssue) => !!issue.reporter,
    },
    {
      label: T.F.ISSUE.ISSUE_CONTENT.LABELS,
      type: IssueFieldType.CHIPS,
      value: (issue: YoutrackIssue) =>
        issue.tags?.map((l: YoutrackIssueTag) => ({ name: l.name })),
      isVisible: (issue: YoutrackIssue) => (issue.tags?.length ?? 0) > 0,
    },
    {
      label: T.F.ISSUE.ISSUE_CONTENT.DESCRIPTION,
      value: 'description',
      type: IssueFieldType.MARKDOWN,
      isVisible: (issue: YoutrackIssue) => !!issue.description,
    },
  ],
  getIssueUrl: (_issue: YoutrackIssue) => '',
  hasCollapsingComments: true,
};
