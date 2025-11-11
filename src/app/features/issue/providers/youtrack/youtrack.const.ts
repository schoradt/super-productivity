import {
  ConfigFormSection,
  LimitedFormlyFieldConfig,
} from '../../../config/global-config.model';
import { YoutrackCfg } from './youtrack.model';
import { IssueProviderYoutrack } from '../../issue.model';
import { T } from '../../../../t.const';

export const YOUTRACK_INITIAL_POLL_DELAY = 5000;
export const YOUTRACK_POLL_INTERVAL = 5 * 60 * 1000;

export const DEFAULT_YOUTRACK_CFG: YoutrackCfg = {
  server: '',
  isEnabled: false,
};

export const YOUTRACK_CONFIG_FORM: LimitedFormlyFieldConfig<IssueProviderYoutrack>[] = [
  {
    key: 'server',
    type: 'input',
    templateOptions: {
      label: T.F.GITEA.FORM.HOST,
      type: 'url',
      pattern: /^.+\/.+?$/i,
      required: true,
    },
  },
  {
    key: 'token',
    type: 'input',
    templateOptions: {
      label: T.F.GITEA.FORM.TOKEN,
      required: true,
      type: 'password',
    },
  },
];

export const YOUTRACK_CONFIG_FORM_SECTION: ConfigFormSection<IssueProviderYoutrack> = {
  title: 'Gitea',
  key: 'GITEA',
  items: YOUTRACK_CONFIG_FORM,
  help: T.F.GITEA.FORM_SECTION.HELP,
};
