export interface ProjectUser {
  id: number
  name: string | null
  email: string
  avatar_url: string | null
}

export interface Project {
  id?: string
  name: string
  users: (number | undefined)[]
  users_detail?: ProjectUser[]
  created_at?: string
  updated_at?: string
  is_owner?: boolean
}

export type CreateProjectInput = Pick<Project, 'name' | 'users'>
export type UpdateProjectInput = Partial<Pick<Project, 'name' | 'users'>>
