interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface UserResponseSchema {
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  is_verified: boolean;
  role: string;
  created_at: string;
}


export {
  LoginFormData,
  RegisterFormData,
  UserResponseSchema
};
