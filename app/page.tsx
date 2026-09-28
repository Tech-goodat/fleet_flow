import React from 'react'
import Link from 'next/link'

const Home = () => {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      {/* Navbar */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="text-2xl font-bold tracking-tight">
          Fan<span className="text-[#D98A3D]">A</span>Na
        </div>

        <Link href="/auth/login" className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200">
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <section className="mx-auto flex min-h-[75vh] max-w-7xl items-center px-6">
        <div className="max-w-3xl">

          <span className="inline-block rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-400">
            Simple fleet management
          </span>

          <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Run your fleet.
            <br />
            <span className="text-[#D98A3D]">
              Know your numbers.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Manage your lorries, track their performance, record income and
            expenses, and know exactly where your money is going.
          </p>

          <div className="mt-8 flex gap-4">
            <Link href="/auth/login" className="rounded-lg bg-[#C6752B] px-6 py-3 font-semibold transition hover:bg-[#A85F20]">
              Get started
            </Link>

            <button className="rounded-lg border border-zinc-700 px-6 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-900">
              Learn more
            </button>
          </div>

        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-800 bg-zinc-900/40">
        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#D98A3D]">
              Built for fleet owners
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Everything you need to manage your fleet.
            </h2>

            <p className="mt-4 text-zinc-400">
              Replace notebooks, spreadsheets, and manual calculations with
              one simple system.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-lg font-semibold">
                Fleet overview
              </h3>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                See every lorry, its current status, and financial performance
                from one dashboard.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-lg font-semibold">
                Track transactions
              </h3>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Record delivery income, fuel, tolls, repairs, and other
                expenses in seconds.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-lg font-semibold">
                Automatic calculations
              </h3>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Let the system calculate balances and profit automatically
                as transactions are added.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-zinc-500">
          © {new Date().getFullYear()} FanANa. All rights reserved.
        </div>
      </footer>

    </main>
  )
}

export default Home