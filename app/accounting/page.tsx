"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  Download,
  FileText,
  Loader2,
  Search,
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  Printer,
  Truck,
  Pencil,
  Trash2,
  Plus,
  MoreVertical,
  AlertTriangle,
  X,
} from "lucide-react"

const API_URL = "https://fleet-backend-np49.onrender.com/api"

const COMPANY_NAME = "FanANa"

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
  created_at?: string
}

export default function AccountingPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<
    "all" | "income" | "expense"
  >("all")

  const [vehicleFilter, setVehicleFilter] = useState("all")

  // "all" or YYYY-MM
  const [monthFilter, setMonthFilter] = useState("all")

  // "all" or YYYY-MM-DD
  const [dateFilter, setDateFilter] = useState("all")

  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  const [deleteTarget, setDeleteTarget] =
    useState<Transaction | null>(null)

  const menuRef = useRef<HTMLDivElement | null>(null)

  const [generatedAt, setGeneratedAt] =
    useState<Date | null>(null)

  // --------------------------------------------------
  // MONTH HELPERS
  // --------------------------------------------------

  const getMonthKey = (date: string | Date) => {
    if (typeof date === "string") {
      const match = date.match(
        /^(\d{4})-(\d{2})/
      )

      if (match) {
        return `${match[1]}-${match[2]}`
      }
    }

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
      return ""
    }

    return `${parsedDate.getFullYear()}-${String(
      parsedDate.getMonth() + 1
    ).padStart(2, "0")}`
  }

  const formatMonthLabel = (
    monthKey: string
  ) => {
    const [year, month] = monthKey
      .split("-")
      .map(Number)

    if (!year || !month) {
      return monthKey
    }

    return new Date(
      year,
      month - 1,
      1
    ).toLocaleDateString("en-KE", {
      month: "long",
      year: "numeric",
    })
  }

  // --------------------------------------------------
  // CLOSE MENU WHEN CLICKING OUTSIDE
  // --------------------------------------------------

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setOpenMenuId(null)
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
    }
  }, [])

  // --------------------------------------------------
  // CLOSE DELETE MODAL WITH ESCAPE
  // --------------------------------------------------

  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === "Escape" &&
        deleteTarget
      ) {
        if (deletingId === null) {
          setDeleteTarget(null)
        }
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    )

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      )
    }
  }, [deleteTarget, deletingId])

  // --------------------------------------------------
  // FETCH ACCOUNTING DATA
  // --------------------------------------------------

  useEffect(() => {
    const fetchAccountingData =
      async () => {
        const token =
          localStorage.getItem("token")

        if (!token) {
          setError(
            "You are not authenticated."
          )
          setLoading(false)
          return
        }

        try {
          const headers = {
            Authorization: `Token ${token}`,
            "Content-Type":
              "application/json",
          }

          const [
            vehiclesResponse,
            transactionsResponse,
          ] = await Promise.all([
            fetch(`${API_URL}/vehicles/`, {
              method: "GET",
              headers,
            }),

            fetch(
              `${API_URL}/transactions/`,
              {
                method: "GET",
                headers,
              }
            ),
          ])

          if (!vehiclesResponse.ok) {
            throw new Error(
              "Failed to fetch vehicles"
            )
          }

          if (!transactionsResponse.ok) {
            throw new Error(
              "Failed to fetch transactions"
            )
          }

          const vehiclesData =
            await vehiclesResponse.json()

          const transactionsData =
            await transactionsResponse.json()

          setVehicles(vehiclesData)
          setTransactions(
            transactionsData
          )
        } catch (error) {
          console.error(error)

          setError(
            "Unable to load accounting information."
          )
        } finally {
          setLoading(false)
        }
      }

    fetchAccountingData()
  }, [])

  // --------------------------------------------------
  // VEHICLE LOOKUP
  // --------------------------------------------------

  const getVehicle = (
    vehicleId: number
  ) => {
    return vehicles.find(
      (vehicle) =>
        vehicle.id === vehicleId
    )
  }

  // --------------------------------------------------
  // CATEGORY
  // --------------------------------------------------

  const getCategory = (
    transaction: Transaction
  ) => {
    const note =
      transaction.note?.toLowerCase() ||
      ""

    if (transaction.type === "income") {
      if (
        note.includes("trip") ||
        note.includes("transport") ||
        note.includes("haulage")
      ) {
        return "Trip Revenue"
      }

      if (
        note.includes("cargo") ||
        note.includes("load") ||
        note.includes("delivery")
      ) {
        return "Cargo Revenue"
      }

      if (
        note.includes("payment") ||
        note.includes("client") ||
        note.includes("customer")
      ) {
        return "Customer Payment"
      }

      return "Revenue"
    }

    if (
      note.includes("fuel") ||
      note.includes("diesel")
    ) {
      return "Fuel"
    }

    if (
      note.includes("repair") ||
      note.includes("mechanic") ||
      note.includes("breakdown")
    ) {
      return "Repairs"
    }

    if (
      note.includes("maintenance") ||
      note.includes("service")
    ) {
      return "Maintenance"
    }

    if (
      note.includes("driver") ||
      note.includes("allowance")
    ) {
      return "Driver Expenses"
    }

    if (
      note.includes("salary") ||
      note.includes("wage")
    ) {
      return "Salaries"
    }

    if (note.includes("insurance")) {
      return "Insurance"
    }

    if (
      note.includes("tax") ||
      note.includes("levy")
    ) {
      return "Taxes & Levies"
    }

    if (
      note.includes("toll") ||
      note.includes("road")
    ) {
      return "Road / Tolls"
    }

    return "Operating Expense"
  }

  // --------------------------------------------------
  // FILTERED TRANSACTIONS
  // --------------------------------------------------

  const filteredTransactions =
    useMemo(() => {
      return [...transactions]
        .filter((transaction) => {
          // TYPE FILTER
          if (
            typeFilter !== "all" &&
            transaction.type !==
              typeFilter
          ) {
            return false
          }

          // VEHICLE FILTER
          if (
            vehicleFilter !== "all" &&
            transaction.vehicle !==
              Number(vehicleFilter)
          ) {
            return false
          }

          // MONTH FILTER
          if (monthFilter !== "all") {
            const transactionMonth =
              getMonthKey(
                transaction.date
              )

            if (
              transactionMonth !==
              monthFilter
            ) {
              return false
            }
          }

          // DATE FILTER
          if (dateFilter !== "all") {
            const transactionDate =
              typeof transaction.date === "string"
                ? transaction.date.slice(0, 10)
                : ""

            if (transactionDate !== dateFilter) {
              return false
            }
          }

          // SEARCH
          const vehicle = getVehicle(
            transaction.vehicle
          )

          const searchText = [
            transaction.note,
            transaction.id.toString(),
            vehicle?.registration_number ||
              "",
            vehicle?.driver_name || "",
            getCategory(transaction),
          ]
            .join(" ")
            .toLowerCase()

          return searchText.includes(
            search.toLowerCase()
          )
        })
        .sort(
          (a, b) =>
            new Date(
              b.date
            ).getTime() -
            new Date(
              a.date
            ).getTime()
        )
    }, [
      transactions,
      vehicles,
      search,
      typeFilter,
      vehicleFilter,
      monthFilter,
      dateFilter,
    ])

  // --------------------------------------------------
  // OVERALL ACCOUNTING TOTALS
  // --------------------------------------------------

  const totalIncome = transactions
    .filter(
      (transaction) =>
        transaction.type === "income"
    )
    .reduce(
      (total, transaction) =>
        total +
        Number(transaction.amount),
      0
    )

  const totalExpenses = transactions
    .filter(
      (transaction) =>
        transaction.type === "expense"
    )
    .reduce(
      (total, transaction) =>
        total +
        Number(transaction.amount),
      0
    )

  const netProfit =
    totalIncome - totalExpenses

  // --------------------------------------------------
  // FILTERED LEDGER TOTALS
  // --------------------------------------------------

  const filteredIncome =
    filteredTransactions
      .filter(
        (transaction) =>
          transaction.type === "income"
      )
      .reduce(
        (total, transaction) =>
          total +
          Number(transaction.amount),
        0
      )

  const filteredExpenses =
    filteredTransactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .reduce(
        (total, transaction) =>
          total +
          Number(transaction.amount),
        0
      )

  const filteredBalance =
    filteredIncome - filteredExpenses

  const formatCurrency = (
    amount: number
  ) => {
    return `KES ${amount.toLocaleString(
      "en-KE",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`
  }

  const formatDate = (
    date: string | Date
  ) => {
    return new Date(
      date
    ).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatDateTime = (
    date: Date
  ) => {
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // --------------------------------------------------
  // STATEMENT PERIOD
  // --------------------------------------------------

  const statementPeriod = useMemo(() => {
    // If a specific date is selected,
    // represent that exact day.
    if (dateFilter !== "all") {
      const [year, month, day] =
        dateFilter.split("-").map(Number)

      if (year && month && day) {
        const selectedDate = new Date(
          year,
          month - 1,
          day
        )

        return {
          from: selectedDate,
          to: selectedDate,
        }
      }
    }

    // If a specific month is selected,
    // represent the complete month.
    if (monthFilter !== "all") {
      const [year, month] =
        monthFilter
          .split("-")
          .map(Number)

      return {
        from: new Date(
          year,
          month - 1,
          1
        ),

        to: new Date(
          year,
          month,
          0
        ),
      }
    }

    if (
      filteredTransactions.length ===
      0
    ) {
      return null
    }

    const dates =
      filteredTransactions.map(
        (transaction) =>
          new Date(
            transaction.date
          ).getTime()
      )

    return {
      from: new Date(
        Math.min(...dates)
      ),

      to: new Date(
        Math.max(...dates)
      ),
    }
  }, [
    filteredTransactions,
    monthFilter,
    dateFilter,
  ])

  // --------------------------------------------------
  // ACTIVE FILTER SUMMARY
  // --------------------------------------------------

  const activeFilterSummary =
    useMemo(() => {
      const parts: string[] = []

      if (dateFilter !== "all") {
        parts.push(`Date: ${formatDate(dateFilter)}`)
      }

      if (monthFilter !== "all") {
        parts.push(
          `Month: ${formatMonthLabel(
            monthFilter
          )}`
        )
      }

      if (typeFilter !== "all") {
        parts.push(
          typeFilter === "income"
            ? "Income only"
            : "Expenditure only"
        )
      }

      if (vehicleFilter !== "all") {
        const vehicle = getVehicle(
          Number(vehicleFilter)
        )

        parts.push(
          vehicle
            ? `Lorry: ${vehicle.registration_number}`
            : "Filtered by lorry"
        )
      }

      if (search.trim()) {
        parts.push(
          `Search: "${search.trim()}"`
        )
      }

      return parts.length > 0
        ? parts.join(" • ")
        : "All transactions"
    }, [
      dateFilter,
      monthFilter,
      typeFilter,
      vehicleFilter,
      search,
      vehicles,
    ])

  // --------------------------------------------------
  // FORMATTING
  // --------------------------------------------------


  // --------------------------------------------------
  // OPEN DELETE CONFIRMATION
  // --------------------------------------------------

  const openDeleteConfirmation = (
    transaction: Transaction
  ) => {
    setOpenMenuId(null)
    setDeleteTarget(transaction)
  }

  // --------------------------------------------------
  // DELETE TRANSACTION
  // --------------------------------------------------

  const handleDelete = async () => {
    if (!deleteTarget) return

    const transaction =
      deleteTarget

    const token =
      localStorage.getItem("token")

    if (!token) {
      setError(
        "You are not authenticated."
      )

      setDeleteTarget(null)

      return
    }

    setDeletingId(transaction.id)
    setError("")

    try {
      const response = await fetch(
        `${API_URL}/transactions/${transaction.id}/`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Token ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData =
          await response.text()

        console.error(
          "Delete transaction error:",
          errorData
        )

        throw new Error(
          "Failed to delete transaction"
        )
      }

      setTransactions(
        (currentTransactions) =>
          currentTransactions.filter(
            (item) =>
              item.id !==
              transaction.id
          )
      )

      setDeleteTarget(null)
    } catch (error) {
      console.error(error)

      setError(
        "Unable to delete the transaction. Please try again."
      )
    } finally {
      setDeletingId(null)
    }
  }

  // --------------------------------------------------
  // CSV EXPORT
  // --------------------------------------------------

  const exportCSV = () => {
    const now = new Date()

    const headers = [
      "Date",
      "Particulars",
      "Reference",
      "Lorry",
      "Driver",
      "Category",
      "Type",
      "Amount (KES)",
    ]

    const rows =
      filteredTransactions.map(
        (transaction) => {
          const vehicle = getVehicle(
            transaction.vehicle
          )

          return [
            formatDate(
              transaction.date
            ),

            transaction.note || "-",

            `TXN-${String(
              transaction.id
            ).padStart(5, "0")}`,

            vehicle?.registration_number ||
              "-",

            vehicle?.driver_name || "-",

            getCategory(transaction),

            transaction.type ===
            "income"
              ? "Income"
              : "Expenditure",

            Number(
              transaction.amount
            ).toFixed(2),
          ]
        }
      )

    const escapeCell = (
      cell: string
    ) =>
      `"${String(cell).replace(
        /"/g,
        '""'
      )}"`

    const toRow = (
      cells: string[]
    ) =>
      cells
        .map(escapeCell)
        .join(",")

    const blankCells =
      new Array(
        headers.length - 1
      ).fill("")

    const letterhead = [
      [
        `${COMPANY_NAME} — Fleet Accounting Ledger`,
        ...blankCells,
      ],

      [
        `Period: ${
          statementPeriod
            ? `${formatDate(
                statementPeriod.from
              )} – ${formatDate(
                statementPeriod.to
              )}`
            : "-"
        }`,
        ...blankCells,
      ],

      [
        `Filters: ${activeFilterSummary}`,
        ...blankCells,
      ],

      [
        `Generated: ${formatDateTime(
          now
        )}`,
        ...blankCells,
      ],

      new Array(headers.length).fill(""),
    ]

    const summary = [
      new Array(headers.length).fill(""),

      [
        "TOTAL INCOME",
        "",
        "",
        "",
        "",
        "",
        "",
        filteredIncome.toFixed(2),
      ],

      [
        "TOTAL EXPENDITURE",
        "",
        "",
        "",
        "",
        "",
        "",
        filteredExpenses.toFixed(2),
      ],

      [
        "NET BALANCE",
        "",
        "",
        "",
        "",
        "",
        "",
        filteredBalance.toFixed(2),
      ],
    ]

    const csvContent = [
      ...letterhead,
      headers,
      ...rows,
      ...summary,
    ]
      .map(toRow)
      .join("\n")

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    )

    const url =
      URL.createObjectURL(blob)

    const link =
      document.createElement("a")

    link.href = url

    const exportPeriod =
      dateFilter !== "all"
        ? dateFilter
        : monthFilter !== "all"
          ? monthFilter
          : `filtered-${
              now
                .toISOString()
                .split("T")[0]
            }`

    link.download = `${COMPANY_NAME.toLowerCase().replace(
      /\s+/g,
      "-"
    )}-statement-${exportPeriod}.csv`

    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  // --------------------------------------------------
  // PRINT / PDF
  // --------------------------------------------------

  const handlePrint = () => {
    setGeneratedAt(new Date())

    requestAnimationFrame(() => {
      window.print()
    })
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex items-center gap-3 text-zinc-400">
          <Loader2
            size={20}
            className="animate-spin"
          />

          Loading accounting...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="border-b border-zinc-800 bg-zinc-950 print:hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
          {/* BRAND */}

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:border-zinc-700 hover:text-white"
            >
              <ArrowLeft size={20} />
            </Link>

            <div className="min-w-0">
              <h1 className="text-lg font-bold">
                Fan
                <span className="text-[#D98A3D]">
                  A
                </span>
                Na
              </h1>

              <p className="text-xs text-zinc-500">
                Accounting
              </p>
            </div>
          </div>

          {/* QUICK ACTIONS */}

          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <Link
              href="/transactions/add"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 px-2 py-2.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white sm:px-3 sm:text-sm"
            >
              <Plus
                size={16}
                className="shrink-0"
              />

              <span className="truncate">
                <span className="sm:hidden">
                  Add
                </span>

                <span className="hidden sm:inline">
                  Transaction
                </span>
              </span>
            </Link>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 px-2 py-2.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white sm:px-3 sm:text-sm"
            >
              <Printer
                size={16}
                className="shrink-0"
              />

              <span className="truncate">
                <span className="sm:hidden">
                  PDF
                </span>

                <span className="hidden sm:inline">
                  Print / PDF
                </span>
              </span>
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-[#C6752B] px-2 py-2.5 text-xs font-semibold text-white transition hover:bg-[#A85F20] sm:px-4 sm:text-sm"
            >
              <Download
                size={16}
                className="shrink-0"
              />

              <span className="truncate">
                <span className="sm:hidden">
                  CSV
                </span>

                <span className="hidden sm:inline">
                  Export CSV
                </span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================
          SCREEN CONTENT
      ================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-10 print:hidden">
        {/* PAGE TITLE */}

        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-[#D98A3D]">
              Financial Management
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Accounting
            </h2>

            <p className="mt-2 text-zinc-400">
              Track your fleet&apos;s income,
              expenditure and
              profitability.
            </p>
          </div>

          <div className="hidden rounded-xl border border-zinc-800 bg-zinc-900 p-3 md:block">
            <FileText
              size={26}
              className="text-[#D98A3D]"
            />
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>

            <button
              onClick={() =>
                setError("")
              }
              className="ml-auto text-rose-400 transition hover:text-rose-300"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* OVERVIEW TILES */}

        <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {/* TOTAL INCOME */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">
                  Total Income
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-400">
                  {formatCurrency(
                    totalIncome
                  )}
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
              All recorded fleet income
            </p>
          </div>

          {/* TOTAL EXPENDITURE */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">
                  Total Expenditure
                </p>

                <p className="mt-2 text-2xl font-bold text-rose-400">
                  {formatCurrency(
                    totalExpenses
                  )}
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
              All recorded fleet expenses
            </p>
          </div>

          {/* NET PROFIT */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">
                  Net Profit / Loss
                </p>

                <p
                  className={`mt-2 text-2xl font-bold ${
                    netProfit >= 0
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  {formatCurrency(
                    netProfit
                  )}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#C6752B]/10">
                <Wallet
                  size={21}
                  className="text-[#D98A3D]"
                />
              </div>
            </div>

            <p className="mt-3 text-xs text-zinc-500">
              Income minus expenditure
            </p>
          </div>

          {/* TRANSACTIONS */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">
                  Transactions
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {transactions.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-800">
                <Receipt
                  size={21}
                  className="text-zinc-400"
                />
              </div>
            </div>

            <p className="mt-3 text-xs text-zinc-500">
              Recorded financial entries
            </p>
          </div>
        </div>

        {/* ==================================================
            LEDGER
        ================================================== */}

        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          {/* LEDGER HEADER */}

          <div className="border-b border-zinc-800 p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-semibold">
                    General Ledger
                  </h3>

                  {monthFilter !==
                    "all" && (
                    <span className="rounded-full border border-[#C6752B]/30 bg-[#C6752B]/10 px-3 py-1 text-xs font-medium text-[#D98A3D]">
                      {formatMonthLabel(
                        monthFilter
                      )}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-zinc-500">
                  {dateFilter !== "all"
                    ? `Transactions for ${formatDate(dateFilter)}.`
                    : monthFilter !== "all"
                      ? `Transactions for ${formatMonthLabel(monthFilter)}.`
                      : "Complete financial record of your fleet."}
                </p>
              </div>

              {/* FILTERS */}

              <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
                {/* SEARCH */}

                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search transactions..."
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#C6752B] md:w-64"
                  />
                </div>

                {/* DATE / CALENDAR */}

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 focus-within:border-[#C6752B]">
                    <span className="text-xs font-medium text-zinc-500">
                      Date
                    </span>
                    <input
                      type="date"
                      value={
                        dateFilter === "all"
                          ? ""
                          : dateFilter
                      }
                      onChange={(event) =>
                        setDateFilter(
                          event.target.value || "all"
                        )
                      }
                      className="bg-transparent text-sm text-white outline-none [color-scheme:dark]"
                      aria-label="Filter by date"
                      title="Choose a specific date"
                    />
                  </label>

                  {dateFilter !== "all" && (
                    <button
                      type="button"
                      onClick={() =>
                        setDateFilter("all")
                      }
                      className="rounded-lg border border-zinc-700 px-3 py-2.5 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                    >
                      All dates
                    </button>
                  )}
                </div>

                {/* MONTH */}

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 focus-within:border-[#C6752B]">
                    <span className="text-xs font-medium text-zinc-500">
                      Month
                    </span>
                    <input
                      type="month"
                      value={
                        monthFilter === "all"
                          ? ""
                          : monthFilter
                      }
                      onChange={(event) =>
                        setMonthFilter(
                          event.target.value || "all"
                        )
                      }
                      className="bg-transparent text-sm text-white outline-none [color-scheme:dark]"
                      aria-label="Filter by month"
                      title="Choose any month"
                    />
                  </label>

                  {monthFilter !== "all" && (
                    <button
                      type="button"
                      onClick={() =>
                        setMonthFilter("all")
                      }
                      className="rounded-lg border border-zinc-700 px-3 py-2.5 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                    >
                      All months
                    </button>
                  )}
                </div>

                {/* TYPE */}

                <select
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(
                      event.target
                        .value as
                        | "all"
                        | "income"
                        | "expense"
                    )
                  }
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none focus:border-[#C6752B]"
                >
                  <option value="all">
                    All transactions
                  </option>

                  <option value="income">
                    Income
                  </option>

                  <option value="expense">
                    Expenditure
                  </option>
                </select>

                {/* VEHICLE */}

                <select
                  value={vehicleFilter}
                  onChange={(event) =>
                    setVehicleFilter(
                      event.target.value
                    )
                  }
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none focus:border-[#C6752B]"
                >
                  <option value="all">
                    All lorries
                  </option>

                  {vehicles.map(
                    (vehicle) => (
                      <option
                        key={vehicle.id}
                        value={
                          vehicle.id
                        }
                      >
                        {
                          vehicle.registration_number
                        }
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* TABLE */}

          {filteredTransactions.length ===
          0 ? (
            <div className="p-12 text-center">
              <Receipt
                size={40}
                className="mx-auto text-zinc-600"
              />

              <h4 className="mt-4 font-semibold">
                No transactions found
              </h4>

              <p className="mt-2 text-sm text-zinc-500">
                There are no accounting
                entries matching your
                filters.
              </p>

              <Link
                href="/transactions/add"
                className="mx-auto mt-6 inline-flex items-center gap-2 rounded-lg bg-[#C6752B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#A85F20]"
              >
                <Plus size={17} />
                Add Transaction
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-left">
                <thead className="border-b border-zinc-800 bg-zinc-950/50">
                  <tr className="text-xs uppercase tracking-wide text-zinc-500">
                    <th className="px-6 py-4 font-medium">
                      Date
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Particulars
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Reference
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Lorry
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Category
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Type
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
                  {filteredTransactions.map(
                    (transaction) => {
                      const vehicle =
                        getVehicle(
                          transaction.vehicle
                        )

                      const isMenuOpen =
                        openMenuId ===
                        transaction.id

                      const isDeleting =
                        deletingId ===
                        transaction.id

                      return (
                        <tr
                          key={
                            transaction.id
                          }
                          className="border-b border-zinc-800 last:border-0 transition hover:bg-zinc-800/30"
                        >
                          {/* DATE */}

                          <td className="whitespace-nowrap px-6 py-5 text-sm text-zinc-400">
                            {formatDate(
                              transaction.date
                            )}
                          </td>

                          {/* PARTICULARS */}

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              {transaction.type ===
                              "income" ? (
                                <ArrowUpCircle
                                  size={18}
                                  className="text-emerald-400"
                                />
                              ) : (
                                <ArrowDownCircle
                                  size={18}
                                  className="text-rose-400"
                                />
                              )}

                              <div>
                                <p className="text-sm font-medium text-white">
                                  {transaction.note ||
                                    "No description"}
                                </p>

                                <p className="mt-1 text-xs text-zinc-600">
                                  Fleet financial
                                  transaction
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* REFERENCE */}

                          <td className="px-6 py-5">
                            <span className="rounded-md bg-zinc-800 px-2.5 py-1 font-mono text-xs text-zinc-400">
                              TXN-
                              {String(
                                transaction.id
                              ).padStart(
                                5,
                                "0"
                              )}
                            </span>
                          </td>

                          {/* LORRY */}

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <Truck
                                size={16}
                                className="text-zinc-500"
                              />

                              <div>
                                <p className="text-sm font-medium">
                                  {vehicle?.registration_number ||
                                    "Unknown"}
                                </p>

                                {vehicle?.driver_name && (
                                  <p className="text-xs text-zinc-600">
                                    {
                                      vehicle.driver_name
                                    }
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* CATEGORY */}

                          <td className="px-6 py-5">
                            <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300">
                              {getCategory(
                                transaction
                              )}
                            </span>
                          </td>

                          {/* TYPE */}

                          <td className="px-6 py-5">
                            {transaction.type ===
                            "income" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                                <ArrowUpCircle
                                  size={14}
                                />
                                Income
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-400">
                                <ArrowDownCircle
                                  size={14}
                                />
                                Expenditure
                              </span>
                            )}
                          </td>

                          {/* AMOUNT */}

                          <td
                            className={`whitespace-nowrap px-6 py-5 text-right text-sm font-bold ${
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
                            {formatCurrency(
                              Number(
                                transaction.amount
                              )
                            )}
                          </td>

                          {/* ACTION MENU */}

                          <td className="px-6 py-5 text-right">
                            <div
                              className="relative inline-block"
                              ref={
                                isMenuOpen
                                  ? menuRef
                                  : null
                              }
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenMenuId(
                                    isMenuOpen
                                      ? null
                                      : transaction.id
                                  )
                                }
                                disabled={
                                  isDeleting
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-400 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                title="Transaction options"
                              >
                                {isDeleting ? (
                                  <Loader2
                                    size={17}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <MoreVertical
                                    size={18}
                                  />
                                )}
                              </button>

                              {isMenuOpen && (
                                <div className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 p-1.5 text-left shadow-2xl shadow-black/40">
                                  {/* EDIT */}

                                  <Link
                                    href={`/transactions/${transaction.id}/edit`}
                                    onClick={() =>
                                      setOpenMenuId(
                                        null
                                      )
                                    }
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                                  >
                                    <Pencil
                                      size={16}
                                      className="text-[#D98A3D]"
                                    />

                                    <span>
                                      Edit transaction
                                    </span>
                                  </Link>

                                  {/* DELETE */}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openDeleteConfirmation(
                                        transaction
                                      )
                                    }
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-rose-500/10 hover:text-rose-400"
                                  >
                                    <Trash2
                                      size={16}
                                      className="text-rose-400"
                                    />

                                    <span>
                                      Delete transaction
                                    </span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    }
                  )}
                </tbody>

                {/* LEDGER TOTALS */}

                <tfoot className="border-t-2 border-zinc-700 bg-zinc-950">
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-right text-sm font-semibold text-zinc-400"
                    >
                      Total Income
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-bold text-emerald-400">
                      {formatCurrency(
                        filteredIncome
                      )}
                    </td>

                    <td />
                  </tr>

                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-right text-sm font-semibold text-zinc-400"
                    >
                      Total Expenditure
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-bold text-rose-400">
                      {formatCurrency(
                        filteredExpenses
                      )}
                    </td>

                    <td />
                  </tr>

                  <tr className="border-t border-zinc-800">
                    <td
                      colSpan={6}
                      className="px-6 py-5 text-right text-base font-bold text-white"
                    >
                      Ledger Balance
                    </td>

                    <td
                      className={`px-6 py-5 text-right text-base font-bold ${
                        filteredBalance >=
                        0
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {formatCurrency(
                        filteredBalance
                      )}
                    </td>

                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* LEDGER FOOTNOTE */}

        {filteredTransactions.length >
          0 && (
          <div className="mt-4 flex items-center justify-between text-xs text-zinc-600">
            <span>
              Showing{" "}
              {filteredTransactions.length}{" "}
              of {transactions.length}{" "}
              transactions
            </span>

            {(search ||
              typeFilter !== "all" ||
              vehicleFilter !== "all" ||
              monthFilter !== "all" ||
              dateFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("")
                  setTypeFilter("all")
                  setVehicleFilter(
                    "all"
                  )
                  setMonthFilter("all")
                  setDateFilter("all")
                }}
                className="text-[#D98A3D] transition hover:text-[#E8A85C]"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </section>

      {/* ==================================================
          CUSTOM DELETE CONFIRMATION MODAL
      ================================================== */}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              if (
                deletingId === null
              ) {
                setDeleteTarget(null)
              }
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/60"
          >
            {/* TOP ACCENT */}

            <div className="h-1 bg-gradient-to-r from-rose-600 via-rose-500 to-[#D98A3D]" />

            <div className="p-6">
              {/* HEADER */}

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10">
                  <Trash2
                    size={22}
                    className="text-rose-400"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3
                    id="delete-dialog-title"
                    className="text-lg font-semibold text-white"
                  >
                    Delete transaction?
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-zinc-400">
                    This transaction will
                    be permanently removed
                    from your accounting
                    records.
                  </p>
                </div>

                {/* CLOSE */}

                <button
                  type="button"
                  onClick={() => {
                    if (
                      deletingId === null
                    ) {
                      setDeleteTarget(null)
                    }
                  }}
                  disabled={
                    deletingId !== null
                  }
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* TRANSACTION PREVIEW */}

              <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-zinc-500">
                      TXN-
                      {String(
                        deleteTarget.id
                      ).padStart(5, "0")}
                    </p>

                    <p className="mt-1 truncate text-sm font-medium text-white">
                      {deleteTarget.note ||
                        "No description"}
                    </p>
                  </div>

                  <p
                    className={`shrink-0 text-sm font-bold ${
                      deleteTarget.type ===
                      "income"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {deleteTarget.type ===
                    "income"
                      ? "+"
                      : "-"}{" "}
                    {formatCurrency(
                      Number(
                        deleteTarget.amount
                      )
                    )}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-3 text-xs">
                  <span className="text-zinc-600">
                    {formatDate(
                      deleteTarget.date
                    )}
                  </span>

                  <span
                    className={
                      deleteTarget.type ===
                      "income"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }
                  >
                    {deleteTarget.type ===
                    "income"
                      ? "Income"
                      : "Expenditure"}
                  </span>
                </div>
              </div>

              {/* WARNING */}

              <div className="mt-4 flex gap-3 rounded-xl border border-amber-500/10 bg-amber-500/5 p-3.5">
                <AlertTriangle
                  size={17}
                  className="mt-0.5 shrink-0 text-amber-400"
                />

                <p className="text-xs leading-5 text-zinc-500">
                  Deleting this entry will
                  also remove it from your
                  accounting totals and
                  reports.
                  <span className="font-medium text-zinc-300">
                    {" "}
                    This action cannot be
                    undone.
                  </span>
                </p>
              </div>

              {/* ACTIONS */}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget(null)
                  }
                  disabled={
                    deletingId !== null
                  }
                  className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={
                    deletingId ===
                    deleteTarget.id
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingId ===
                  deleteTarget.id ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />

                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />

                      Delete transaction
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          PRINTABLE STATEMENT
      ================================================== */}

      <section className="statement hidden print:block">
        <div className="statement-header">
          <div className="statement-brand">
            <div className="statement-mark">
              FF
            </div>

            <div>
              <p className="statement-company">
                {COMPANY_NAME}
              </p>

              <p className="statement-tagline">
                Fleet Accounting Statement
              </p>
            </div>
          </div>

          <div className="statement-meta">
            <p>
              <span>Period</span>

              {statementPeriod
                ? `${formatDate(
                    statementPeriod.from
                  )} – ${formatDate(
                    statementPeriod.to
                  )}`
                : "—"}
            </p>

            <p>
              <span>Filters</span>
              {activeFilterSummary}
            </p>

            <p>
              <span>Generated</span>

              {formatDateTime(
                generatedAt ??
                  new Date()
              )}
            </p>
          </div>
        </div>

        <div className="statement-summary">
          <div>
            <p className="label">
              Total Income
            </p>

            <p className="value income">
              {formatCurrency(
                filteredIncome
              )}
            </p>
          </div>

          <div>
            <p className="label">
              Total Expenditure
            </p>

            <p className="value expense">
              {formatCurrency(
                filteredExpenses
              )}
            </p>
          </div>

          <div>
            <p className="label">
              Net Balance
            </p>

            <p
              className={`value ${
                filteredBalance >= 0
                  ? "income"
                  : "expense"
              }`}
            >
              {formatCurrency(
                filteredBalance
              )}
            </p>
          </div>
        </div>

        <table className="statement-table">
          <thead>
            <tr>
              <th>Date</th>

              <th>Particulars</th>

              <th>Reference</th>

              <th>Lorry</th>

              <th>Category</th>

              <th>Type</th>

              <th className="align-right">
                Amount (KES)
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.map(
              (transaction) => {
                const vehicle =
                  getVehicle(
                    transaction.vehicle
                  )

                return (
                  <tr
                    key={
                      transaction.id
                    }
                  >
                    <td>
                      {formatDate(
                        transaction.date
                      )}
                    </td>

                    <td>
                      {transaction.note ||
                        "No description"}
                    </td>

                    <td className="mono">
                      TXN-
                      {String(
                        transaction.id
                      ).padStart(5, "0")}
                    </td>

                    <td>
                      {vehicle?.registration_number ||
                        "Unknown"}

                      {vehicle?.driver_name && (
                        <span className="statement-subtext">
                          {
                            vehicle.driver_name
                          }
                        </span>
                      )}
                    </td>

                    <td>
                      {getCategory(
                        transaction
                      )}
                    </td>

                    <td>
                      {transaction.type ===
                      "income"
                        ? "Income"
                        : "Expenditure"}
                    </td>

                    <td
                      className={`align-right amount ${
                        transaction.type ===
                        "income"
                          ? "income"
                          : "expense"
                      }`}
                    >
                      {transaction.type ===
                      "income"
                        ? "+"
                        : "-"}

                      {formatCurrency(
                        Number(
                          transaction.amount
                        )
                      ).replace(
                        "KES ",
                        ""
                      )}
                    </td>
                  </tr>
                )
              }
            )}
          </tbody>

          <tfoot>
            <tr>
              <td colSpan={6}>
                Total Income
              </td>

              <td className="align-right amount income">
                {formatCurrency(
                  filteredIncome
                )}
              </td>
            </tr>

            <tr>
              <td colSpan={6}>
                Total Expenditure
              </td>

              <td className="align-right amount expense">
                {formatCurrency(
                  filteredExpenses
                )}
              </td>
            </tr>

            <tr className="statement-balance-row">
              <td colSpan={6}>
                Net Balance
              </td>

              <td
                className={`align-right amount ${
                  filteredBalance >= 0
                    ? "income"
                    : "expense"
                }`}
              >
                {formatCurrency(
                  filteredBalance
                )}
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="statement-footer">
          <p>
            This is a system-generated
            statement from{" "}
            {COMPANY_NAME}&apos;s fleet
            management platform and
            requires no signature.
          </p>
        </div>
      </section>

      {/* ==================================================
          PRINT STYLES
      ================================================== */}

      <style jsx global>{`
        :root {
          --paper: #fbfaf7;
          --ink: #201c18;
          --ink-muted: #7a7267;
          --hairline: #e6e1d8;
          --copper: #b5661f;
          --copper-deep: #7a4a18;
          --income: #2f7d5c;
          --expense: #a8442f;
        }

        .statement {
          color: var(--ink);
          font-family: "Georgia",
            "Times New Roman", serif;
        }

        @media print {
          @page {
            size: A4;
            margin: 16mm 14mm;
          }

          html,
          body {
            background: var(--paper) !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          .print\\:block {
            display: block !important;
          }

          .statement {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .statement-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            border-bottom: 1px solid
              var(--copper);
            padding-bottom: 16px;
            margin-bottom: 22px;
          }

          .statement-brand {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .statement-mark {
            width: 42px;
            height: 42px;
            border-radius: 8px;
            background: var(
              --copper-deep
            );
            color: var(--paper);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
            font-weight: 700;
            font-size: 15px;
            letter-spacing: 0.5px;
          }

          .statement-company {
            font-size: 19px;
            font-weight: 700;
            letter-spacing: 0.2px;
            color: var(--ink);
          }

          .statement-tagline {
            font-family: Arial,
              sans-serif;
            font-size: 11px;
            color: var(--ink-muted);
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-top: 2px;
          }

          .statement-meta {
            font-family: Arial,
              sans-serif;
            font-size: 11px;
            color: var(--ink);
            text-align: right;
            line-height: 1.7;
          }

          .statement-meta span {
            display: inline-block;
            min-width: 56px;
            color: var(--ink-muted);
            text-transform: uppercase;
            font-size: 9px;
            letter-spacing: 0.6px;
            margin-right: 6px;
          }

          .statement-summary {
            display: flex;
            gap: 28px;
            margin-bottom: 26px;
          }

          .statement-summary > div {
            flex: 1;
          }

          .statement-summary .label {
            font-family: Arial,
              sans-serif;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: var(--ink-muted);
            margin-bottom: 5px;
          }

          .statement-summary .value {
            font-family: Arial,
              sans-serif;
            font-size: 17px;
            font-weight: 700;
          }

          .value.income,
          .amount.income {
            color: var(--income);
          }

          .value.expense,
          .amount.expense {
            color: var(--expense);
          }

          .statement-table {
            width: 100%;
            border-collapse: collapse;
            font-family: Arial,
              sans-serif;
            font-size: 10.5px;
          }

          .statement-table thead th {
            text-align: left;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 9px;
            color: var(--ink-muted);
            background: transparent;
            padding: 0 8px 9px;
            border-bottom: 1px solid
              var(--copper);
            font-weight: 700;
          }

          .statement-table tbody td {
            padding: 9px 8px;
            border-bottom: 1px solid
              var(--hairline);
            vertical-align: top;
            color: var(--ink);
          }

          .statement-subtext {
            display: block;
            font-size: 9px;
            color: var(--ink-muted);
          }

          .align-right {
            text-align: right;
          }

          .mono {
            font-family: "Courier New",
              monospace;
            font-size: 9.5px;
            color: var(--ink-muted);
          }

          .amount {
            font-weight: 700;
            white-space: nowrap;
          }

          .statement-table tfoot td {
            border-bottom: none;
            border-top: none;
            padding: 8px 8px;
            font-weight: 600;
            color: var(--ink);
          }

          .statement-balance-row td {
            border-top: 1px solid
              var(--copper);
            font-size: 12.5px;
            font-weight: 700;
            padding-top: 12px;
          }

          .statement-table tr {
            page-break-inside: avoid;
          }

          .statement-table thead {
            display: table-header-group;
          }

          .statement-footer {
            margin-top: 22px;
            padding-top: 12px;
            border-top: 1px solid
              var(--hairline);
            font-family: Arial,
              sans-serif;
            font-size: 9px;
            color: var(--ink-muted);
            text-align: center;
          }
        }
      `}</style>
    </main>
  )
}