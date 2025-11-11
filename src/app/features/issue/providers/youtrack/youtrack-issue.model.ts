export declare class YoutrackIssueTagReduced {
  name: string;
  id: string;
}
export declare class YoutrackIssueTag extends YoutrackIssueTagReduced {
  untagOnResolve: boolean;
  owner: YoutrackUserReduced;
}

export declare class YoutrackUserReduced {
  email: string;
  fullName: string;
  login: string;
  name: string;
  id: string;
}
export declare class YoutrackUser extends YoutrackUserReduced {
  avatarUrl: string;
  banned: boolean;
  online: boolean;
  guest: boolean;
  jabberAccountName: string;
  ringId: string;
  tags: YoutrackIssueTagReduced[];
}

export declare class YoutrackProjectReduced {
  id?: string;
  name?: string;
  shortName?: string;
  description?: string;
  archived?: boolean;
}

export declare class YoutrackProject extends YoutrackProjectReduced {
  createdBy: YoutrackUserReduced;
  // fields: ProjectCustomField[];
  fromEmail: string;
  hubResourceId: string;
  iconUrl: string;
  timeTrackingEnabled?: boolean;
  leader?: YoutrackUserReduced;
}

export declare class YoutrackIssueReduced {
  id: string;
  numberInProject?: number;
  created?: number;
  updated?: number;
  resolved?: number;
  project?: YoutrackProjectReduced;
  summary?: string;
  description?: string;
}
export declare class YoutrackIssue extends YoutrackIssueReduced {
  reporter?: YoutrackUserReduced;
  updater?: YoutrackUserReduced;
  wikifiedDescription?: string;
  usesMarkdown?: boolean;
  //fields?: IssueCustomField[];
  isDraft?: boolean;
  tags?: YoutrackIssueTag[];
  //links?: IssueLink[];
  //comments?: IssueComment[];
}
