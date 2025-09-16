export interface Child {
  id: string
  name: string
  emoji: string
  pin_hash: string
  parent_id: string
  created_at: string
  updated_at: string
}

export interface CreateChildData {
  name: string
  emoji: string
  pin: string
}

export interface ChildSession {
  childId: string
  parentId: string
  timestamp: number
}