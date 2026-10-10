/* eslint-disable @next/next/no-img-element */

"use client";

// import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

import GlobalLoading from "@/components/GlobalLoading";
import { StatCard } from "@/components/StatCard";
import { Columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";

import { PatientModal } from "../../components/PatientModal";

const AdminPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  );
  const [appointments, setAppointments] = useState<any>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      const data = await getRecentAppointmentList();
      setAppointments(data);
    };

    fetchAppointments();
  }, []);

  const openModal = (patientId: string) => {
    setSelectedPatientId(patientId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPatientId(null);
  };

  if (!appointments) {
    return <GlobalLoading text="Loading appointments..." />;
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-10 px-4 py-6 md:px-8">
      <header className="admin-header !mx-0 !py-4 shadow-xl border border-dark-400/50 backdrop-blur-md bg-dark-200/90">
        <Link href="/" className="cursor-pointer">
          <img
            src="/assets/icons/logo-full.svg"
            width={160}
            height={36}
            alt="CarePulse Logo"
            className="h-8 w-fit"
            loading="eager"
            decoding="async"
          />
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Operations Active
          </span>
          <p className="text-14-medium text-dark-600 sm:text-16-semibold sm:text-dark-700">
            Admin Console
          </p>
        </div>
      </header>

      <main className="admin-main !px-0">
        <section className="w-full space-y-2">
          <h1 className="header !text-white text-32-bold tracking-tight">
            Welcome back 👋
          </h1>
          <p className="text-14-regular text-dark-600 md:text-16-regular">
            Manage real-time clinical schedules, patient consultations, and physician availability.
          </p>
        </section>

        <section className="admin-stat text-dark-700">
          <StatCard
            type="appointments"
            count={appointments.scheduledCount}
            label="Scheduled appointments"
            icon={"/assets/icons/appointments.svg"}
          />
          <StatCard
            type="pending"
            count={appointments.pendingCount}
            label="Pending appointments"
            icon={"/assets/icons/pending.svg"}
          />
          <StatCard
            type="cancelled"
            count={appointments.cancelledCount}
            label="Cancelled appointments"
            icon={"/assets/icons/cancelled.svg"}
          />
        </section>

        <DataTable
          columns={Columns({
            openModal,
            isModalOpen,
            selectedPatientId,
            closeModal,
          })}
          data={appointments.documents}
        />
      </main>

      {isModalOpen && (
        <PatientModal patientId={selectedPatientId} closeModal={closeModal} />
      )}
    </div>
  );
};

export default AdminPage;
