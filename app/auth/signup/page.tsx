"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Truck, CheckCircle2, X } from "lucide-react"

const REGISTER_URL =
  "https://fleet-backend-np49.onrender.com/api/register/"

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setError("")

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(REGISTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirm_password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (typeof data === "object" && data !== null) {
          const firstError = Object.values(data)[0]

          if (Array.isArray(firstError)) {
            setError(String(firstError[0]))
          } else {
            setError(String(firstError))
          }
        } else {
          setError("Something went wrong. Please try again.")
        }

        return
      }

      // Show success toast
      setToast(true)

      // Redirect to login after the toast is visible
      setTimeout(() => {
        window.location.href = "/auth/login"
      }, 1500)
    } catch (error) {
      console.error(error)
      setError("Unable to connect to the server. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F6F8] px-6 py-12 text-[#25282D]">

      {/* Success Toast */}
      {toast && (
        <div className="fixed right-6 top-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-5 py-4 shadow-xl animate-in slide-in-from-right-5 duration-300">

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#25282D]">
              Account created
            </p>

            <p className="text-xs text-[#737780]">
              Redirecting you now...
            </p>
          </div>

          <button
            type="button"
            onClick={() => setToast(false)}
            className="ml-2 text-[#A0A3AA] transition hover:text-[#25282D]"
          >
            <X size={16} />
          </button>

        </div>
      )}

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg bg-[#EF4B4B] text-white ${
              toast ? "animate-bounce" : ""
            }`}
          >
            <Truck size={22} />
          </div>

          <h1 className="text-2xl font-bold text-[#25282D]">
            Fleet<span className="text-[#EF4B4B]">Flow</span>
          </h1>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#E8E9ED] bg-white p-8 shadow-lg">

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#25282D]">
              Create your account
            </h2>

            <p className="mt-2 text-sm text-[#737780]">
              Start managing your fleet in one place.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-[#25282D]"
              >
                Username
              </label>

              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required
                disabled={loading}
                className="w-full rounded-lg border border-[#E8E9ED] bg-white px-4 py-3 text-sm text-[#25282D] outline-none transition placeholder:text-[#A0A3AA] focus:border-[#EF4B4B] focus:ring-2 focus:ring-[#EF4B4B]/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#25282D]"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="w-full rounded-lg border border-[#E8E9ED] bg-white px-4 py-3 text-sm text-[#25282D] outline-none transition placeholder:text-[#A0A3AA] focus:border-[#EF4B4B] focus:ring-2 focus:ring-[#EF4B4B]/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#25282D]"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-[#E8E9ED] bg-white px-4 py-3 pr-12 text-sm text-[#25282D] outline-none transition placeholder:text-[#A0A3AA] focus:border-[#EF4B4B] focus:ring-2 focus:ring-[#EF4B4B]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A3AA] transition hover:text-[#25282D] disabled:cursor-not-allowed"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-[#25282D]"
              >
                Confirm password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-[#E8E9ED] bg-white px-4 py-3 pr-12 text-sm text-[#25282D] outline-none transition placeholder:text-[#A0A3AA] focus:border-[#EF4B4B] focus:ring-2 focus:ring-[#EF4B4B]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A3AA] transition hover:text-[#25282D] disabled:cursor-not-allowed"
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-[#EF4B4B] py-3 font-semibold text-white transition hover:bg-[#D93B3B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </button>

          </form>

          {/* Login */}
          <p className="mt-6 text-center text-sm text-[#737780]">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-[#EF4B4B] transition hover:text-[#D93B3B]"
            >
              Sign in
            </Link>
          </p>

        </div>

      </div>

    </main>
  )
}

export default Signup