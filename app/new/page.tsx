"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Truck } from "lucide-react";

const API_URL = "https://fleet-backend-np49.onrender.com/api/vehicles";

const statusOptions = [
  { value: "idle", label: "Idle" },
  { value: "loading", label: "Loading" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "returning", label: "Returning" },
];

interface VehicleFormData {
  registration_number: string;
  driver_name: string;
  cargo_type: string;
  destination: string;
  current_location: string;
  mileage: string;
  fuel_level: string;
  status: string;
}

export default function AddVehicleForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<VehicleFormData>({
    registration_number: "",
    driver_name: "",
    cargo_type: "",
    destination: "",
    current_location: "",
    mileage: "",
    fuel_level: "",
    status: "idle",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const fuel = Number(formData.fuel_level);
    const mileage = Number(formData.mileage);

    if (fuel < 0 || fuel > 100) {
      setError("Fuel level must be between 0 and 100.");
      setLoading(false);
      return;
    }

    if (mileage < 0) {
      setError("Mileage cannot be negative.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not authenticated.");
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          registration_number: formData.registration_number.trim(),
          driver_name: formData.driver_name.trim(),
          cargo_type: formData.cargo_type.trim(),
          destination: formData.destination.trim(),
          current_location: formData.current_location.trim(),
          mileage: Number(formData.mileage),
          fuel_level: Number(formData.fuel_level),
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.registration_number?.[0] ||
            data.driver_name?.[0] ||
            data.cargo_type?.[0] ||
            data.destination?.[0] ||
            data.current_location?.[0] ||
            data.mileage?.[0] ||
            data.fuel_level?.[0] ||
            data.status?.[0] ||
            "Failed to add vehicle."
        );
      }

      // Vehicle successfully created.
      // Send the user back to the dashboard.
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );

      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">

      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C6752B] text-white">
              <Truck size={21} />
            </div>

            <div>
              <h1 className="text-lg font-bold text-zinc-900">
                Fan<span className="text-[#A8571E]">A</span>Na
              </h1>

              <p className="text-xs text-zinc-500">
                Fleet management
              </p>
            </div>
          </div>

          {/* Dashboard link */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>

        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-6 py-10">

        {/* Page heading */}
        <div className="mb-8">

          <p className="text-sm font-semibold text-[#A8571E]">
            Fleet management
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
            Add New Lorry
          </h2>

          <p className="mt-2 text-zinc-500">
            Enter the details of the lorry you want to add to your fleet.
          </p>

        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* Registration */}
              <div>
                <label
                  htmlFor="registration_number"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Registration Number
                </label>

                <input
                  id="registration_number"
                  name="registration_number"
                  type="text"
                  placeholder="KDA 123A"
                  value={formData.registration_number}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-[#C6752B] focus:ring-2 focus:ring-[#C6752B]/15"
                />
              </div>

              {/* Driver */}
              <div>
                <label
                  htmlFor="driver_name"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Driver Name
                </label>

                <input
                  id="driver_name"
                  name="driver_name"
                  type="text"
                  placeholder="John Kiptoo"
                  value={formData.driver_name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-[#C6752B] focus:ring-2 focus:ring-[#C6752B]/15"
                />
              </div>

              {/* Cargo */}
              <div>
                <label
                  htmlFor="cargo_type"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Cargo Type
                </label>

                <input
                  id="cargo_type"
                  name="cargo_type"
                  type="text"
                  placeholder="Cement"
                  value={formData.cargo_type}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-[#C6752B] focus:ring-2 focus:ring-[#C6752B]/15"
                />
              </div>

              {/* Destination */}
              <div>
                <label
                  htmlFor="destination"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Destination
                </label>

                <input
                  id="destination"
                  name="destination"
                  type="text"
                  placeholder="Mombasa"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-[#C6752B] focus:ring-2 focus:ring-[#C6752B]/15"
                />
              </div>

              {/* Current Location */}
              <div>
                <label
                  htmlFor="current_location"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Current Location
                </label>

                <input
                  id="current_location"
                  name="current_location"
                  type="text"
                  placeholder="Nairobi"
                  value={formData.current_location}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-[#C6752B] focus:ring-2 focus:ring-[#C6752B]/15"
                />
              </div>

              {/* Mileage */}
              <div>
                <label
                  htmlFor="mileage"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Mileage (km)
                </label>

                <input
                  id="mileage"
                  name="mileage"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="125430.50"
                  value={formData.mileage}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-[#C6752B] focus:ring-2 focus:ring-[#C6752B]/15"
                />
              </div>

              {/* Fuel */}
              <div>
                <label
                  htmlFor="fuel_level"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Fuel Level (%)
                </label>

                <input
                  id="fuel_level"
                  name="fuel_level"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="75"
                  value={formData.fuel_level}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-[#C6752B] focus:ring-2 focus:ring-[#C6752B]/15"
                />
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-[#C6752B] focus:ring-2 focus:ring-[#C6752B]/15"
                >
                  {statusOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-zinc-200" />

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <Link
                href="/dashboard"
                className="flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#C6752B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#A85F20] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={17} />

                {loading ? "Adding Lorry..." : "Add Lorry"}
              </button>

            </div>

          </form>

        </div>

      </section>

    </main>
  );
}