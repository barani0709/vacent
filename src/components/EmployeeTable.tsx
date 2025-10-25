"use client";

import { useState } from "react";
import { DataTable, DataTableRowEditCompleteEvent } from "primereact/datatable";
import { Column, ColumnEditorOptions } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import * as XLSX from "xlsx";
import { addEmployee, deleteEmployee, updateEmployee } from "../utils/dbActions";

type Row = {
  id: number;
  emp_code?: string | null;
  name: string;
  division: string;
  designation: string;
  hq: string;
  resigned_date?: string | null;
  vacancy: string;
  remarks: string;
};

export default function EmployeeTable({
  rows,
  loading,
  onChangeRows
}: {
  rows: Row[];
  loading: boolean;
  onChangeRows: (rows: Row[]) => void;
}) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Row | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    emp_code: "",
    name: "",
    division: "",
    designation: "",
    hq: "",
    resigned_date: "",
    vacancy: "",
    remarks: ""
  });

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, "employees.xlsx");
  };

  const onAdd = () => {
    setNewEmployee({
      emp_code: "",
      name: "",
      division: "",
      designation: "",
      hq: "",
      resigned_date: "",
      vacancy: "",
      remarks: ""
    });
    setShowAddDialog(true);
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.division || !newEmployee.hq) {
      alert("Please fill in Name, Division, and HQ fields");
      return;
    }
    const addedRow = await addEmployee(newEmployee);
    onChangeRows([addedRow as any, ...rows]);
    setShowAddDialog(false);
  };

  const onEdit = (row: Row) => {
    setEditingEmployee({ ...row });
    setShowEditDialog(true);
  };

  const handleEditEmployee = async () => {
    if (!editingEmployee) return;
    
    if (!editingEmployee.name || !editingEmployee.division || !editingEmployee.hq) {
      alert("Please fill in Name, Division, and HQ fields");
      return;
    }

    // Update each field
    for (const field of Object.keys(editingEmployee)) {
      if (field !== 'id') {
        await updateEmployee(editingEmployee.id, field, editingEmployee[field as keyof Row]);
      }
    }
    
    // Update local state
    const updatedRows = rows.map(r => r.id === editingEmployee.id ? editingEmployee : r);
    onChangeRows(updatedRows);
    setShowEditDialog(false);
    setEditingEmployee(null);
  };

  const onDelete = async (row: Row) => {
    if (confirm(`Delete employee ${row.name}?`)) {
      await deleteEmployee(row.id);
      onChangeRows(rows.filter((r) => r.id !== row.id));
    }
  };

  const actionsBody = (row: Row) => (
    <div className="flex gap-2 justify-center">
      <Button
        icon="pi pi-pencil"
        size="small"
        text
        onClick={() => onEdit(row)}
        tooltip="Edit"
        tooltipOptions={{ position: "top" }}
        className="text-gray-600 hover:text-gray-900"
      />
      <Button
        icon="pi pi-trash"
        severity="danger"
        size="small"
        text
        onClick={() => onDelete(row)}
        tooltip="Delete"
        tooltipOptions={{ position: "top" }}
      />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Edit Employee Dialog */}
      <Dialog
        header="Edit Employee"
        visible={showEditDialog}
        style={{ width: '600px' }}
        onHide={() => {
          setShowEditDialog(false);
          setEditingEmployee(null);
        }}
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => {
                setShowEditDialog(false);
                setEditingEmployee(null);
              }}
              outlined
            />
            <Button
              label="Save Changes"
              icon="pi pi-check"
              onClick={handleEditEmployee}
              className="bg-gray-900 hover:bg-gray-800 border-gray-900"
            />
          </div>
        }
      >
        {editingEmployee && (
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Code
                </label>
                <InputText
                  value={editingEmployee.emp_code || ""}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, emp_code: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Name <span className="text-red-500">*</span>
                </label>
                <InputText
                  value={editingEmployee.name}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Division <span className="text-red-500">*</span>
                </label>
                <InputText
                  value={editingEmployee.division}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, division: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HQ <span className="text-red-500">*</span>
                </label>
                <InputText
                  value={editingEmployee.hq}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, hq: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation
                </label>
                <InputText
                  value={editingEmployee.designation}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, designation: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resigned Date
                </label>
                <InputText
                  type="date"
                  value={editingEmployee.resigned_date || ""}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, resigned_date: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vacancy Period
              </label>
              <InputText
                value={editingEmployee.vacancy}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, vacancy: e.target.value })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks
              </label>
              <InputText
                value={editingEmployee.remarks}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, remarks: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
        )}
      </Dialog>

      {/* Add Employee Dialog */}
      <Dialog
        header="Add New Employee"
        visible={showAddDialog}
        style={{ width: '600px' }}
        onHide={() => setShowAddDialog(false)}
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setShowAddDialog(false)}
              outlined
            />
            <Button
              label="Add Employee"
              icon="pi pi-check"
              onClick={handleAddEmployee}
              className="bg-gray-900 hover:bg-gray-800 border-gray-900"
            />
          </div>
        }
      >
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee Code
              </label>
              <InputText
                value={newEmployee.emp_code}
                onChange={(e) => setNewEmployee({ ...newEmployee, emp_code: e.target.value })}
                className="w-full"
                placeholder="E00001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee Name <span className="text-red-500">*</span>
              </label>
              <InputText
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                className="w-full"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Division <span className="text-red-500">*</span>
              </label>
              <InputText
                value={newEmployee.division}
                onChange={(e) => setNewEmployee({ ...newEmployee, division: e.target.value })}
                className="w-full"
                placeholder="A&P Karnataka"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HQ <span className="text-red-500">*</span>
              </label>
              <InputText
                value={newEmployee.hq}
                onChange={(e) => setNewEmployee({ ...newEmployee, hq: e.target.value })}
                className="w-full"
                placeholder="Bangalore"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designation
              </label>
              <InputText
                value={newEmployee.designation}
                onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })}
                className="w-full"
                placeholder="BE"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resigned Date
              </label>
              <InputText
                type="date"
                value={newEmployee.resigned_date}
                onChange={(e) => setNewEmployee({ ...newEmployee, resigned_date: e.target.value })}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vacancy Period
            </label>
            <InputText
              value={newEmployee.vacancy}
              onChange={(e) => setNewEmployee({ ...newEmployee, vacancy: e.target.value })}
              className="w-full"
              placeholder="0 years, 5 months, 10 days"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <InputText
              value={newEmployee.remarks}
              onChange={(e) => setNewEmployee({ ...newEmployee, remarks: e.target.value })}
              className="w-full"
              placeholder="To be Identified"
            />
          </div>
        </div>
      </Dialog>

      {/* Action Bar - Modern Clean */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Employee Management</h3>
          <p className="text-sm text-gray-500 mt-1">Click pencil icon to edit • {rows.length} records</p>
        </div>
        <div className="flex gap-3">
          <Button
            label="Add Employee"
            icon="pi pi-plus"
            onClick={onAdd}
            size="small"
            className="bg-gray-900 hover:bg-gray-800 border-gray-900"
          />
          <Button
            label="Export"
            icon="pi pi-download"
            onClick={exportExcel}
            size="small"
            outlined
          />
        </div>
      </div>

      {/* Data Table - Modern Professional */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <DataTable
          value={rows}
          loading={loading}
          scrollable
          scrollHeight="calc(100vh - 280px)"
          paginator
          rows={50}
          rowsPerPageOptions={[25, 50, 100, 200]}
          className="modern-table"
          dataKey="id"
          rowHover
        >
          <Column
            field="emp_code"
            header="Code"
            sortable
            style={{ minWidth: "100px" }}
            bodyClassName="font-mono text-xs text-gray-600"
          />
          <Column
            field="division"
            header="Division"
            sortable
            filter
            filterPlaceholder="Filter"
            style={{ minWidth: "160px" }}
            bodyClassName="font-medium text-gray-900"
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
            field="name"
            header="Employee Name"
            sortable
            filter
            filterPlaceholder="Filter"
            style={{ minWidth: "180px" }}
            bodyClassName="font-semibold text-gray-900"
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
            style={{ minWidth: "120px" }}
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
          <Column
            body={actionsBody}
            header="Actions"
            headerStyle={{ width: '120px', textAlign: 'center' }}
            bodyStyle={{ textAlign: 'center' }}
          />
        </DataTable>
      </div>
    </div>
  );
}
