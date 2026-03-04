
export interface User {
  first_name: string
  last_name: string
  email: string
  role: string
  created_at: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface SignupPayload {
  firstName: string
  lastName: string
  email: string
  password: string
}
