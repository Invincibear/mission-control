export interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string | null;
  created_at: string;
  updated_at: string;
  position: number;
}
