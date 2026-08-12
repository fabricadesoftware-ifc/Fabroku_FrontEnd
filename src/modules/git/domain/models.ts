export interface GitRepo {
  id: number
  name: string
  full_name: string
  html_url: string
  description?: string | null
  private: boolean
  default_branch: string
  clone_url: string
  ssh_url: string
}
