"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { EmployeeRow } from "../utils/dbActions";

export default function HQSummary({
  data,
  loading
}: {
  data: EmployeeRow[];
  loading: boolean;
}) {
  // Get unique HQs for stats
  const hqs = [...new Set(data.map(d => d.hq))].filter(Boolean);
  const totalEmployees = data.length;
  const totalVacant = data.filter(d => d.vacancy && d.vacancy.trim() !== "").length;

  return (
    <div className="space-y-5">
      {/* Stats Cards - Modern Minimal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Headquarters</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{hqs.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Employees</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{totalEmployees}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vacancies</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{totalVacant}</div>
        </div>
      </div>

      {/* HQ-wise Table - Clean Modern Design */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">HQ-wise View</h2>
          <p className="text-sm text-gray-500 mt-1">Employees grouped by headquarters</p>
        </div>
        <div className="p-6">
          <DataTable
            value={data}
            loading={loading}
            scrollable
            scrollHeight="calc(100vh - 360px)"
            paginator
            rows={50}
            rowsPerPageOptions={[25, 50, 100, 200]}
            className="modern-table"
            sortField="hq"
            sortOrder={1}
            rowGroupMode="rowspan"
            groupRowsBy="hq"
            rowHover
          >
            <Column
              field="hq"
              header="HQ"
              sortable
              filter
              filterPlaceholder="Filter"
              style={{ minWidth: "140px" }}
              bodyClassName="font-semibold text-gray-900"
            />
            <Column
              field="division"
              header="Division"
              sortable
              filter
              filterPlaceholder="Filter"
              style={{ minWidth: "160px" }}
              bodyClassName="text-gray-700"
            />
            <Column
              field="emp_code"
              header="Code"
              sortable
              style={{ minWidth: "100px" }}
              bodyClassName="font-mono text-xs text-gray-600"
            />
            <Column
              field="name"
              header="Employee Name"
              sortable
              filter
              filterPlaceholder="Filter"
              style={{ minWidth: "180px" }}
              bodyClassName="font-medium text-gray-900"
            />
            <Column
              field="designation"
              header="Designation"
              sortable
              style={{ minWidth: "120px" }}
              bodyClassName="text-gray-700"
            />
            <Column
              field="resigned_date"
              header="Resigned"
              sortable
              style={{ minWidth: "110px" }}
              bodyClassName="text-gray-600 text-sm"
              body={(row) => row.resigned_date || <span className="text-gray-400">-</span>}
            />
            <Column
              field="vacancy"
              header="Vacancy Period"
              sortable
              style={{ minWidth: "140px" }}
              bodyClassName="text-gray-700 text-sm"
            />
            <Column
              field="remarks"
              header="Remarks"
              style={{ minWidth: "160px" }}
              bodyClassName="text-gray-600 text-sm"
            />
          </DataTable>
        </div>
      </div>
    </div>
  );
}

