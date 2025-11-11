import { inject, Injectable } from '@angular/core';
import { IssueServiceInterface } from '../../issue-service-interface';
import { YoutrackCfg } from './youtrack.model';
import { isYoutrackEnabled } from './is-youtrack-enabled.utils';
import { TaskAttachment } from 'src/app/features/tasks/task-attachment/task-attachment.model';
import { IssueTask, Task } from 'src/app/features/tasks/task.model';
import {
  IssueData,
  IssueDataReduced,
  IssueProviderYoutrack,
  SearchResultItem,
} from '../../issue.model';
import { YOUTRACK_POLL_INTERVAL } from './youtrack.const';
import { YoutrackApiService } from './youtrack-api.service';
import { IssueProviderService } from '../../issue-provider.service';
import { concatMap, map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { YoutrackIssue, YoutrackIssueReduced } from './youtrack-issue.model';

@Injectable({
  providedIn: 'root',
})
export class YoutrackCommonInterfacesService implements IssueServiceInterface {
  private readonly youtrackApiService = inject(YoutrackApiService);
  private readonly issueProviderService = inject(IssueProviderService);

  pollInterval: number = YOUTRACK_POLL_INTERVAL;

  isEnabled(cfg: YoutrackCfg): boolean {
    return isYoutrackEnabled(cfg);
  }

  testConnection(cfg: YoutrackCfg): Promise<boolean> {
    return this.youtrackApiService
      .getMe$(cfg)
      .toPromise()
      .then((result) => !!result);
  }

  issueLink(issueId: string | number, issueProviderId: string): Promise<string> {
    return this.getCfgOnce$(issueProviderId)
      .pipe(map((cfg) => `${cfg.server}/issue/${issueId}`))
      .toPromise()
      .then((result) => result ?? '');
  }
  getById(issueId: string | number, issueProviderId: string): Promise<IssueData | null> {
    return this.getCfgOnce$(issueProviderId)
      .pipe(
        concatMap((githubCfg) => this.youtrackApiService.getById$(issueId, githubCfg)),
      )
      .toPromise()
      .then((result) => {
        if (!result) {
          throw new Error('Failed to get GitHub issue');
        }
        return result;
      });
  }

  searchIssues(searchTerm: string, issueProviderId: string): Promise<SearchResultItem[]> {
    return this.getCfgOnce$(issueProviderId)
      .pipe(
        switchMap((youtrackCfg) =>
          this.isEnabled(youtrackCfg)
            ? this.youtrackApiService.searchIssue$(searchTerm, youtrackCfg)
            : of([]),
        ),
      )
      .toPromise()
      .then((result) => result.map(this.convertToResult) ?? []);
  }

  getAddTaskData(issueData: YoutrackIssueReduced): IssueTask {
    return {
      title: issueData.summary || 'Youtrack issue ' + issueData.id,
      ...issueData,
    };
  }

  private convertToResult(issue: YoutrackIssue): SearchResultItem {
    return {
      title: issue.summary || 'Youtrack issue ' + issue.id,
      issueData: issue,
      issueType: 'YOUTRACK',
      titleHighlighted: issue.summary,
    };
  }

  async getFreshDataForIssueTask(task: Task): Promise<{
    taskChanges: Partial<Task>;
    issue: IssueData;
    issueTitle: string;
  } | null> {
    if (!task.issueProviderId) {
      throw new Error('No issueProviderId');
    }
    if (!task.issueId) {
      throw new Error('No issueId');
    }

    const cfg = await this.getCfgOnce$(task.issueProviderId).toPromise();
    const issue = await this.youtrackApiService.getById$(+task.issueId, cfg).toPromise();

    console.log('YOUTRACK integration service - compare data {} <> {}', task, issue);

    return null;
  }
  getFreshDataForIssueTasks(
    tasks: Task[],
  ): Promise<{ task: Task; taskChanges: Partial<Task>; issue: IssueData }[]> {
    return Promise.all(
      tasks.map((task) =>
        this.getFreshDataForIssueTask(task).then((refreshDataForTask) => ({
          task,
          refreshDataForTask,
        })),
      ),
    ).then((items) => {
      return items
        .filter(({ refreshDataForTask, task }) => !!refreshDataForTask)
        .map(({ refreshDataForTask, task }) => {
          if (!refreshDataForTask) {
            throw new Error('No refresh data for task js error');
          }
          return {
            task,
            taskChanges: refreshDataForTask.taskChanges,
            issue: refreshDataForTask.issue,
          };
        });
    });
  }
  getMappedAttachments?(issueData: IssueData): TaskAttachment[] {
    return [];
  }
  getNewIssuesToAddToBacklog?(
    issueProviderId: string,
    allExistingIssueIds: number[] | string[],
  ): Promise<IssueDataReduced[]> {
    console.log(
      'YOUTRACK integration service - dont fetch provider issues {}',
      issueProviderId,
    );
    return of([]).toPromise();
  }

  updateIssueFromTask?(task: Task): Promise<void> {
    console.log('YOUTRACK integration service - update {}', task);
    // ignore writes now
    return of().toPromise();
  }

  private getCfgOnce$(issueProviderId: string): Observable<IssueProviderYoutrack> {
    return this.issueProviderService.getCfgOnce$(issueProviderId, 'YOUTRACK');
  }
}
