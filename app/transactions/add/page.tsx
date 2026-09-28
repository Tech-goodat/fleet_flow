"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  Loader2,
  Save,
  Truck,
} from "lucide-react"

const API_URL = "https://fleet-backend-np49.onrender.com/api"

interface Vehicle {
  id: number
  registration_number: string
  driver_name: string
}

export default function AddTransactionPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loadingVehicles, setLoadingVehicles] = useState(true)

  const [vehicleId, setVehicleId] = useState("")
  const [transactionType, setTransactionType] =
    useState<"income" | "expense">("income")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState("")
  const [note, setNote] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // --------------------------------------------------
  // FETCH LORRIES
  // --------------------------------------------------

  useEffect(() => {
    const fetchVehicles = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        setError("You are not authenticated.")
        setLoadingVehicles(false)
        return
      }

      try {
        const response = await fetch(
          `${API_URL}/vehicles/`,
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }
        )

        if (!response.ok) {
          throw new Error("Failed to fetch vehicles")
        }

        const data = await response.json()

        setVehicles(data)
      } catch (error) {
        console.error(error)
        setError("Unable to load lorries.")
      } finally {
        setLoadingVehicles(false)
      }
    }

    fetchVehicles()
  }, [])

  // --------------------------------------------------
  // SUBMIT TRANSACTION
  // --------------------------------------------------

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    const token = localStorage.getItem("token")

    if (!token) {
      setError("You are not authenticated.")
      return
    }

    if (!vehicleId) {
      setError("Please select a lorry.")
      return
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.")
      return
    }

    if (!date) {
      setError("Please select a date.")
      return
    }

    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(
        `${API_URL}/transactions/`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vehicle: Number(vehicleId),
            type: transactionType,
            amount,
            date,
            note: note.trim(),
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.text()

        console.error(
          "Transaction creation error:",
          errorData
        )

        throw new Error(
          "Failed to create transaction"
        )
      }

      setSuccess(
        "Transaction added successfully."
      )

      // Reset form
      setVehicleId("")
      setTransactionType("income")
      setAmount("")
      setDate("")
      setNote("")
    } catch (error) {
      console.error(error)

      setError(
        "Unable to add transaction. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* --------------------------------------------------
          HEADER
      -------------------------------------------------- */}

      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Fleet
          </Link>
        </div>
      </header>

      {/* --------------------------------------------------
          PAGE
      -------------------------------------------------- */}

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Title */}

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C6752B]">
              <Save size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Add Transaction
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                Record income or expenses for a lorry.
              </p>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------
            FORM CARD
        -------------------------------------------------- */}

        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 p-5 sm:p-6">
            <h2 className="text-lg font-semibold">
              Transaction Details
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Enter the financial activity below.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-6"
          >
            <div className="grid gap-6 md:grid-cols-2">
              {/* --------------------------------------------------
                  LORRY
              -------------------------------------------------- */}

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <Truck size={16} />
                  Lorry
                </label>

                <select
                  value={vehicleId}
                  onChange={(event) =>
                    setVehicleId(event.target.value)
                  }
                  disabled={loadingVehicles}
                  className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-[#C6752B] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {loadingVehicles
                      ? "Loading lorries..."
                      : "Select a lorry"}
                  </option>

                  {vehicles.map((vehicle) => (
                    <option
                      key={vehicle.id}
                      value={vehicle.id}
                    >
                      {vehicle.registration_number} —{" "}
                      {vehicle.driver_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* --------------------------------------------------
                  TRANSACTION TYPE
              -------------------------------------------------- */}

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-zinc-300">
                  Transaction Type
                </label>

                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {/* Income */}

                  <button
                    type="button"
                    onClick={() =>
                      setTransactionType("income")
                    }
                    className={`flex items-center gap-3 rounded-lg border p-4 text-left transition ${
                      transactionType === "income"
                        ? "border-emerald-500/40 bg-emerald-500/10"
                        : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        transactionType === "income"
                          ? "bg-emerald-500/10"
                          : "bg-zinc-800"
                      }`}
                    >
                      <ArrowUpCircle
                        size={21}
                        className="text-emerald-400"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Income
                      </p>

                      <p className="mt-0.5 text-xs text-zinc-500">
                        Money received
                      </p>
                    </div>
                  </button>

                  {/* Expense */}

                  <button
                    type="button"
                    onClick={() =>
                      setTransactionType("expense")
                    }
                    className={`flex items-center gap-3 rounded-lg border p-4 text-left transition ${
                      transactionType === "expense"
                        ? "border-rose-500/40 bg-rose-500/10"
                        : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        transactionType === "expense"
                          ? "bg-rose-500/10"
                          : "bg-zinc-800"
                      }`}
                    >
                      <ArrowDownCircle
                        size={21}
                        className="text-rose-400"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Expense
                      </p>

                      <p className="mt-0.5 text-xs text-zinc-500">
                        Money spent
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* --------------------------------------------------
                  AMOUNT
              -------------------------------------------------- */}

              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Amount
                </label>

                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                    KES
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(event) =>
                      setAmount(event.target.value)
                    }
                    placeholder="0.00"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-3 pl-14 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#C6752B]"
                  />
                </div>
              </div>

              {/* --------------------------------------------------
                  DATE
              -------------------------------------------------- */}

              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Date
                </label>

                <input
                  type="date"
                  value={date}
                  onChange={(event) =>
                    setDate(event.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-[#C6752B]"
                />
              </div>

              {/* --------------------------------------------------
                  NOTE
              -------------------------------------------------- */}

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-zinc-300">
                  Note
                </label>

                <textarea
                  value={note}
                  onChange={(event) =>
                    setNote(event.target.value)
                  }
                  placeholder="e.g. Fuel, trip payment, repairs, driver allowance..."
                  rows={4}
                  className="mt-2 w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#C6752B]"
                />
              </div>
            </div>

            {/* --------------------------------------------------
                MESSAGES
            -------------------------------------------------- */}

            {error && (
              <div className="mt-5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
                {success}
              </div>
            )}

            {/* --------------------------------------------------
                ACTIONS
            -------------------------------------------------- */}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/dashboard"
                className="flex items-center justify-center rounded-lg border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting || loadingVehicles}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#C6752B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#A85F20] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Transaction
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}