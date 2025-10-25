"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { getAllEmployees } from "../utils/dbActions";

const FileUpload = dynamic(() => import("../components/FileUpload"), {
  ssr: false
});
const EmployeeTable = dynamic(() => import("../components/EmployeeTable"), {
  ssr: false
});
const DivisionSummary = dynamic(() => import("../components/DivisionSummary"), {
  ssr: false
});
const HQSummary = dynamic(() => import("../components/HQSummary"), {
  ssr: false
});

export default function Page() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<number>(0);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const employees = await getAllEmployees();
      setRows(employees);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleFileSync = async (newRows: any[]) => {
    setRows(newRows);
  };

  const handleRowsChange = async (newRows: any[]) => {
    setRows(newRows);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Modern Clean */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-full px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Vacancy Management System
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Employee and vacancy tracking dashboard
              </p>
            </div>
            <div className="flex items-center gap-4">
              <FileUpload onSynced={handleFileSync} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full px-6 py-6">
        <TabView
          activeIndex={activeTab}
          onTabChange={(e) => setActiveTab(e.index)}
          className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
        >
          <TabPanel
            header="📊 Division-wise Data"
            leftIcon="pi pi-chart-bar mr-2"
          >
            <div className="p-6">
              <DivisionSummary data={rows} loading={loading} />
            </div>
          </TabPanel>

          <TabPanel
            header="🏢 HQ-wise Data"
            leftIcon="pi pi-building mr-2"
          >
            <div className="p-6">
              <HQSummary data={rows} loading={loading} />
            </div>
          </TabPanel>

          <TabPanel
            header="📝 Full Employee Data"
            leftIcon="pi pi-table mr-2"
          >
            <div className="p-6">
              <EmployeeTable
                loading={loading}
                rows={rows}
                onChangeRows={handleRowsChange}
              />
            </div>
          </TabPanel>
        </TabView>
      </main>
    </div>
  );
}


