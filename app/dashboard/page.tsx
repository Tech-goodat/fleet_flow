"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import {
  Truck,
  MapPin,
  Fuel,
  Package,
  ArrowRight,
  Loader2,
  Plus,
  TrendingUp,
  TrendingDown,
  Archive,
  Wallet,
} from "lucide-react"

const VEHICLES_URL = "https://fleet-backend-np49.onrender.com/api/vehicles/"
const ARCHIVED_VEHICLES_URL =
  "https://fleet-backend-np49.onrender.com/api/vehicles/archived/"
const TRANSACTIONS_URL =
  "https://fleet-backend-np49.onrender.com/api/transactions/"

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
  amount: string | number
  date: string
  note: string
}

const Dashboard = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [archivedVehicles, setArchivedVehicles] = useState<Vehicle[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDashboardData = async () => {
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

        const [
          vehiclesResponse,
          archivedVehiclesResponse,
          transactionsResponse,
        ] = await Promise.all([
          fetch(VEHICLES_URL, {
            method: "GET",
            headers,
          }),

          fetch(ARCHIVED_VEHICLES_URL, {
            method: "GET",
            headers,
          }),

          fetch(TRANSACTIONS_URL, {
            method: "GET",
            headers,
          }),
        ])

        if (!vehiclesResponse.ok) {
          throw new Error("Failed to fetch vehicles")
        }

        if (!archivedVehiclesResponse.ok) {
          throw new Error("Failed to fetch archived vehicles")
        }

        if (!transactionsResponse.ok) {
          throw new Error("Failed to fetch transactions")
        }

        const vehiclesData = await vehiclesResponse.json()
        const archivedVehiclesData =
          await archivedVehiclesResponse.json()
        const transactionsData = await transactionsResponse.json()

        setVehicles(vehiclesData)
        setArchivedVehicles(archivedVehiclesData)
        setTransactions(transactionsData)
      } catch (error) {
        console.error(error)
        setError("Unable to load your fleet.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const activeVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.status === "in_transit" ||
      vehicle.status === "loading"
  ).length

  // --------------------------------------------------
  // FLEET-WIDE FINANCIAL CALCULATIONS
  // --------------------------------------------------

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce(
      (total, transaction) => total + Number(transaction.amount),
      0
    )

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce(
      (total, transaction) => total + Number(transaction.amount),
      0
    )

  const fleetBalance = totalIncome - totalExpenses

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "in_transit":
        return "bg-[#C6752B]/10 text-[#D98A3D] border-[#C6752B]/20"

      case "loading":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"

      case "delivered":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"

      case "returning":
        return "bg-violet-500/10 text-violet-400 border-violet-500/20"

      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
    }
  }

  const formatStatus = (status: string) => {
    return status
      .replace("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* HEADER */}

      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
          {/* BRAND */}

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#C6752B]">
              <Truck size={21} />
            </div>

            <div className="min-w-0">
              <h1 className="text-lg font-bold">
                Fan<span className="text-[#D98A3D]">A</span>Na
              </h1>

              <p className="hidden text-xs text-zinc-500 sm:block">
                Fleet management
              </p>
            </div>
          </div>

          {/* HEADER ACTIONS */}

          <div className="flex items-center gap-2 sm:gap-3">
            {/* ACCOUNTING */}

            <Link
              href="/accounting"
              className="group flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:border-[#C6752B]/30 hover:bg-[#C6752B]/10 hover:text-white sm:px-4"
            >
              <Wallet
                size={17}
                className="text-zinc-500 transition group-hover:text-[#D98A3D]"
              />

              <span className="hidden sm:inline">
                Accounting
              </span>
            </Link>

            {/* ADD LORRY */}

            <Link
              href="/new"
              className="flex items-center gap-2 rounded-lg bg-[#C6752B] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#A85F20] sm:px-4"
            >
              <Plus size={17} />

              <span className="hidden sm:inline">
                Add Lorry
              </span>

              <span className="sm:hidden">
                Add
              </span>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* PAGE INTRO */}

        <div className="mb-8">
          <p className="text-sm font-medium text-[#D98A3D]">
            Overview
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Your Fleet
          </h2>

          <p className="mt-2 max-w-2xl text-zinc-400">
            Keep track of your lorries and their current operations.
          </p>
        </div>

        {/* BASIC FLEET STATS */}

        <div className="mb-5 grid gap-5 md:grid-cols-3">
          {/* TOTAL LORRIES */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">
              Total lorries
            </p>

            <p className="mt-2 text-3xl font-bold">
              {vehicles.length}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Currently in your active fleet
            </p>
          </div>

          {/* CURRENTLY ACTIVE */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">
              Currently active
            </p>

            <p className="mt-2 text-3xl font-bold">
              {activeVehicles}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Loading or in transit
            </p>
          </div>

          {/* ARCHIVED LORRIES */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-zinc-400">
                  Archived lorries
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {archivedVehicles.length}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Removed from active fleet
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                <Archive size={19} />
              </div>
            </div>

            <Link
              href="/archive"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#D98A3D] transition hover:text-[#E8A85C]"
            >
              View archive
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* FLEET FINANCIAL OVERVIEW */}

        <div className="mb-10 grid gap-5 md:grid-cols-2">
          {/* TOTAL INCOME */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">
                  Total income
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-400">
                  {formatCurrency(totalIncome)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10">
                <TrendingUp
                  size={21}
                  className="text-emerald-400"
                />
              </div>
            </div>

            <p className="mt-3 text-xs text-zinc-500">
              Income from all vehicles
            </p>
          </div>

          {/* TOTAL EXPENSES */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">
                  Total expenses
                </p>

                <p className="mt-2 text-2xl font-bold text-rose-400">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-500/10">
                <TrendingDown
                  size={21}
                  className="text-rose-400"
                />
              </div>
            </div>

            <p className="mt-3 text-xs text-zinc-500">
              Expenses from all vehicles
            </p>
          </div>
        </div>

        {/* FLEET BALANCE */}

        <div className="mb-10 flex flex-col gap-5 rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-zinc-400">
              Fleet balance
            </p>

            <p
              className={`mt-2 text-2xl font-bold ${
                fleetBalance >= 0
                  ? "text-emerald-400"
                  : "text-rose-400"
              }`}
            >
              {formatCurrency(fleetBalance)}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Income minus expenses across the fleet
            </p>
          </div>

          <Link
            href="/accounting"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:border-[#C6752B]/40 hover:bg-[#C6752B]/10 hover:text-[#D98A3D] sm:w-auto"
          >
            View accounting
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="flex min-h-75 items-center justify-center">
            <div className="flex items-center gap-3 text-zinc-400">
              <Loader2 className="animate-spin" size={20} />
              Loading your fleet...
            </div>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6 text-center text-rose-400">
            {error}
          </div>
        )}

        {/* EMPTY FLEET */}

        {!loading && !error && vehicles.length === 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
            <Truck
              size={40}
              className="mx-auto text-zinc-600"
            />

            <h3 className="mt-4 text-lg font-semibold">
              No vehicles yet
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              Add your first lorry to start managing your fleet.
            </p>

            <Link
              href="/new"
              className="mx-auto mt-6 inline-flex items-center gap-2 rounded-lg bg-[#C6752B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#A85F20]"
            >
              <Plus size={17} />
              Add Your First Lorry
            </Link>
          </div>
        )}

        {/* VEHICLES */}

        {!loading && !error && vehicles.length > 0 && (
          <div>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-xl font-semibold">
                All vehicles
              </h3>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span className="text-sm text-zinc-500">
                  {vehicles.length} vehicles
                </span>

                <Link
                  href="/new"
                  className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                >
                  <Plus size={16} />
                  Add Lorry
                </Link>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-700 sm:p-6"
                >
                  {/* VEHICLE HEADER */}

                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="text-xl font-bold">
                        {vehicle.registration_number}
                      </h4>

                      <p className="mt-1 truncate text-sm text-zinc-500">
                        {vehicle.driver_name}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyles(
                        vehicle.status
                      )}`}
                    >
                      {formatStatus(vehicle.status)}
                    </span>
                  </div>

                  {/* VEHICLE DETAILS */}

                  <div className="mt-6 grid grid-cols-2 gap-5">
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

                    <div className="flex gap-3">
                      <MapPin
                        size={18}
                        className="mt-0.5 shrink-0 text-zinc-500"
                      />

                      <div className="min-w-0">
                        <p className="text-xs text-zinc-500">
                          Location
                        </p>

                        <p className="mt-1 truncate text-sm font-medium">
                          {vehicle.current_location}
                        </p>
                      </div>
                    </div>

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
                  </div>

                  {/* MILEAGE */}

                  <div className="mt-6 border-t border-zinc-800 pt-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">
                        Mileage
                      </span>

                      <span className="font-medium">
                        {vehicle.mileage} km
                      </span>
                    </div>
                  </div>

                  {/* DETAILS BUTTON */}

                  <Link
                    href={`/vehicles/${vehicle.id}`}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                  >
                    View details
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

export default Dashboard