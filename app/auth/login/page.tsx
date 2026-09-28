"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Truck, CheckCircle2, X } from "lucide-react"

const LOGIN_URL =
  "https://fleet-backend-np49.onrender.com/api/login/"

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    setLoading(true)

    try {
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
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
          setError("Invalid email or password.")
        }

        return
      }

      // Store the authentication token returned by Django
      if (data.token) {
        localStorage.setItem("token", data.token)
      }

      // Show success toast
      setToast(true)

      // Redirect to dashboard after toast
      setTimeout(() => {
        window.location.href = "/dashboard"
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
        <div className="fixed right-6 top-6 z-50 flex items-center gap-3 rounded-xl border border-[#E8E9ED] bg-white px-5 py-4 shadow-xl animate-in slide-in-from-right-5 duration-300">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#25282D]">
              Welcome back
            </p>

            <p className="text-xs text-[#737780]">
              Signing you in...
            </p>
          </div>

          <button
            type="button"
            onClick={() => setToast(false)}
            className="ml-2 text-[#A0A3A8] transition hover:text-[#25282D]"
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl bg-[#EF4B4B] text-white shadow-sm ${
              toast ? "animate-bounce" : ""
            }`}
          >
            <Truck size={22} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#25282D]">
            Fleet<span className="text-[#EF4B4B]">Flow</span>
          </h1>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#E8E9ED] bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#25282D]">
              Welcome back
            </h2>

            <p className="mt-2 text-sm text-[#737780]">
              Sign in to manage your fleet.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full rounded-lg border border-[#E8E9ED] bg-white px-4 py-3 text-sm text-[#25282D] outline-none transition placeholder:text-[#A0A3A8] focus:border-[#EF4B4B] focus:ring-2 focus:ring-[#EF4B4B]/10 disabled:cursor-not-allowed disabled:bg-[#F5F6F8] disabled:opacity-60"
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
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-[#E8E9ED] bg-white px-4 py-3 pr-12 text-sm text-[#25282D] outline-none transition placeholder:text-[#A0A3A8] focus:border-[#EF4B4B] focus:ring-2 focus:ring-[#EF4B4B]/10 disabled:cursor-not-allowed disabled:bg-[#F5F6F8] disabled:opacity-60"
                />

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A3A8] transition hover:text-[#25282D] disabled:cursor-not-allowed"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-[#EF4B4B] py-3 font-semibold text-white transition hover:bg-[#D93B3B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Signup */}
          <p className="mt-6 text-center text-sm text-[#737780]">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-[#EF4B4B] transition hover:text-[#D93B3B]"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default Login