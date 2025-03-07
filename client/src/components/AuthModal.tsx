// src/components/AuthModal.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { useLogin, useRegister } from "@/hooks/useAuth";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface UserFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  username: string;
  password: string;
}

const initialData: UserFormData = {
  firstName: "",
  lastName: "",
  email: "",
  username: "",
  password: "",
};

// Single schema with conditional requirements
const authSchema = yup.object().shape({
  firstName: yup.string().when("$mode", {
    is: "register",
    then: (schema) => schema.required("First name is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  lastName: yup.string().when("$mode", {
    is: "register",
    then: (schema) => schema.required("Last name is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  email: yup.string().when("$mode", {
    is: "register",
    then: (schema) =>
      schema.required("Email is required").email("Invalid email address"),
    otherwise: (schema) => schema.notRequired(),
  }),
  username: yup.string().required("Username is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const registerMutation = useRegister();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    resolver: yupResolver(authSchema),
    defaultValues: initialData,
    context: { mode }, // Pass mode as context to schema
  });

  const onSubmit: SubmitHandler<UserFormData> = (data) => {
    if (mode === "register") {
      registerMutation.mutate(
        {
          ...data,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
        },
        {
          onSuccess: () => {
            reset();
          },
        }
      );
    } else {
      loginMutation.mutate(data, {
        onSuccess: () => {
          reset();
        },
      });
    }
  };

  const getInputBorderClass = (field: keyof UserFormData) => {
    return errors[field]
      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "login" ? "Login" : "Register"}</DialogTitle>
          <DialogDescription>
            {mode === "login"
              ? "Enter your credentials to log in."
              : "Fill in the details to create a new account."}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {mode === "register" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="Your first name"
                  {...register("firstName")}
                  className={`mt-1 block w-full rounded-md border p-2 focus:ring-2 focus:outline-none ${getInputBorderClass(
                    "firstName"
                  )}`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Your last name"
                  {...register("lastName")}
                  className={`mt-1 block w-full rounded-md border p-2 focus:ring-2 focus:outline-none ${getInputBorderClass(
                    "lastName"
                  )}`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className={`mt-1 block w-full rounded-md border p-2 focus:ring-2 focus:outline-none ${getInputBorderClass(
                    "email"
                  )}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              placeholder="username"
              {...register("username")}
              className={`mt-1 block w-full rounded-md border p-2 focus:ring-2 focus:outline-none ${getInputBorderClass(
                "username"
              )}`}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="********"
              {...register("password")}
              className={`mt-1 block w-full rounded-md border p-2 focus:ring-2 focus:outline-none ${getInputBorderClass(
                "password"
              )}`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={mode === "register" && registerMutation.isPending}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:bg-blue-300"
          >
            {mode === "register" && registerMutation.isPending
              ? "Processing..."
              : mode === "login"
              ? "Login"
              : "Register"}
          </button>
        </form>
        <span className="text-center text-lg font-medium text-gray-600 block my-4">
          or
        </span>
        <div className="space-y-2">
          <button className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-100">
            <FaGoogle className="mr-2" size={20} />
            Sign in with Google
          </button>
          <button className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-100">
            <FaGithub className="mr-2" size={20} />
            Sign in with GitHub
          </button>
        </div>
        <div className="mt-4 text-center">
          {mode === "login" ? (
            <p>
              Don't have an account?{" "}
              <button
                className="text-blue-500 hover:underline cursor-pointer"
                onClick={() => {
                  setMode("register");
                  reset();
                }}
              >
                Register
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                className="text-blue-500 hover:underline cursor-pointer"
                onClick={() => {
                  setMode("login");
                  reset();
                }}
              >
                Login
              </button>
            </p>
          )}
        </div>
        <DialogClose className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" />
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
