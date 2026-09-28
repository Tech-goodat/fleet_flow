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
        return "bg-[#EF4B4B]/10 text-[#D93B3B] border-[#EF4B4B]/20"

      case "loading":
        return "bg-amber-50 text-amber-600 border-amber-200"

      case "delivered":
        return "bg-emerald-50 text-emerald-600 border-emerald-200"

      case "returning":
        return "bg-violet-50 text-violet-600 border-violet-200"

      default:
        return "bg-gray-100 text-[#737780] border-[#E8E9ED]"
    }
  }

  const formatStatus = (status: string) => {
    return status
      .replace("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  }

  return (
    <main className="min-h-screen bg-[#F5F6F8] text-[#25282D]">

      {/* HEADER */}

      <header className="border-b border-[#E8E9ED] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">

          {/* BRAND */}

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EF4B4B] text-white">
              <Truck size={21} />
            </div>

            <div className="min-w-0">
              <h1 className="text-lg font-bold text-[#25282D]">
                Fleet<span className="text-[#EF4B4B]">Flow</span>
              </h1>

              <p className="hidden text-xs text-[#737780] sm:block">
                Fleet management
              </p>
            </div>
          </div>

          {/* HEADER ACTIONS */}

          <div className="flex items-center gap-2 sm:gap-3">

            {/* ACCOUNTING */}

            <Link
              href="/accounting"
              className="group flex items-center gap-2 rounded-lg border border-[#E8E9ED] bg-white px-3 py-2 text-sm font-semibold text-[#737780] transition hover:border-[#EF4B4B]/30 hover:bg-[#EF4B4B]/5 hover:text-[#25282D] sm:px-4"
            >
              <Wallet
                size={17}
                className="text-[#A0A3AA] transition group-hover:text-[#EF4B4B]"
              />

              <span className="hidden sm:inline">
                Accounting
              </span>
            </Link>

            {/* ADD LORRY */}

            <Link
              href="/new"
              className="flex items-center gap-2 rounded-lg bg-[#EF4B4B] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#D93B3B] sm:px-4"
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
          <p className="text-sm font-medium text-[#EF4B4B]">
            Overview
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#25282D]">
            Your Fleet
          </h2>

          <p className="mt-2 max-w-2xl text-[#737780]">
            Keep track of your lorries and their current operations.
          </p>
        </div>

        {/* BASIC FLEET STATS */}

        <div className="mb-5 grid gap-5 md:grid-cols-3">

          {/* TOTAL LORRIES */}

          <div className="rounded-xl border border-[#E8E9ED] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#737780]">
              Total lorries
            </p>

            <p className="mt-2 text-3xl font-bold text-[#25282D]">
              {vehicles.length}
            </p>

            <p className="mt-1 text-xs text-[#A0A3AA]">
              Currently in your active fleet
            </p>
          </div>

          {/* CURRENTLY ACTIVE */}

          <div className="rounded-xl border border-[#E8E9ED] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#737780]">
              Currently active
            </p>

            <p className="mt-2 text-3xl font-bold text-[#25282D]">
              {activeVehicles}
            </p>

            <p className="mt-1 text-xs text-[#A0A3AA]">
              Loading or in transit
            </p>
          </div>

          {/* ARCHIVED LORRIES */}

          <div className="rounded-xl border border-[#E8E9ED] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#737780]">
                  Archived lorries
                </p>

                <p className="mt-2 text-3xl font-bold text-[#25282D]">
                  {archivedVehicles.length}
                </p>

                <p className="mt-1 text-xs text-[#A0A3AA]">
                  Removed from active fleet
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5F6F8] text-[#737780]">
                <Archive size={19} />
              </div>
            </div>

            <Link
              href="/archive"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#EF4B4B] transition hover:text-[#D93B3B]"
            >
              View archive
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* FLEET FINANCIAL OVERVIEW */}

        <div className="mb-10 grid gap-5 md:grid-cols-2">

          {/* TOTAL INCOME */}

          <div className="rounded-xl border border-[#E8E9ED] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#737780]">
                  Total income
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {formatCurrency(totalIncome)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50">
                <TrendingUp
                  size={21}
                  className="text-emerald-600"
                />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#A0A3AA]">
              Income from all vehicles
            </p>
          </div>

          {/* TOTAL EXPENSES */}

          <div className="rounded-xl border border-[#E8E9ED] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#737780]">
                  Total expenses
                </p>

                <p className="mt-2 text-2xl font-bold text-rose-600">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-50">
                <TrendingDown
                  size={21}
                  className="text-rose-600"
                />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#A0A3AA]">
              Expenses from all vehicles
            </p>
          </div>
        </div>

        {/* FLEET BALANCE */}

        <div className="mb-10 flex flex-col gap-5 rounded-xl border border-[#E8E9ED] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-[#737780]">
              Fleet balance
            </p>

            <p
              className={`mt-2 text-2xl font-bold ${
                fleetBalance >= 0
                  ? "text-emerald-600"
                  : "text-rose-600"
              }`}
            >
              {formatCurrency(fleetBalance)}
            </p>

            <p className="mt-1 text-xs text-[#A0A3AA]">
              Income minus expenses across the fleet
            </p>
          </div>

          <Link
            href="/accounting"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#E8E9ED] px-4 py-3 text-sm font-semibold text-[#737780] transition hover:border-[#EF4B4B]/40 hover:bg-[#EF4B4B]/5 hover:text-[#EF4B4B] sm:w-auto"
          >
            View accounting
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="flex min-h-75 items-center justify-center">
            <div className="flex items-center gap-3 text-[#737780]">
              <Loader2
                className="animate-spin text-[#EF4B4B]"
                size={20}
              />
              Loading your fleet...
            </div>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600">
            {error}
          </div>
        )}

        {/* EMPTY FLEET */}

        {!loading && !error && vehicles.length === 0 && (
          <div className="rounded-xl border border-[#E8E9ED] bg-white p-12 text-center shadow-sm">
            <Truck
              size={40}
              className="mx-auto text-[#A0A3AA]"
            />

            <h3 className="mt-4 text-lg font-semibold text-[#25282D]">
              No vehicles yet
            </h3>

            <p className="mt-2 text-sm text-[#737780]">
              Add your first lorry to start managing your fleet.
            </p>

            <Link
              href="/new"
              className="mx-auto mt-6 inline-flex items-center gap-2 rounded-lg bg-[#EF4B4B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#D93B3B]"
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
              <h3 className="text-xl font-semibold text-[#25282D]">
                All vehicles
              </h3>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span className="text-sm text-[#737780]">
                  {vehicles.length} vehicles
                </span>

                <Link
                  href="/new"
                  className="flex items-center gap-2 rounded-lg border border-[#E8E9ED] bg-white px-4 py-2 text-sm font-medium text-[#737780] transition hover:border-[#EF4B4B]/30 hover:bg-[#EF4B4B]/5 hover:text-[#25282D]"
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
                  className="rounded-xl border border-[#E8E9ED] bg-white p-5 shadow-sm transition hover:border-[#EF4B4B]/30 hover:shadow-md sm:p-6"
                >

                  {/* VEHICLE HEADER */}

                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="text-xl font-bold text-[#25282D]">
                        {vehicle.registration_number}
                      </h4>

                      <p className="mt-1 truncate text-sm text-[#737780]">
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
                        className="mt-0.5 shrink-0 text-[#A0A3AA]"
                      />

                      <div className="min-w-0">
                        <p className="text-xs text-[#737780]">
                          Cargo
                        </p>

                        <p className="mt-1 truncate text-sm font-medium text-[#25282D]">
                          {vehicle.cargo_type}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <MapPin
                        size={18}
                        className="mt-0.5 shrink-0 text-[#A0A3AA]"
                      />

                      <div className="min-w-0">
                        <p className="text-xs text-[#737780]">
                          Location
                        </p>

                        <p className="mt-1 truncate text-sm font-medium text-[#25282D]">
                          {vehicle.current_location}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <MapPin
                        size={18}
                        className="mt-0.5 shrink-0 text-[#A0A3AA]"
                      />

                      <div className="min-w-0">
                        <p className="text-xs text-[#737780]">
                          Destination
                        </p>

                        <p className="mt-1 truncate text-sm font-medium text-[#25282D]">
                          {vehicle.destination}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Fuel
                        size={18}
                        className="mt-0.5 shrink-0 text-[#A0A3AA]"
                      />

                      <div>
                        <p className="text-xs text-[#737780]">
                          Fuel
                        </p>

                        <p className="mt-1 text-sm font-medium text-[#25282D]">
                          {vehicle.fuel_level}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* MILEAGE */}

                  <div className="mt-6 border-t border-[#E8E9ED] pt-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#737780]">
                        Mileage
                      </span>

                      <span className="font-medium text-[#25282D]">
                        {vehicle.mileage} km
                      </span>
                    </div>
                  </div>

                  {/* DETAILS BUTTON */}

                  <Link
                    href={`/vehicles/${vehicle.id}`}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#E8E9ED] py-3 text-sm font-semibold text-[#737780] transition hover:border-[#EF4B4B]/30 hover:bg-[#EF4B4B]/5 hover:text-[#EF4B4B]"
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