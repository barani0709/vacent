"use client";

import * as XLSX from "xlsx";
import { syncExcelToDB } from "../utils/dbActions";
import { useRef, useState } from "react";

export default function FileUpload({
  onSynced
}: {
  onSynced: (rows: any[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const rows = await syncExcelToDB(json);
      onSynced(rows);
    } catch (e: any) {
      setError(e?.message ?? "Failed to process file");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFiles(file);
        }}
        className="hidden"
      />
      <button
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? "Uploading..." : "Upload Excel"}
      </button>
      {error && <span className="text-red-600 text-sm">{error}</span>}
      <p className="text-sm text-gray-500">First row should contain headers.</p>
    </div>
  );
}


