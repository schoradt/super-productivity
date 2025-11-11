import { inject, Injectable } from '@angular/core';
import { YoutrackCfg } from './youtrack.model';
import { Observable, ObservableInput, throwError } from 'rxjs';
import { YoutrackIssue, YoutrackUser } from './youtrack-issue.model';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { catchError, filter, map } from 'rxjs/operators';
import { T } from '../../../../t.const';
import { ISSUE_PROVIDER_HUMANIZED, YOUTRACK_TYPE } from '../../issue.const';
import { HANDLED_ERROR_PROP_STR } from '../../../../app.constants';
import { SnackService } from '../../../../core/snack/snack.service';
import { throwHandledError } from '../../../../util/throw-handled-error';

@Injectable({
  providedIn: 'root',
})
export class YoutrackApiService {
  private readonly http = inject(HttpClient);
  private readonly snackService = inject(SnackService);

  // HTTP communication methods
  getMe$(cfg: YoutrackCfg): Observable<YoutrackUser> {
    return this._sendRequest$(
      {
        url: `${cfg.server}/api/users/me`,
      },
      cfg,
    );
  }

  getById$(issueId: string | number, cfg: YoutrackCfg): Observable<YoutrackIssue> {
    return this._sendRequest$(
      {
        url: `${cfg.server}/api/issues/${issueId}`,
      },
      cfg,
    );
  }

  searchIssue$(query: string, cfg: YoutrackCfg): Observable<YoutrackIssue[]> {
    return this._sendRequest$(
      {
        url: `${cfg.server}/api/issues?query=${query}&fields=id,summary,description,reporter(login)`,
      },
      cfg,
    );
  }

  private _sendRequest$(
    params: HttpRequest<string> | any,
    cfg: YoutrackCfg,
  ): Observable<any> {
    this._checkSettings(cfg);

    const p: HttpRequest<any> | any = {
      ...params,
      method: params.method || 'GET',
      headers: {
        ...(cfg.token ? { Authorization: 'Bearer ' + cfg.token } : {}),
        ...(params.headers ? params.headers : {}),
      },
    };

    const bodyArg = params.data ? [params.data] : [];

    // Handle params - if it's already an HttpParams object, use it directly
    const httpParams =
      params.params instanceof HttpParams
        ? params.params
        : new HttpParams({ fromObject: p.params || {} });

    const allArgs = [
      ...bodyArg,
      {
        headers: new HttpHeaders(p.headers),
        params: httpParams,
        reportProgress: false,
        observe: 'response',
        responseType: params.responseType,
      },
    ];
    const req = new HttpRequest(p.method, p.url, ...allArgs);
    return this.http.request(req).pipe(
      // Filter out HttpEventType.Sent (type: 0) events to only process actual responses
      filter((res) => !(res === Object(res) && res.type === 0)),
      map((res) =>
        res && (res as { body?: unknown }).body ? (res as { body: unknown }).body : res,
      ),
      catchError(this._handleRequestError$.bind(this)),
    );
  }

  private _handleRequestError$(
    error: HttpErrorResponse,
    _caught: Observable<unknown>,
  ): ObservableInput<unknown> {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      this.snackService.open({
        type: 'ERROR',
        msg: T.F.ISSUE.S.ERR_NETWORK,
        translateParams: {
          issueProviderName: ISSUE_PROVIDER_HUMANIZED[YOUTRACK_TYPE],
        },
      });
    } else if (error.error?.message) {
      this.snackService.open({
        type: 'ERROR',
        msg: ISSUE_PROVIDER_HUMANIZED[YOUTRACK_TYPE] + ': ' + error.error.message,
      });
    } else {
      // The backend returned an unsuccessful response code.
      this.snackService.open({
        type: 'ERROR',
        translateParams: {
          errorMsg:
            (error.error && (error.error.name || error.error.statusText)) ||
            error.toString(),
          statusCode: error.status,
        },
        msg: T.F.GITHUB.S.ERR_UNKNOWN,
      });
    }
    if (error?.message) {
      return throwError({ [HANDLED_ERROR_PROP_STR]: 'Youtrack: ' + error.message });
    }

    return throwError({ [HANDLED_ERROR_PROP_STR]: 'Youtrack: Api request failed.' });
  }

  private _checkSettings(cfg: YoutrackCfg): void {
    if (!this._isValidSettings(cfg)) {
      this.snackService.open({
        type: 'ERROR',
        msg: T.F.ISSUE.S.ERR_NOT_CONFIGURED,
        translateParams: {
          issueProviderName: ISSUE_PROVIDER_HUMANIZED[YOUTRACK_TYPE],
        },
      });
      throwHandledError('Youtrack: Not enough settings');
    }
  }

  private _isValidSettings(cfg: YoutrackCfg): boolean {
    return !!cfg && !!cfg.server && cfg.server.length > 0;
  }
}
