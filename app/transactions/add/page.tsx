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
    <main className="min-h-screen bg-[#F5F6F8] text-[#25282D]">
      {/* --------------------------------------------------
          HEADER
      -------------------------------------------------- */}

      <header className="border-b border-[#E8E9ED] bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#737780] transition hover:text-[#EF4B4B]"
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EF4B4B] text-white">
              <Save size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#25282D] sm:text-3xl">
                Add Transaction
              </h1>

              <p className="mt-1 text-sm text-[#737780]">
                Record income or expenses for a lorry.
              </p>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------
            FORM CARD
        -------------------------------------------------- */}

        <div className="rounded-xl border border-[#E8E9ED] bg-white shadow-sm">
          <div className="border-b border-[#E8E9ED] p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-[#25282D]">
              Transaction Details
            </h2>

            <p className="mt-1 text-sm text-[#737780]">
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
                <label className="flex items-center gap-2 text-sm font-medium text-[#25282D]">
                  <Truck
                    size={16}
                    className="text-[#737780]"
                  />
                  Lorry
                </label>

                <select
                  value={vehicleId}
                  onChange={(event) =>
                    setVehicleId(event.target.value)
                  }
                  disabled={loadingVehicles}
                  className="mt-2 w-full rounded-lg border border-[#E8E9ED] bg-white px-4 py-3 text-sm text-[#25282D] outline-none transition focus:border-[#EF4B4B] focus:ring-2 focus:ring-[#EF4B4B]/10 disabled:cursor-not-allowed disabled:opacity-50"
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
                <label className="text-sm font-medium text-[#25282D]">
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
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-[#E8E9ED] bg-white hover:border-emerald-200 hover:bg-emerald-50/50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        transactionType === "income"
                          ? "bg-emerald-100"
                          : "bg-[#F5F6F8]"
                      }`}
                    >
                      <ArrowUpCircle
                        size={21}
                        className="text-emerald-600"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#25282D]">
                        Income
                      </p>

                      <p className="mt-0.5 text-xs text-[#737780]">
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
                        ? "border-rose-200 bg-rose-50"
                        : "border-[#E8E9ED] bg-white hover:border-rose-200 hover:bg-rose-50/50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        transactionType === "expense"
                          ? "bg-rose-100"
                          : "bg-[#F5F6F8]"
                      }`}
                    >
                      <ArrowDownCircle
                        size={21}
                        className="text-rose-600"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#25282D]">
                        Expense
                      </p>

                      <p className="mt-0.5 text-xs text-[#737780]">
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
                <label className="text-sm font-medium text-[#25282D]">
                  Amount
                </label>

                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#737780]">
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
                    className="w-full rounded-lg border border-[#E8E9ED] bg-white py-3 pl-14 pr-4 text-sm text-[#25282D] outline-none placeholder:text-[#A0A3AA] focus:border-[#EF4B4B] focus:ring-2 focus:ring-[#EF4B4B]/10"
                  />
                </div>
              </div>

              {/* --------------------------------------------------
                  DATE
              -------------------------------------------------- */}

              <div>
                <label className="text-sm font-medium text-[#25282D]">
                  Date
                </label>

                <input
                  type="date"
                  value={date}
                  onChange={(event) =>
                    setDate(event.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-[#E8E9ED] bg-white px-4 py-3 text-sm text-[#25282D] outline-none focus:border-[#EF4B4B] focus:ring-2 focus:ring-[#EF4B4B]/10"
                />
              </div>

              {/* --------------------------------------------------
                  NOTE
              -------------------------------------------------- */}

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-[#25282D]">
                  Note
                </label>

                <textarea
                  value={note}
                  onChange={(event) =>
                    setNote(event.target.value)
                  }
                  placeholder="e.g. Fuel, trip payment, repairs, driver allowance..."
                  rows={4}
                  className="mt-2 w-full resize-none rounded-lg border border-[#E8E9ED] bg-white px-4 py-3 text-sm text-[#25282D] outline-none placeholder:text-[#A0A3AA] focus:border-[#EF4B4B] focus:ring-2 focus:ring-[#EF4B4B]/10"
                />
              </div>
            </div>

            {/* --------------------------------------------------
                MESSAGES
            -------------------------------------------------- */}

            {error && (
              <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-600">
                {success}
              </div>
            )}

            {/* --------------------------------------------------
                ACTIONS
            -------------------------------------------------- */}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/dashboard"
                className="flex items-center justify-center rounded-lg border border-[#E8E9ED] bg-white px-5 py-3 text-sm font-semibold text-[#737780] transition hover:bg-[#F5F6F8] hover:text-[#25282D]"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting || loadingVehicles}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#EF4B4B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#D93B3B] disabled:cursor-not-allowed disabled:opacity-50"
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