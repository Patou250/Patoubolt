export interface Child {
  id: string
  name: string
  emoji: string
  pin_hash: string
  parent_id: string
  created_at: string
  updated_at: string
}

interface CreateChildData {
  name: string
  emoji: string
  pin: string
}

interface ChildSession {
  childId: string
  parentId: string
  timestamp: number
}