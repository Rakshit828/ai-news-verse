// src/hooks/useAuth.ts
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import type { LoginPayload, SignupPayload } from '@/types/auth.types'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api.types'


export const useLoginMutation = () => {
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (res) => {
      setUser(res.data)
      toast.success(res.message)
      navigate('/')
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message ?? 'Login failed. Please try again.'
      toast.error(message)
    },
  })
}

export const useSignupMutation = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: SignupPayload) => authService.signup(payload),
    onSuccess: (res) => {
      toast.success(res.message)
      navigate('/login')
    },

    // error; it will be whatever authService.signup throws, since we do not handle .catch their
    // it will be whatever axiosInstance throws i.e. AxiosError<ApiError>
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message ?? 'Signup failed. Please try again.'
      toast.error(message)
    },
  })
}

export const useLogoutMutation = () => {
  const { clearUser } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearUser()
      toast.success('Logged out successfully.')
      navigate('/login')
    },
    onError: () => {
      // Force client-side logout even if the API call fails
      clearUser()
      navigate('/login')
    },
  })
}
