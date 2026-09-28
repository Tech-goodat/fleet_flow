import React from 'react'
import Link from 'next/link'

const Home = () => {
  return (
    <main className="min-h-screen bg-[#F5F6F8] text-[#25282D]">

      {/* Navbar */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">

        <Link
          href="/"
          className="text-2xl font-bold tracking-tight"
        >
          Fleet<span className="text-[#EF4B4B]">Flow</span>
        </Link>

        <Link
          href="/auth/login"
          className="rounded-lg bg-[#EF4B4B] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D93B3B]"
        >
          Sign in
        </Link>

      </nav>

      {/* Hero */}
      <section className="mx-auto flex min-h-[75vh] max-w-7xl items-center px-6 py-16">

        <div className="max-w-3xl">

          <span className="inline-flex items-center gap-2 rounded-full border border-[#F4CACA] bg-white px-4 py-2 text-sm font-medium text-[#EF4B4B]">
            <span className="h-2 w-2 rounded-full bg-[#EF4B4B]" />
            Smart fleet management
          </span>

          <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Run your fleet.
            <br />
            <span className="text-[#EF4B4B]">
              Know your numbers.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#737780]">
            Manage your lorries, track their performance, record income
            and expenses, and know exactly where your money is going.
            All from one simple dashboard.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">

            <Link
              href="/auth/login"
              className="rounded-lg bg-[#EF4B4B] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#D93B3B]"
            >
              Get started
            </Link>

            <Link
              href="#features"
              className="rounded-lg border border-[#E1E3E7] bg-white px-6 py-3 font-semibold text-[#35383E] transition hover:border-[#EF4B4B] hover:text-[#EF4B4B]"
            >
              Learn more
            </Link>

          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 text-sm text-[#737780]">

            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FDE8E8] text-xs text-[#EF4B4B]">
                ✓
              </span>
              Simple fleet tracking
            </div>

            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FDE8E8] text-xs text-[#EF4B4B]">
                ✓
              </span>
              Real-time financial insights
            </div>

          </div>

        </div>

      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t border-[#E8E9ED] bg-white"
      >
        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="max-w-2xl">

            <p className="text-sm font-semibold uppercase tracking-wider text-[#EF4B4B]">
              Built for fleet owners
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to manage your fleet.
            </h2>

            <p className="mt-4 leading-7 text-[#737780]">
              Replace notebooks, spreadsheets, and manual calculations
              with one simple system designed to keep your operations
              organized and your finances clear.
            </p>

          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            {/* Feature 1 */}
            <div className="rounded-xl border border-[#E8E9ED] bg-[#FFFFFF] p-6 transition hover:-translate-y-1 hover:border-[#F2B7B7] hover:shadow-lg hover:shadow-[#EF4B4B]/5">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FDE8E8] text-[#EF4B4B]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13h2l2-6 4 12 3-9 2 3h5"
                  />
                </svg>
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                Fleet overview
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#737780]">
                See every lorry, its current status, and financial
                performance from one centralized dashboard.
              </p>

            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-[#E8E9ED] bg-white p-6 transition hover:-translate-y-1 hover:border-[#F2B7B7] hover:shadow-lg hover:shadow-[#EF4B4B]/5">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FDE8E8] text-[#EF4B4B]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 9h10M7 13h4m-4 3h7"
                  />
                </svg>
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                Track transactions
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#737780]">
                Record delivery income, fuel, tolls, repairs, and
                other operating expenses with ease.
              </p>

            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border border-[#E8E9ED] bg-white p-6 transition hover:-translate-y-1 hover:border-[#F2B7B7] hover:shadow-lg hover:shadow-[#EF4B4B]/5">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FDE8E8] text-[#EF4B4B]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v18m5-14H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                  />
                </svg>
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                Automatic calculations
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#737780]">
                Keep track of balances, revenue, expenses, and
                profitability as transactions are recorded.
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* Call to action */}
      <section className="bg-white px-6 pb-20">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-2xl bg-[#EF4B4B] px-8 py-10 text-white sm:flex-row sm:items-center sm:px-12">

          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Take control of your fleet.
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/85">
              Spend less time on paperwork and more time growing
              your logistics business.
            </p>
          </div>

          <Link
            href="/auth/login"
            className="inline-flex shrink-0 items-center gap-3 rounded-lg bg-white px-5 py-3 font-semibold text-[#EF4B4B] transition hover:bg-[#FFF1F1]"
          >
            Get started
            <span aria-hidden="true">→</span>
          </Link>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8E9ED] bg-[#F5F6F8]">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">

          <Link
            href="/"
            className="text-lg font-bold tracking-tight"
          >
            Fleet<span className="text-[#EF4B4B]">Flow</span>
          </Link>

          <p className="text-sm text-[#737780]">
            © {new Date().getFullYear()} FleetFlow. All rights reserved.
          </p>

        </div>

      </footer>

    </main>
  )
}

export default Home