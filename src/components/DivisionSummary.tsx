"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import * as XLSX from "xlsx";
import { EmployeeRow } from "../utils/dbActions";

export default function DivisionSummary({
  data,
  loading
}: {
  data: EmployeeRow[];
  loading: boolean;
}) {
  // Get unique divisions for stats
  const divisions = [...new Set(data.map(d => d.division))].filter(Boolean);
  const totalEmployees = data.length;
  const totalVacant = data.filter(d => d.vacancy && d.vacancy.trim() !== "").length;

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Division-wise Data");
    XLSX.writeFile(wb, `Division-wise-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-5">
      {/* Stats Cards - Modern Minimal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Divisions</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{divisions.length}</div>
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

      {/* Division-wise Table - Clean Modern Design */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Division-wise View</h2>
            <p className="text-sm text-gray-500 mt-1">Employees grouped by division</p>
          </div>
          <Button
            label="Download Excel"
            icon="pi pi-download"
            onClick={exportToExcel}
            size="small"
            outlined
          />
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
            sortField="division"
            sortOrder={1}
            rowGroupMode="rowspan"
            groupRowsBy="division"
            rowHover
          >
            <Column
              field="division"
              header="Division"
              sortable
              filter
              filterPlaceholder="Filter"
              style={{ minWidth: "160px" }}
              bodyClassName="font-semibold text-gray-900"
            />
            <Column
              field="hq"
              header="HQ"
              sortable
              filter
              filterPlaceholder="Filter"
              style={{ minWidth: "140px" }}
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

