"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Archive,
  Truck,
  RotateCcw,
  Loader2,
  User,
  MapPin,
  Package,
  CheckCircle2,
  AlertCircle,
  X,
  TriangleAlert,
} from "lucide-react"

const API_URL = "https://fleet-backend-np49.onrender.com/api"

const COMPANY_NAME = "FleetFlow"

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
  is_active: boolean
}

type AlertType = "success" | "error"

interface AlertState {
  type: AlertType
  title: string
  message: string
}

export default function ArchivePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [restoringId, setRestoringId] = useState<number | null>(null)

  const [alert, setAlert] = useState<AlertState | null>(null)

  const [confirmVehicle, setConfirmVehicle] =
    useState<Vehicle | null>(null)

  useEffect(() => {
    fetchArchivedVehicles()
  }, [])

  // ---------------------------------------------------------
  // ALERT
  // ---------------------------------------------------------

  const showAlert = (
    type: AlertType,
    title: string,
    message: string
  ) => {
    setAlert({
      type,
      title,
      message,
    })

    setTimeout(() => {
      setAlert(null)
    }, 4500)
  }

  // ---------------------------------------------------------
  // FETCH ARCHIVED VEHICLES
  // ---------------------------------------------------------

  const fetchArchivedVehicles = async () => {
    const token = localStorage.getItem("token")

    if (!token) {
      setLoading(false)

      showAlert(
        "error",
        "Authentication required",
        "Please log in again to view your archived lorries."
      )

      return
    }

    try {
      const response = await fetch(
        `${API_URL}/vehicles/archived/`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          "Failed to fetch archived vehicles"
        )
      }

      const data = await response.json()

      setVehicles(data)
    } catch (error) {
      console.error(error)

      showAlert(
        "error",
        "Unable to load archive",
        "We couldn't load your archived lorries. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------------------------------------
  // OPEN RESTORE CONFIRMATION
  // ---------------------------------------------------------

  const handleRestore = (vehicle: Vehicle) => {
    setConfirmVehicle(vehicle)
  }

  // ---------------------------------------------------------
  // CONFIRM RESTORE
  // ---------------------------------------------------------

  const confirmRestore = async () => {
    if (!confirmVehicle) {
      return
    }

    const vehicle = confirmVehicle

    const token = localStorage.getItem("token")

    if (!token) {
      setConfirmVehicle(null)

      showAlert(
        "error",
        "Authentication required",
        "Please log in again before restoring this lorry."
      )

      return
    }

    setRestoringId(vehicle.id)
    setConfirmVehicle(null)

    try {
      const response = await fetch(
        `${API_URL}/vehicles/${vehicle.id}/restore/`,
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
          "Restore vehicle error:",
          errorData
        )

        throw new Error(
          "Failed to restore vehicle"
        )
      }

      // Remove the restored lorry immediately
      setVehicles((currentVehicles) =>
        currentVehicles.filter(
          (currentVehicle) =>
            currentVehicle.id !== vehicle.id
        )
      )

      showAlert(
        "success",
        "Lorry restored",
        `${vehicle.registration_number} is back in your active fleet.`
      )
    } catch (error) {
      console.error(error)

      showAlert(
        "error",
        "Restore failed",
        `Unable to restore ${vehicle.registration_number}. Please try again.`
      )
    } finally {
      setRestoringId(null)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* =====================================================
          ANIMATED ALERT
      ===================================================== */}

      {alert && (
        <div className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-sm animate-[slideIn_.35s_ease-out]">
          <div
            className={`relative overflow-hidden rounded-2xl border bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-xl ${
              alert.type === "success"
                ? "border-emerald-500/20 shadow-emerald-950/30"
                : "border-rose-500/20 shadow-rose-950/30"
            }`}
          >
            {/* Accent line */}
            <div
              className={`absolute left-0 top-0 h-full w-1 ${
                alert.type === "success"
                  ? "bg-emerald-500"
                  : "bg-rose-500"
              }`}
            />

            <div className="flex items-start gap-3 pl-2">
              {/* Icon */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  alert.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-rose-500/10 text-rose-400"
                }`}
              >
                {alert.type === "success" ? (
                  <CheckCircle2 size={21} />
                ) : (
                  <AlertCircle size={21} />
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">
                  {alert.title}
                </p>

                <p className="mt-1 text-sm leading-5 text-zinc-400">
                  {alert.message}
                </p>
              </div>

              {/* Close */}
              <button
                onClick={() => setAlert(null)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                aria-label="Close alert"
              >
                <X size={16} />
              </button>
            </div>

            {/* Progress bar */}
            <div
              className={`absolute bottom-0 left-0 h-[2px] animate-[shrink_4.5s_linear_forwards] ${
                alert.type === "success"
                  ? "bg-emerald-500"
                  : "bg-rose-500"
              }`}
            />
          </div>
        </div>
      )}

      {/* =====================================================
          RESTORE CONFIRMATION MODAL
      ===================================================== */}

      {confirmVehicle && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-[modalIn_.25s_ease-out] rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            {/* Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EF5B55]/10 text-[#EF5B55]">
              <TriangleAlert size={24} />
            </div>

            {/* Heading */}
            <div className="mt-5">
              <h3 className="text-xl font-bold text-white">
                Restore this lorry?
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                You are about to bring{" "}
                <span className="font-semibold text-white">
                  {confirmVehicle.registration_number}
                </span>{" "}
                back into your active fleet.
              </p>
            </div>

            {/* Vehicle preview */}
            <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EF5B55] text-white">
                  <Truck size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    {confirmVehicle.registration_number}
                  </p>

                  <p className="mt-0.5 text-xs text-zinc-500">
                    {confirmVehicle.driver_name ||
                      "No driver assigned"}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirmVehicle(null)}
                className="rounded-lg border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={confirmRestore}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#EF5B55] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#D94B46]"
              >
                <RotateCcw size={17} />
                Restore Lorry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:border-zinc-700 hover:text-white"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <h1 className="text-lg font-bold">
                Fleet
                <span className="text-[#EF5B55]">
                  Flow
                </span>
              </h1>

              <p className="text-xs text-zinc-500">
                Fleet management
              </p>
            </div>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
            <Archive size={20} />
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium text-[#EF5B55]">
            Fleet Archive
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Archived Lorries
          </h2>

          <p className="mt-2 text-zinc-400">
            Lorries removed from your active fleet are kept here.
          </p>
        </div>

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-zinc-400">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900">
                <Loader2
                  size={21}
                  className="animate-spin text-[#EF5B55]"
                />
              </div>

              <p className="text-sm">
                Loading archived lorries...
              </p>
            </div>
          </div>
        )}

        {/* ===================================================
            EMPTY STATE
        =================================================== */}

        {!loading && vehicles.length === 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-800 text-zinc-600">
              <Archive size={28} />
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              No archived lorries
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Lorries that you archive will appear here. You can
              restore them to your active fleet at any time.
            </p>

            <Link
              href="/dashboard"
              className="mx-auto mt-6 inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to Fleet
            </Link>
          </div>
        )}

        {/* ===================================================
            ARCHIVED VEHICLES
        =================================================== */}

        {!loading && vehicles.length > 0 && (
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                Archived vehicles
              </h3>

              <span className="text-sm text-zinc-500">
                {vehicles.length}{" "}
                {vehicles.length === 1
                  ? "lorry"
                  : "lorries"}
              </span>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-700"
                >
                  {/* Vehicle heading */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EF5B55] text-white">
                        <Truck size={24} />
                      </div>

                      <div>
                        <h4 className="text-xl font-bold">
                          {vehicle.registration_number}
                        </h4>

                        <p className="mt-1 text-sm text-zinc-500">
                          {vehicle.driver_name}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-400">
                      Archived
                    </span>
                  </div>

                  {/* Vehicle information */}
                  <div className="mt-6 grid grid-cols-2 gap-5">
                    <div className="flex gap-3">
                      <User
                        size={18}
                        className="mt-0.5 text-zinc-500"
                      />

                      <div>
                        <p className="text-xs text-zinc-500">
                          Driver
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {vehicle.driver_name ||
                            "Not assigned"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Package
                        size={18}
                        className="mt-0.5 text-zinc-500"
                      />

                      <div>
                        <p className="text-xs text-zinc-500">
                          Cargo
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {vehicle.cargo_type ||
                            "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <MapPin
                        size={18}
                        className="mt-0.5 text-zinc-500"
                      />

                      <div>
                        <p className="text-xs text-zinc-500">
                          Location
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {vehicle.current_location ||
                            "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <MapPin
                        size={18}
                        className="mt-0.5 text-zinc-500"
                      />

                      <div>
                        <p className="text-xs text-zinc-500">
                          Destination
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {vehicle.destination ||
                            "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mileage + restore */}
                  <div className="mt-6 border-t border-zinc-800 pt-5">
                    <div className="mb-5 flex items-center justify-between text-sm">
                      <span className="text-zinc-500">
                        Mileage
                      </span>

                      <span className="font-medium">
                        {vehicle.mileage} km
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        handleRestore(vehicle)
                      }
                      disabled={
                        restoringId === vehicle.id
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#EF5B55] py-3 text-sm font-semibold text-white transition hover:bg-[#D94B46] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {restoringId === vehicle.id ? (
                        <>
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                          Restoring...
                        </>
                      ) : (
                        <>
                          <RotateCcw size={17} />
                          Bring Back to Fleet
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* =====================================================
          ANIMATIONS
      ===================================================== */}

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(30px) translateY(-10px);
          }

          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(10px);
          }

          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes shrink {
          from {
            width: 100%;
          }

          to {
            width: 0%;
          }
        }
      `}</style>
    </main>
  )
}