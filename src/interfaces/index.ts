interface Response<T = any> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface User {
  id?: number;
  username?: string;
  email: string;
  name?: string | null;
  avatar_url: string | null;
  is_superuser?: boolean;
  is_fabric?: boolean;
  is_active?: boolean;
  date_joined?: string;
  last_login?: string | null;
}

interface ProjectUser {
  id: number;
  name: string | null;
  email: string;
  avatar_url: string | null;
}

interface Project {
  id?: string;
  name: string;
  users: User["id"][];
  users_detail?: ProjectUser[];
  created_at?: string;
  updated_at?: string;
  is_owner?: boolean;
}

interface App {
  id?: number;
  name: string;
  git: string;
  branch?: string;
  project: Project["id"];
  created_at?: string;
  updated_at?: string;
  status?:
    | "STOPPED"
    | "RUNNING"
    | "ERROR"
    | "STARTING"
    | "DELETING"
    | "DEPLOYING"
    | "RESTARTING"
    | "STOPPING"
    | "FAILED";
  domain?: string | null;
  port?: number | null;
  variables?: Record<string, string> | object;
  task_id?: string | null;
  name_dokku?: string | null;
  is_owner?: boolean;
  services?: Service[];
}

interface Service {
  id?: number;
  name: string;
  service_type: "postgres" | "redis" | "rabbitmq";
  app?: number | null;
  project: string | number;
  container_name?: string | null;
  host?: string;
  port?: number;
  task_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface TaskStatus {
  task_id: string;
  state: "PENDING" | "PROGRESS" | "SUCCESS" | "FAILURE" | "UNKNOWN";
  current?: number;
  total?: number;
  status?: string;
}

type LogLevel = "DEBUG" | "INFO" | "WARNING" | "ERROR" | "SUCCESS" | "DOKKU";
type LogCategory =
  | "SYSTEM"
  | "CREATE"
  | "DEPLOY"
  | "CONFIG"
  | "GIT"
  | "DATABASE"
  | "DOMAIN"
  | "SSL";

interface AppLog {
  id?: number;
  app: number;
  task_id?: string | null;
  message: string;
  level: LogLevel;
  level_display?: string;
  category: LogCategory;
  category_display?: string;
  metadata?: Record<string, any>;
  progress?: number;
  created_at?: string;
}

interface GitRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description?: string | null;
  private: boolean;
  default_branch: string;
  clone_url: string;
  ssh_url: string;
}

export type {
  App,
  AppLog,
  GitRepo,
  LogCategory,
  LogLevel,
  Project,
  ProjectUser,
  Response,
  Service,
  TaskStatus,
  User,
};
