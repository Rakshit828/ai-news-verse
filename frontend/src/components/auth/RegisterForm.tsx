import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { RegisterFormData } from "../../types/auth.types";
import { LoadingSpinner } from "../LoadingSpinner";

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  onSwitchToLogin: () => void;
  isLoading?: boolean;
}

interface FormState extends RegisterFormData {
  confirmPassword: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  onSwitchToLogin,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};

    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    // Only send API data without confirmPassword
    const { confirmPassword, ...apiData } = formData;
    await onSubmit(apiData);
  };

  return (
    <div className="space-y-4">
      {/* First Name */}
      <div className="space-y-1">
        <Label htmlFor="first-name" className="block ml-10 text-sm text-slate-700">
          First Name
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            id="first-name"
            type="text"
            placeholder="John"
            className="pl-10"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>
        {errors.firstName && <p className="text-xs text-red-500 ml-10">{errors.firstName}</p>}
      </div>

      {/* Last Name */}
      <div className="space-y-1">
        <Label htmlFor="last-name" className="block ml-10 text-sm text-slate-700">
          Last Name
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            id="last-name"
            type="text"
            placeholder="Doe"
            className="pl-10"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>
        {errors.lastName && <p className="text-xs text-red-500 ml-10">{errors.lastName}</p>}
      </div>

      {/* Email */}
      <div className="space-y-1">
        <Label htmlFor="reg-email" className="block ml-10 text-sm text-slate-700">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            className="pl-10"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>
        {errors.email && <p className="text-xs text-red-500 ml-10">{errors.email}</p>}
      </div>

      {/* Password */}
      <div className="space-y-1">
        <Label htmlFor="reg-password" className="block ml-10 text-sm text-slate-700">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-10 pr-10"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-500 ml-10">{errors.password}</p>}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1">
        <Label htmlFor="confirm-password" className="block ml-10 text-sm text-slate-700">
          Confirm Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-10 pr-10"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-500 ml-10">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Creating account...
          </>
        ) : (
          <>
            Create account
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      {/* Switch to Login */}
      <div className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium text-slate-900 hover:underline"
          disabled={isLoading}
        >
          Sign in
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
