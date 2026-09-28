"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Truck,
  Fuel,
  MapPin,
  Package,
  Loader2,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Pencil,
  Archive,
  X,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"

const API_URL = "https://fleet-backend-np49.onrender.com/api"

interface Vehicle {
  id: number
  registration_number: string
  driver_name: string
  cargo_type: string
  destination: string
  current_location: string
  mileage: string
  fuel_level: string
  status: string
}

interface Transaction {
  id: number
  vehicle: number
  type: "income" | "expense"
  amount: string
  date: string
  note: string
  created_at: string
}

export default function VehicleDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // --------------------------------------------------
  // ADD TRANSACTION STATE
  // --------------------------------------------------

  const [showTransactionForm, setShowTransactionForm] =
    useState(false)

  const [transactionType, setTransactionType] =
    useState<"income" | "expense">("income")

  const [amount, setAmount] = useState("")
  const [date, setDate] = useState("")
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [transactionError, setTransactionError] = useState("")
  const [editingTransactionId, setEditingTransactionId] = useState<number | null>(null)
  const [deletingTransactionId, setDeletingTransactionId] = useState<number | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState(false)
  const [transactionActionError, setTransactionActionError] = useState("")
  const [alert, setAlert] = useState<{
    type: "success" | "error"
    title: string
    message: string
    action?: "archive"
  } | null>(null)

  // --------------------------------------------------
  // EDIT VEHICLE STATE
  // --------------------------------------------------

  const [showEditForm, setShowEditForm] = useState(false)
  const [editDriverName, setEditDriverName] = useState("")
  const [editDestination, setEditDestination] = useState("")
  const [editCurrentLocation, setEditCurrentLocation] =
    useState("")
  const [editFuelLevel, setEditFuelLevel] = useState("")
  const [editMileage, setEditMileage] = useState("")
  const [updatingVehicle, setUpdatingVehicle] =
    useState(false)
  const [vehicleUpdateError, setVehicleUpdateError] =
    useState("")

  // --------------------------------------------------
  // ARCHIVE STATE
  // --------------------------------------------------

  const [archiving, setArchiving] = useState(false)
  const [archiveError, setArchiveError] = useState("")

  // --------------------------------------------------
  // FETCH DATA
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

        const vehicleResponse = await fetch(
          `${API_URL}/vehicles/${id}/`,
          {
            method: "GET",
            headers,
          }
        )

        if (!vehicleResponse.ok) {
          throw new Error("Failed to fetch vehicle")
        }

        const vehicleData = await vehicleResponse.json()

        setVehicle(vehicleData)

        const transactionsResponse = await fetch(
          `${API_URL}/transactions/`,
          {
            method: "GET",
            headers,
          }
        )

        if (!transactionsResponse.ok) {
          throw new Error("Failed to fetch transactions")
        }

        const transactionsData =
          await transactionsResponse.json()

        const vehicleTransactions =
          transactionsData.filter(
            (transaction: Transaction) =>
              transaction.vehicle === Number(id)
          )

        setTransactions(vehicleTransactions)
      } catch (error) {
        console.error(error)
        setError("Unable to load vehicle details.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  // --------------------------------------------------
  // EDIT VEHICLE
  // --------------------------------------------------

  const openEditForm = () => {
    if (!vehicle) return

    setEditDriverName(vehicle.driver_name)
    setEditDestination(vehicle.destination)
    setEditCurrentLocation(vehicle.current_location)
    setEditFuelLevel(vehicle.fuel_level)
    setEditMileage(vehicle.mileage)

    setVehicleUpdateError("")
    setShowEditForm(true)
  }

  const closeEditForm = () => {
    if (updatingVehicle) return

    setShowEditForm(false)
    setVehicleUpdateError("")
  }

  const handleUpdateVehicle = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    const token = localStorage.getItem("token")

    if (!token) {
      setVehicleUpdateError(
        "You are not authenticated."
      )
      return
    }

    if (!vehicle) {
      setVehicleUpdateError(
        "Vehicle information is unavailable."
      )
      return
    }

    if (
      !editDriverName.trim() ||
      !editDestination.trim() ||
      !editCurrentLocation.trim() ||
      editFuelLevel === "" ||
      editMileage === ""
    ) {
      setVehicleUpdateError(
        "Please fill in all vehicle details."
      )
      return
    }

    const fuelLevel = Number(editFuelLevel)
    const mileage = Number(editMileage)

    if (
      Number.isNaN(fuelLevel) ||
      fuelLevel < 0 ||
      fuelLevel > 100
    ) {
      setVehicleUpdateError(
        "Fuel level must be a number between 0 and 100."
      )
      return
    }

    if (Number.isNaN(mileage) || mileage < 0) {
      setVehicleUpdateError(
        "Mileage must be a valid number greater than or equal to 0."
      )
      return
    }

    setUpdatingVehicle(true)
    setVehicleUpdateError("")

    try {
      const response = await fetch(
        `${API_URL}/vehicles/${vehicle.id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            driver_name: editDriverName.trim(),
            destination: editDestination.trim(),
            current_location:
              editCurrentLocation.trim(),
            fuel_level: fuelLevel,
            mileage: mileage,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.text()

        console.error(
          "Vehicle update error:",
          errorData
        )

        throw new Error(
          "Failed to update vehicle"
        )
      }

      const updatedVehicle = await response.json()

      setVehicle(updatedVehicle)
      setShowEditForm(false)
      setAlert({
        type: "success",
        title: "Lorry updated",
        message: "The lorry details have been updated successfully.",
      })
    } catch (error) {
      console.error(error)

      setVehicleUpdateError(
        "Unable to update vehicle. Please try again."
      )
    } finally {
      setUpdatingVehicle(false)
    }
  }

  // --------------------------------------------------
  // ARCHIVE VEHICLE
  // --------------------------------------------------

  const confirmArchiveVehicle = () => {
    if (!vehicle || archiving) return
    setAlert({
      type: "error",
      title: "Archive lorry?",
      message: `Are you sure you want to archive ${vehicle.registration_number}?`,
      action: "archive",
    })
  }

  const handleArchiveVehicle = async () => {
    if (!vehicle) return

    const token = localStorage.getItem("token")

    if (!token) {
      setArchiveError("You are not authenticated.")
      return
    }

    setArchiving(true)
    setArchiveError("")

    try {
      const response = await fetch(
        `${API_URL}/vehicles/${vehicle.id}/archive/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.text()

        console.error(
          "Archive vehicle error:",
          errorData
        )

        throw new Error(
          "Failed to archive vehicle"
        )
      }

      window.location.href = "/dashboard"
    } catch (error) {
      console.error(error)

      setArchiveError(
        "Unable to archive this lorry. Please try again."
      )

      setArchiving(false)
    }
  }

  // --------------------------------------------------
  // ADD TRANSACTION
  // --------------------------------------------------

  const openAddTransactionForm = () => {
    setEditingTransactionId(null)
    setTransactionType("income")
    setAmount("")
    setDate("")
    setNote("")
    setTransactionError("")
    setShowTransactionForm(true)
  }

  const openEditTransactionForm = (transaction: Transaction) => {
    setEditingTransactionId(transaction.id)
    setTransactionType(transaction.type)
    setAmount(transaction.amount)
    setDate(transaction.date)
    setNote(transaction.note || "")
    setTransactionError("")
    setShowTransactionForm(true)
  }

  const closeTransactionForm = () => {
    if (submitting) return
    setShowTransactionForm(false)
    setEditingTransactionId(null)
    setTransactionError("")
    setAmount("")
    setDate("")
    setNote("")
    setTransactionType("income")
  }

  const handleSaveTransaction = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    const token = localStorage.getItem("token")

    if (!token) {
      setTransactionError("You are not authenticated.")
      return
    }

    if (!amount || !date) {
      setTransactionError("Amount and date are required.")
      return
    }

    if (Number(amount) <= 0) {
      setTransactionError("Amount must be greater than zero.")
      return
    }

    if (!vehicle) {
      setTransactionError("Vehicle information is unavailable.")
      return
    }

    setSubmitting(true)
    setTransactionError("")

    try {
      const isEditing = editingTransactionId !== null
      const endpoint = isEditing
        ? `${API_URL}/transactions/${editingTransactionId}/`
        : `${API_URL}/transactions/`

      const response = await fetch(endpoint, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(isEditing ? {} : { vehicle: vehicle.id }),
          type: transactionType,
          amount,
          date,
          note: note.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("Transaction save error:", errorData)
        throw new Error(
          isEditing
            ? "Failed to update transaction"
            : "Failed to create transaction"
        )
      }

      const savedTransaction = await response.json()

      setTransactions((currentTransactions) =>
        isEditing
          ? currentTransactions.map((transaction) =>
              transaction.id === savedTransaction.id
                ? savedTransaction
                : transaction
            )
          : [savedTransaction, ...currentTransactions]
      )

      closeTransactionForm()

      setAlert({
        type: "success",
        title: isEditing ? "Transaction updated" : "Transaction added",
        message: isEditing
          ? "The transaction has been updated successfully."
          : "The transaction has been added successfully.",
      })
    } catch (error) {
      console.error(error)
      setTransactionError(
        editingTransactionId !== null
          ? "Unable to update transaction. Please try again."
          : "Unable to create transaction. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  const requestDeleteTransaction = (transaction: Transaction) => {
    setDeletingTransactionId(transaction.id)
    setTransactionActionError("")
  }

  const cancelDeleteTransaction = () => {
    if (deletingTransaction) return
    setDeletingTransactionId(null)
    setTransactionActionError("")
  }

  const handleDeleteTransaction = async () => {
    if (deletingTransactionId === null) return

    const token = localStorage.getItem("token")

    if (!token) {
      setTransactionActionError("You are not authenticated.")
      return
    }

    setDeletingTransaction(true)
    setTransactionActionError("")

    try {
      const response = await fetch(
        `${API_URL}/transactions/${deletingTransactionId}/`,
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
        console.error("Transaction delete error:", errorData)
        throw new Error("Failed to delete transaction")
      }

      setTransactions((currentTransactions) =>
        currentTransactions.filter(
          (transaction) => transaction.id !== deletingTransactionId
        )
      )

      setDeletingTransactionId(null)

      setAlert({
        type: "success",
        title: "Transaction deleted",
        message: "The transaction has been removed from this lorry.",
      })
    } catch (error) {
      console.error(error)
      setTransactionActionError(
        "Unable to delete transaction. Please try again."
      )
    } finally {
      setDeletingTransaction(false)
    }
  }

  // --------------------------------------------------
  // FINANCIAL CALCULATIONS
  // --------------------------------------------------

  const totalIncome = transactions
    .filter(
      (transaction) =>
        transaction.type === "income"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    )

  const totalExpenses = transactions
    .filter(
      (transaction) =>
        transaction.type === "expense"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    )

  const balance = totalIncome - totalExpenses

  // --------------------------------------------------
  // FORMATTING
  // --------------------------------------------------

  const formatStatus = (status: string) => {
    return status
      .replace("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      )
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    )
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
        <div className="flex items-center gap-3 text-zinc-400">
          <Loader2
            size={20}
            className="animate-spin"
          />
          Loading vehicle...
        </div>
      </main>
    )
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error || !vehicle) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
        <div className="text-center">
          <p className="text-rose-400">
            {error || "Vehicle not found."}
          </p>

          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center gap-2 text-sm text-[#D98A3D] transition hover:text-[#E8A85C]"
          >
            <ArrowLeft size={16} />
            Back to Fleet
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-zinc-950 text-white">
      {/* --------------------------------------------------
          HEADER
      -------------------------------------------------- */}

      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Fleet
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {/* --------------------------------------------------
            VEHICLE HEADER
        -------------------------------------------------- */}

        <div className="mb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Vehicle identity */}

            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#C6752B] sm:h-14 sm:w-14">
                <Truck
                  size={25}
                  className="sm:hidden"
                />

                <Truck
                  size={28}
                  className="hidden sm:block"
                />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold sm:text-3xl">
                  {vehicle.registration_number}
                </h1>

                <p className="mt-1 truncate text-sm text-zinc-400 sm:text-base">
                  {vehicle.driver_name}
                </p>
              </div>
            </div>

            {/* Status + actions */}

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              {/* Status */}

              <span className="inline-flex w-fit items-center rounded-full border border-[#C6752B]/20 bg-[#C6752B]/10 px-3 py-1.5 text-xs font-medium text-[#D98A3D] sm:px-4 sm:py-2 sm:text-sm">
                {formatStatus(vehicle.status)}
              </span>

              {/* Action buttons */}

              <div className="flex w-full gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={openEditForm}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-700 px-3 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white sm:flex-none sm:px-4"
                >
                  <Pencil size={16} />
                  <span>Edit Lorry</span>
                </button>

                <button
                  type="button"
                  onClick={confirmArchiveVehicle}
                  disabled={archiving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-4"
                >
                  {archiving ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Archive size={16} />
                  )}

                  <span>
                    {archiving
                      ? "Archiving..."
                      : "Archive"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------
            ARCHIVE ERROR
        -------------------------------------------------- */}

        {archiveError && (
          <div className="mb-6 rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400">
            {archiveError}
          </div>
        )}

        {/* --------------------------------------------------
            EDIT VEHICLE FORM
        -------------------------------------------------- */}

        {showEditForm && (
          <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Edit Lorry
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Update the current operational
                  details of this lorry.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditForm}
                disabled={updatingVehicle}
                className="shrink-0 rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateVehicle}>
              <div className="grid gap-5 md:grid-cols-2">
                {/* Registration */}

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Registration Number
                  </label>

                  <input
                    type="text"
                    value={
                      vehicle.registration_number
                    }
                    disabled
                    className="mt-2 w-full cursor-not-allowed rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-500"
                  />

                  <p className="mt-1 text-xs text-zinc-600">
                    Registration number cannot be
                    changed.
                  </p>
                </div>

                {/* Cargo */}

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Cargo Type
                  </label>

                  <input
                    type="text"
                    value={vehicle.cargo_type}
                    disabled
                    className="mt-2 w-full cursor-not-allowed rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-500"
                  />

                  <p className="mt-1 text-xs text-zinc-600">
                    Cargo type cannot be changed here.
                  </p>
                </div>

                {/* Driver */}

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Driver
                  </label>

                  <input
                    type="text"
                    value={editDriverName}
                    onChange={(event) =>
                      setEditDriverName(
                        event.target.value
                      )
                    }
                    placeholder="Driver name"
                    className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#C6752B]"
                  />
                </div>

                {/* Destination */}

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Destination
                  </label>

                  <input
                    type="text"
                    value={editDestination}
                    onChange={(event) =>
                      setEditDestination(
                        event.target.value
                      )
                    }
                    placeholder="Destination"
                    className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#C6752B]"
                  />
                </div>

                {/* Current Location */}

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Current Location
                  </label>

                  <input
                    type="text"
                    value={editCurrentLocation}
                    onChange={(event) =>
                      setEditCurrentLocation(
                        event.target.value
                      )
                    }
                    placeholder="Current location"
                    className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#C6752B]"
                  />
                </div>

                {/* Fuel */}

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Fuel Level (%)
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={editFuelLevel}
                    onChange={(event) =>
                      setEditFuelLevel(
                        event.target.value
                      )
                    }
                    placeholder="e.g. 75"
                    className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#C6752B]"
                  />
                </div>

                {/* Mileage */}

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Mileage (km)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editMileage}
                    onChange={(event) =>
                      setEditMileage(
                        event.target.value
                      )
                    }
                    placeholder="e.g. 125000"
                    className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#C6752B]"
                  />
                </div>
              </div>

              {vehicleUpdateError && (
                <p className="mt-4 text-sm text-rose-400">
                  {vehicleUpdateError}
                </p>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditForm}
                  disabled={updatingVehicle}
                  className="rounded-lg border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updatingVehicle}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#C6752B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#A85F20] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updatingVehicle && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {updatingVehicle
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --------------------------------------------------
            FINANCIAL OVERVIEW
        -------------------------------------------------- */}

        <div className="mb-8 grid gap-4 sm:gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
            <p className="text-sm text-zinc-400">
              Total income
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-400 sm:text-3xl">
              KES{" "}
              {totalIncome.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
            <p className="text-sm text-zinc-400">
              Total expenses
            </p>

            <p className="mt-2 text-2xl font-bold text-rose-400 sm:text-3xl">
              KES{" "}
              {totalExpenses.toLocaleString()}
            </p>
          </div>
        </div>

        {/* --------------------------------------------------
            VEHICLE INFORMATION
        -------------------------------------------------- */}

        <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
          <h2 className="mb-6 text-xl font-semibold">
            Vehicle Information
          </h2>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Driver */}

            <div className="flex gap-3">
              <Truck
                size={18}
                className="mt-0.5 shrink-0 text-zinc-500"
              />

              <div className="min-w-0">
                <p className="text-xs text-zinc-500">
                  Driver
                </p>

                <p className="mt-1 truncate text-sm font-medium">
                  {vehicle.driver_name}
                </p>
              </div>
            </div>

            {/* Cargo */}

            <div className="flex gap-3">
              <Package
                size={18}
                className="mt-0.5 shrink-0 text-zinc-500"
              />

              <div className="min-w-0">
                <p className="text-xs text-zinc-500">
                  Cargo
                </p>

                <p className="mt-1 truncate text-sm font-medium">
                  {vehicle.cargo_type}
                </p>
              </div>
            </div>

            {/* Destination */}

            <div className="flex gap-3">
              <MapPin
                size={18}
                className="mt-0.5 shrink-0 text-zinc-500"
              />

              <div className="min-w-0">
                <p className="text-xs text-zinc-500">
                  Destination
                </p>

                <p className="mt-1 truncate text-sm font-medium">
                  {vehicle.destination}
                </p>
              </div>
            </div>

            {/* Current Location */}

            <div className="flex gap-3">
              <MapPin
                size={18}
                className="mt-0.5 shrink-0 text-zinc-500"
              />

              <div className="min-w-0">
                <p className="text-xs text-zinc-500">
                  Current location
                </p>

                <p className="mt-1 truncate text-sm font-medium">
                  {vehicle.current_location}
                </p>
              </div>
            </div>

            {/* Fuel */}

            <div className="flex gap-3">
              <Fuel
                size={18}
                className="mt-0.5 shrink-0 text-zinc-500"
              />

              <div>
                <p className="text-xs text-zinc-500">
                  Fuel
                </p>

                <p className="mt-1 text-sm font-medium">
                  {vehicle.fuel_level}%
                </p>
              </div>
            </div>

            {/* Mileage */}

            <div>
              <p className="text-xs text-zinc-500">
                Mileage
              </p>

              <p className="mt-1 text-sm font-medium">
                {vehicle.mileage} km
              </p>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------
            TRANSACTIONS
        -------------------------------------------------- */}

        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          {/* Transaction Header */}

          <div className="flex flex-col gap-4 border-b border-zinc-800 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-xl font-semibold">
                Transactions
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Financial activity for this vehicle
              </p>
            </div>

            <button
              onClick={() =>
                showTransactionForm
                  ? closeTransactionForm()
                  : openAddTransactionForm()
              }
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C6752B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#A85F20] sm:w-auto"
            >
              <Plus size={17} />

              {showTransactionForm
                ? "Cancel"
                : "Add"}
            </button>
          </div>

          {/* --------------------------------------------------
              ADD TRANSACTION FORM
          -------------------------------------------------- */}

          {showTransactionForm && (
            <form
              onSubmit={handleSaveTransaction}
              className="border-b border-zinc-800 p-5 sm:p-6"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {editingTransactionId !== null
                      ? "Edit Transaction"
                      : "Add Transaction"}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {editingTransactionId !== null
                      ? "Update the transaction details below."
                      : "Record income or an expense for this lorry."}
                  </p>
                </div>
                {editingTransactionId !== null && (
                  <button
                    type="button"
                    onClick={closeTransactionForm}
                    disabled={submitting}
                    className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                    aria-label="Close transaction form"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {/* Type */}

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Transaction Type
                  </label>

                  <select
                    value={transactionType}
                    onChange={(event) =>
                      setTransactionType(
                        event.target
                          .value as
                          | "income"
                          | "expense"
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-[#C6752B]"
                  >
                    <option value="income">
                      Income
                    </option>

                    <option value="expense">
                      Expense
                    </option>
                  </select>
                </div>

                {/* Amount */}

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Amount
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(event) =>
                      setAmount(
                        event.target.value
                      )
                    }
                    placeholder="e.g. 50000"
                    className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#C6752B]"
                  />
                </div>

                {/* Date */}

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Date
                  </label>

                  <input
                    type="date"
                    value={date}
                    onChange={(event) =>
                      setDate(
                        event.target.value
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-[#C6752B]"
                  />
                </div>

                {/* Note */}

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Note
                  </label>

                  <input
                    type="text"
                    value={note}
                    onChange={(event) =>
                      setNote(
                        event.target.value
                      )
                    }
                    placeholder="e.g. Fuel, trip payment, repairs..."
                    className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#C6752B]"
                  />
                </div>
              </div>

              {transactionError && (
                <p className="mt-4 text-sm text-rose-400">
                  {transactionError}
                </p>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C6752B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#A85F20] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {submitting && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {submitting
                    ? editingTransactionId !== null
                      ? "Updating..."
                      : "Saving..."
                    : editingTransactionId !== null
                      ? "Update Transaction"
                      : "Save Transaction"}
                </button>
              </div>
            </form>
          )}

          {/* --------------------------------------------------
              TRANSACTION LIST
          -------------------------------------------------- */}

          {transactions.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-zinc-500">
                No transactions recorded yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead className="border-b border-zinc-800 text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">
                      Date
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Type
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Note
                    </th>

                    <th className="px-6 py-4 text-right font-medium">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map(
                    (transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-zinc-800 last:border-0"
                      >
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-400">
                          {formatDate(
                            transaction.date
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {transaction.type ===
                            "income" ? (
                              <ArrowUpCircle
                                size={17}
                                className="text-emerald-400"
                              />
                            ) : (
                              <ArrowDownCircle
                                size={17}
                                className="text-rose-400"
                              />
                            )}

                            <span
                              className={
                                transaction.type ===
                                "income"
                                  ? "text-sm font-medium text-emerald-400"
                                  : "text-sm font-medium text-rose-400"
                              }
                            >
                              {transaction.type ===
                              "income"
                                ? "Income"
                                : "Expense"}
                            </span>
                          </div>
                        </td>

                        <td className="max-w-[280px] truncate px-6 py-4 text-sm text-zinc-300">
                          {transaction.note ||
                            "-"}
                        </td>

                        <td
                          className={`whitespace-nowrap px-6 py-4 text-right text-sm font-semibold ${
                            transaction.type ===
                            "income"
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {transaction.type ===
                          "income"
                            ? "+"
                            : "-"}{" "}
                          KES{" "}
                          {Number(
                            transaction.amount
                          ).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                openEditTransactionForm(transaction)
                              }
                              aria-label={`Edit transaction ${transaction.id}`}
                              className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                requestDeleteTransaction(transaction)
                              }
                              aria-label={`Delete transaction ${transaction.id}`}
                              className="rounded-lg p-2 text-zinc-500 transition hover:bg-rose-500/10 hover:text-rose-400"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Optional balance indicator */}

        {transactions.length > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
            <span className="text-sm text-zinc-500">
              Current balance
            </span>

            <span
              className={`text-sm font-bold ${
                balance >= 0
                  ? "text-emerald-400"
                  : "text-rose-400"
              }`}
            >
              KES{" "}
              {balance.toLocaleString()}
            </span>
          </div>
        )}

        {/* --------------------------------------------------
            DELETE TRANSACTION MODAL
        -------------------------------------------------- */}

        {deletingTransactionId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/40">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
                  <Trash2 size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-white">
                    Delete transaction?
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    This transaction will be permanently removed from this
                    lorry's financial records. This action cannot be undone.
                  </p>
                </div>
              </div>

              {transactionActionError && (
                <div className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300">
                  {transactionActionError}
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cancelDeleteTransaction}
                  disabled={deletingTransaction}
                  className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteTransaction}
                  disabled={deletingTransaction}
                  className="flex items-center justify-center gap-2 rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingTransaction && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {deletingTransaction ? "Deleting..." : "Delete Transaction"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------------
            MODERN ALERT
        -------------------------------------------------- */}

        {alert && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/50">
              <div
                className={`h-1.5 w-full ${
                  alert.type === "success"
                    ? "bg-emerald-500"
                    : "bg-rose-500"
                }`}
              />

              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                      alert.type === "success"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    {alert.type === "success" ? (
                      <CheckCircle2 size={21} />
                    ) : (
                      <AlertTriangle size={21} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      {alert.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-zinc-400">
                      {alert.message}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAlert(null)}
                    className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                    aria-label="Close alert"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  {alert.action === "archive" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setAlert(null)}
                        disabled={archiving}
                        className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAlert(null)
                          void handleArchiveVehicle()
                        }}
                        disabled={archiving}
                        className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {archiving && (
                          <Loader2 size={16} className="animate-spin" />
                        )}
                        {archiving ? "Archiving..." : "Archive Lorry"}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAlert(null)}
                      className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition ${
                        alert.type === "success"
                          ? "bg-emerald-500 hover:bg-emerald-600"
                          : "bg-rose-500 hover:bg-rose-600"
                      }`}
                    >
                      Done
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}