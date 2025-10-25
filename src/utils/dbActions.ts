"use client";

import sql from "../lib/neonClient";

export type EmployeeRow = {
  id: number;
  emp_code: string | null;
  name: string;
  division: string;
  designation: string;
  hq: string;
  resigned_date: string | null; // ISO date string or null
  vacancy: string;
  remarks: string;
};

function toSafeText(value: any): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  return String(value).trim();
}

function parseDate(value: any): string | null {
  if (!value) return null;
  
  // If already a valid Date object
  if (value instanceof Date && !isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // If it's a number (Excel serial date)
  if (typeof value === 'number') {
    // Excel serial date: days since 1900-01-01 (with 1900 leap year bug)
    const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
    const date = new Date(excelEpoch.getTime() + value * 86400000);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return null;
  }
  
  const str = String(value).trim();
  if (!str) return null;
  
  // dd-mm-yyyy or dd/mm/yyyy
  const m = str.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (m) {
    const day = String(m[1]).padStart(2, '0');
    const month = String(m[2]).padStart(2, '0');
    const year = m[3];
    return `${year}-${month}-${day}`;
  }
  
  // yyyy-mm-dd (ISO format)
  const isoMatch = str.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = String(isoMatch[2]).padStart(2, '0');
    const day = String(isoMatch[3]).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Try parsing as a date string
  try {
    const dt = new Date(str);
    if (!isNaN(dt.getTime())) {
      const year = dt.getFullYear();
      const month = String(dt.getMonth() + 1).padStart(2, '0');
      const day = String(dt.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    // ignore
  }
  
  return null;
}

export async function ensureSchema(): Promise<void> {
  await sql`
    create table if not exists employees_flat (
      id serial primary key,
      emp_code text unique,
      name text,
      division text,
      designation text,
      hq text,
      resigned_date date,
      vacancy text,
      remarks text,
      updated_at timestamp default current_timestamp
    );
  `;
  await sql`create index if not exists idx_employees_flat_division on employees_flat(division)`;
  await sql`create index if not exists idx_employees_flat_hq on employees_flat(hq)`;
}

export async function getAllEmployees(): Promise<EmployeeRow[]> {
  await ensureSchema();
  const rows = await sql`
    select id, emp_code, name, division, designation, hq, 
           to_char(resigned_date, 'YYYY-MM-DD') as resigned_date,
           vacancy, remarks
    from employees_flat
    order by division nulls last, hq nulls last, name nulls last
  `;
  return rows as EmployeeRow[];
}

export async function syncExcelToDB(rows: any[]): Promise<EmployeeRow[]> {
  await ensureSchema();
  for (const r of rows) {
    const empCode = toSafeText(r["Emp Code"] ?? r.emp_code ?? r.EmpCode ?? r.code ?? "");
    const name = toSafeText(r.name ?? r.Name ?? r.employee ?? "");
    const division = toSafeText(r.division ?? r.Division ?? r.DIVISION ?? "");
    const designation = toSafeText(r.designation ?? r.Designation ?? "");
    const hq = toSafeText(r.hq ?? r.HQ ?? r.hq_name ?? "");
    const resignedDate = parseDate(r["Resigned Date"] ?? r.resigned_date ?? r.ResignedDate ?? "");
    const vacancy = toSafeText(r["Vacancy Period"] ?? r.vacancy ?? r.Vacancy ?? "");
    const remarks = toSafeText(r.remarks ?? r.Remarks ?? "");

    if (!name && !empCode) continue;

    if (empCode) {
      // Upsert by emp_code
      await sql`
        insert into employees_flat (emp_code, name, division, designation, hq, resigned_date, vacancy, remarks)
        values (${empCode}, ${name}, ${division}, ${designation}, ${hq}, ${resignedDate}, ${vacancy}, ${remarks})
        on conflict (emp_code) do update set
          name = excluded.name,
          division = excluded.division,
          designation = excluded.designation,
          hq = excluded.hq,
          resigned_date = excluded.resigned_date,
          vacancy = excluded.vacancy,
          remarks = excluded.remarks,
          updated_at = current_timestamp
      `;
    } else {
      // No emp_code → insert as new row
      await sql`
        insert into employees_flat (emp_code, name, division, designation, hq, resigned_date, vacancy, remarks)
        values (null, ${name}, ${division}, ${designation}, ${hq}, ${resignedDate}, ${vacancy}, ${remarks})
      `;
    }
  }
  return await getAllEmployees();
}

export async function addEmployee(row: any): Promise<EmployeeRow> {
  await ensureSchema();
  const empCode = toSafeText(row.emp_code || "");
  const name = toSafeText(row.name || "");
  const division = toSafeText(row.division || "");
  const designation = toSafeText(row.designation || "");
  const hq = toSafeText(row.hq || "");
  const resignedDate = parseDate(row.resigned_date || "");
  const vacancy = toSafeText(row.vacancy || "");
  const remarks = toSafeText(row.remarks || "");
  const inserted = await sql`
    insert into employees_flat (emp_code, name, division, designation, hq, resigned_date, vacancy, remarks)
    values (${empCode || null}, ${name}, ${division}, ${designation}, ${hq}, ${resignedDate}, ${vacancy}, ${remarks})
    returning id, emp_code, name, division, designation, hq,
              to_char(resigned_date, 'YYYY-MM-DD') as resigned_date,
              vacancy, remarks
  `;
  return inserted[0] as EmployeeRow;
}

export async function updateEmployee(
  id: number,
  field: string,
  value: any
): Promise<EmployeeRow> {
  await ensureSchema();
  // Map allowed fields directly
  if (field === "resigned_date") {
    const v = parseDate(value);
    await sql`update employees_flat set resigned_date = ${v}, updated_at = current_timestamp where id = ${id}`;
  } else if (["emp_code", "name", "division", "designation", "hq", "vacancy", "remarks"].includes(field)) {
    const v = toSafeText(value);
    // Note: We cannot parametrize column names; use simple branches or explicit cases when needed.
    if (field === "emp_code") await sql`update employees_flat set emp_code = ${v || null}, updated_at = current_timestamp where id = ${id}`;
    if (field === "name") await sql`update employees_flat set name = ${v}, updated_at = current_timestamp where id = ${id}`;
    if (field === "division") await sql`update employees_flat set division = ${v}, updated_at = current_timestamp where id = ${id}`;
    if (field === "designation") await sql`update employees_flat set designation = ${v}, updated_at = current_timestamp where id = ${id}`;
    if (field === "hq") await sql`update employees_flat set hq = ${v}, updated_at = current_timestamp where id = ${id}`;
    if (field === "vacancy") await sql`update employees_flat set vacancy = ${v}, updated_at = current_timestamp where id = ${id}`;
    if (field === "remarks") await sql`update employees_flat set remarks = ${v}, updated_at = current_timestamp where id = ${id}`;
  }

  const result = await sql`
    select id, emp_code, name, division, designation, hq,
           to_char(resigned_date, 'YYYY-MM-DD') as resigned_date,
           vacancy, remarks
    from employees_flat where id = ${id}
  `;
  return result[0] as EmployeeRow;
}

export async function deleteEmployee(id: number): Promise<void> {
  await ensureSchema();
  await sql`delete from employees_flat where id = ${id}`;
}

// Summary statistics
export type DivisionSummary = {
  division: string;
  total_employees: number;
  total_hqs: number;
  vacant_count: number;
};

export type HQSummary = {
  division: string;
  hq: string;
  total_employees: number;
  vacant_count: number;
};

export async function getDivisionSummary(): Promise<DivisionSummary[]> {
  await ensureSchema();
  const rows = await sql`
    select 
      division,
      count(*) as total_employees,
      count(distinct hq) as total_hqs,
      count(case when vacancy != '' and vacancy is not null then 1 end) as vacant_count
    from employees_flat
    where division is not null and division != ''
    group by division
    order by division
  `;
  return rows as DivisionSummary[];
}

export async function getHQSummary(): Promise<HQSummary[]> {
  await ensureSchema();
  const rows = await sql`
    select 
      division,
      hq,
      count(*) as total_employees,
      count(case when vacancy != '' and vacancy is not null then 1 end) as vacant_count
    from employees_flat
    where division is not null and division != '' 
      and hq is not null and hq != ''
    group by division, hq
    order by division, hq
  `;
  return rows as HQSummary[];
}


