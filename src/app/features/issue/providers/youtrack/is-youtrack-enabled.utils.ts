import { YoutrackCfg } from './youtrack.model';

export const isYoutrackEnabled = (cfg: YoutrackCfg): boolean => {
  return cfg && cfg.isEnabled && !!cfg.server;
};
