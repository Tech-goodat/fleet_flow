"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  Save,
  Loader2,
  Receipt,
  Truck,
  Calendar,
  Wallet,
  FileText,
  AlertCircle,
} from "lucide-react"

const API_URL = "https://fleet-backend-np49.onrender.com/api"

interface Vehicle {
  id: number
  registration_number: string
  driver_name: string
}

interface Transaction {
  id: number
  vehicle: number
  type: "income" | "expense"
  amount: string | number
  date: string
  note: string
  created_at?: string
}

export default function EditTransactionPage() {
  const router = useRouter()
  const params = useParams()

  const transactionId = params.id

  const [transaction, setTransaction] =
    useState<Transaction | null>(null)

  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // --------------------------------------------------
  // FORM STATE
  // --------------------------------------------------

  const [vehicleId, setVehicleId] = useState("")
  const [type, setType] = useState<"income" | "expense">("income")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState("")
  const [note, setNote] = useState("")

  // --------------------------------------------------
  // FETCH TRANSACTION + VEHICLES
  // --------------------------------------------------

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        setError("You are not authenticated.")
        setLoading(false)
        return
      }

      try {
        const headers = {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        }

        const [transactionResponse, vehiclesResponse] =
          await Promise.all([
            fetch(
              `${API_URL}/transactions/${transactionId}/`,
              {
                method: "GET",
                headers,
              }
            ),

            fetch(`${API_URL}/vehicles/`, {
              method: "GET",
              headers,
            }),
          ])

        if (!transactionResponse.ok) {
          throw new Error("Failed to fetch transaction")
        }

        if (!vehiclesResponse.ok) {
          throw new Error("Failed to fetch vehicles")
        }

        const transactionData =
          await transactionResponse.json()

        const vehiclesData =
          await vehiclesResponse.json()

        setTransaction(transactionData)
        setVehicles(vehiclesData)

        // Populate form
        setVehicleId(String(transactionData.vehicle))
        setType(transactionData.type)
        setAmount(String(transactionData.amount))
        setDate(transactionData.date)
        setNote(transactionData.note || "")
      } catch (error) {
        console.error(error)
        setError(
          "Unable to load the transaction. Please try again."
        )
      } finally {
        setLoading(false)
      }
    }

    if (transactionId) {
      fetchData()
    }
  }, [transactionId])

  // --------------------------------------------------
  // UPDATE TRANSACTION
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

    setError("")
    setSuccess("")

    // Basic validation
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

    setSaving(true)

    try {
      const response = await fetch(
        `${API_URL}/transactions/${transactionId}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vehicle: Number(vehicleId),
            type,
            amount: Number(amount).toFixed(2),
            date,
            note: note.trim(),
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.text()

        console.error(
          "Update transaction error:",
          errorData
        )

        throw new Error(
          "Failed to update transaction"
        )
      }

      const updatedTransaction =
        await response.json()

      setTransaction(updatedTransaction)
      setSuccess("Transaction updated successfully.")

      // Give the user a moment to see confirmation
      setTimeout(() => {
        router.push("/accounting")
      }, 800)
    } catch (error) {
      console.error(error)

      setError(
        "Unable to update this transaction. Please try again."
      )
    } finally {
      setSaving(false)
    }
  }

  // --------------------------------------------------
  // DELETE TRANSACTION
  // --------------------------------------------------

  const handleDelete = async () => {
    const token = localStorage.getItem("token")

    if (!token || !transaction) {
      setError("You are not authenticated.")
      return
    }

    const confirmed = window.confirm(
      `Delete transaction TXN-${String(
        transaction.id
      ).padStart(5, "0")}? This action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    setSaving(true)
    setError("")

    try {
      const response = await fetch(
        `${API_URL}/transactions/${transaction.id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.text()

        console.error(
          "Delete transaction error:",
          errorData
        )

        throw new Error(
          "Failed to delete transaction"
        )
      }

      router.push("/accounting")
    } catch (error) {
      console.error(error)

      setError(
        "Unable to delete this transaction. Please try again."
      )

      setSaving(false)
    }
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F6F8] text-[#25282D]">
        <div className="flex items-center gap-3 text-[#737780]">
          <Loader2
            size={20}
            className="animate-spin text-[#EF4B4B]"
          />
          Loading transaction...
        </div>
      </main>
    )
  }

  // --------------------------------------------------
  // ERROR / NOT FOUND
  // --------------------------------------------------

  if (!transaction && error) {
    return (
      <main className="min-h-screen bg-[#F5F6F8] text-[#25282D]">
        <header className="border-b border-[#E8E9ED] bg-white">
          <div className="mx-auto flex max-w-4xl items-center gap-3 px-6 py-5">
            <Link
              href="/accounting"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E8E9ED] bg-white text-[#737780] transition hover:border-[#EF4B4B]/30 hover:bg-[#EF4B4B]/5 hover:text-[#25282D]"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <h1 className="text-lg font-bold text-[#25282D]">
                Fleet<span className="text-[#EF4B4B]">Flow</span>
              </h1>

              <p className="text-xs text-[#737780]">
                Accounting
              </p>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-4xl px-6 py-16">
          <div className="rounded-xl border border-rose-200 bg-white p-8 text-center shadow-sm">
            <AlertCircle
              size={40}
              className="mx-auto text-rose-500"
            />

            <h2 className="mt-4 text-xl font-semibold text-[#25282D]">
              Transaction unavailable
            </h2>

            <p className="mt-2 text-sm text-rose-600">
              {error}
            </p>

            <Link
              href="/accounting"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#E8E9ED] bg-white px-5 py-3 text-sm font-semibold text-[#737780] transition hover:bg-[#F5F6F8] hover:text-[#25282D]"
            >
              <ArrowLeft size={16} />
              Back to Accounting
            </Link>
          </div>
        </section>
      </main>
    )
  }

  // --------------------------------------------------
  // MAIN PAGE
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-[#F5F6F8] text-[#25282D]">
      {/* HEADER */}

      <header className="border-b border-[#E8E9ED] bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <Link
              href="/accounting"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E8E9ED] bg-white text-[#737780] transition hover:border-[#EF4B4B]/30 hover:bg-[#EF4B4B]/5 hover:text-[#25282D]"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <h1 className="text-lg font-bold text-[#25282D]">
                Fleet<span className="text-[#EF4B4B]">Flow</span>
              </h1>

              <p className="text-xs text-[#737780]">
                Accounting
              </p>
            </div>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EF4B4B]/10 text-[#EF4B4B]">
            <Receipt size={20} />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-10">
        {/* TITLE */}

        <div className="mb-8">
          <p className="text-sm font-semibold text-[#EF4B4B]">
            Financial Management
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#25282D]">
            Edit Transaction
          </h2>

          <p className="mt-2 text-[#737780]">
            Update the details of this financial transaction.
          </p>
        </div>

        {/* TRANSACTION REFERENCE */}

        {transaction && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-[#E8E9ED] bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Receipt
                size={19}
                className="text-[#737780]"
              />

              <div>
                <p className="text-xs text-[#A0A3AA]">
                  Transaction reference
                </p>

                <p className="mt-1 font-mono text-sm font-semibold text-[#25282D]">
                  TXN-
                  {String(transaction.id).padStart(
                    5,
                    "0"
                  )}
                </p>
              </div>
            </div>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                type === "income"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                  : "border-rose-200 bg-rose-50 text-rose-600"
              }`}
            >
              {type === "income"
                ? "Income"
                : "Expenditure"}
            </span>
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-600">
            {success}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
            {error}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-[#E8E9ED] bg-white shadow-sm"
        >
          <div className="border-b border-[#E8E9ED] p-6">
            <h3 className="text-lg font-semibold text-[#25282D]">
              Transaction Details
            </h3>

            <p className="mt-1 text-sm text-[#737780]">
              Make the necessary changes below.
            </p>
          </div>

          <div className="space-y-6 p-6">
            {/* LORRY */}

            <div>
              <label className="mb-2 block text-sm font-medium text-[#25282D]">
                Lorry
              </label>

              <div className="relative">
                <Truck
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A3AA]"
                />

                <select
                  value={vehicleId}
                  onChange={(event) =>
                    setVehicleId(event.target.value)
                  }
                  className="w-full appearance-none rounded-lg border border-[#E8E9ED] bg-white py-3 pl-10 pr-4 text-sm text-[#25282D] outline-none transition focus:border-[#EF4B4B] focus:ring-2 focus:ring-[#EF4B4B]/10"
                >
                  <option value="">
                    Select lorry
                  </option>

                  {vehicles.map((vehicle) => (
                    <option
                      key={vehicle.id}
                      value={vehicle.id}
                    >
                      {vehicle.registration_number}
                      {vehicle.driver_name
                        ? ` — ${vehicle.driver_name}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TYPE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-[#25282D]">
                Transaction Type
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                    type === "income"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                      : "border-[#E8E9ED] bg-white text-[#737780] hover:border-emerald-200 hover:bg-emerald-50/50"
                  }`}
                >
                  Income
                </button>

                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                    type === "expense"
                      ? "border-rose-200 bg-rose-50 text-rose-600"
                      : "border-[#E8E9ED] bg-white text-[#737780] hover:border-rose-200 hover:bg-rose-50/50"
                  }`}
                >
                  Expenditure
                </button>
              </div>
            </div>

            {/* AMOUNT + DATE */}

            <div className="grid gap-6 md:grid-cols-2">
              {/* AMOUNT */}

              <div>
                <label className="mb-2 block text-sm font-medium text-[#25282D]">
                  Amount
                </label>

                <div className="relative">
                  <Wallet
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A3AA]"
                  />

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(event) =>
                      setAmount(event.target.value)
                    }
                    placeholder="0.00"
                    className="w-full rounded-lg border border-[#E8E9ED] bg-white py-3 pl-10 pr-4 text-sm text-[#25282D] outline-none transition placeholder:text-[#A0A3AA] focus:border-[#EF4B4B] focus:ring-2 focus:ring-[#EF4B4B]/10"
                  />
                </div>
              </div>

              {/* DATE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-[#25282D]">
                  Date
                </label>

                <div className="relative">
                  <Calendar
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A3AA]"
                  />

                  <input
                    type="date"
                    value={date}
                    onChange={(event) =>
                      setDate(event.target.value)
                    }
                    className="w-full rounded-lg border border-[#E8E9ED] bg-white py-3 pl-10 pr-4 text-sm text-[#25282D] outline-none transition focus:border-[#EF4B4B] focus:ring-2 focus:ring-[#EF4B4B]/10"
                  />
                </div>
              </div>
            </div>

            {/* PARTICULARS */}

            <div>
              <label className="mb-2 block text-sm font-medium text-[#25282D]">
                Particulars
              </label>

              <div className="relative">
                <FileText
                  size={18}
                  className="absolute left-3 top-3 text-[#A0A3AA]"
                />

                <textarea
                  value={note}
                  onChange={(event) =>
                    setNote(event.target.value)
                  }
                  rows={4}
                  maxLength={255}
                  placeholder="e.g. Fuel purchase, trip payment, driver allowance..."
                  className="w-full resize-none rounded-lg border border-[#E8E9ED] bg-white py-3 pl-10 pr-4 text-sm text-[#25282D] outline-none transition placeholder:text-[#A0A3AA] focus:border-[#EF4B4B] focus:ring-2 focus:ring-[#EF4B4B]/10"
                />
              </div>

              <p className="mt-2 text-right text-xs text-[#A0A3AA]">
                {note.length}/255
              </p>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-3 border-t border-[#E8E9ED] p-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="rounded-lg border border-rose-200 bg-white px-5 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete Transaction
            </button>

            <div className="flex gap-3">
              <Link
                href="/accounting"
                className="rounded-lg border border-[#E8E9ED] bg-white px-5 py-3 text-sm font-semibold text-[#737780] transition hover:bg-[#F5F6F8] hover:text-[#25282D]"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#EF4B4B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#D93B3B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
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
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  )
}