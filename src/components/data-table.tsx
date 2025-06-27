"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface DataTableProps {
  data: any[];
  onDataChange: (data: any[]) => void;
}

export function DataTable({ data, onDataChange }: DataTableProps) {
  if (!data || data.length === 0) {
    return <p>No data to display.</p>;
  }

  const headers = Object.keys(data[0]);

  const handleInputChange = (
    rowIndex: number,
    columnHeader: string,
    value: string
  ) => {
    const newData = [...data];
    newData[rowIndex][columnHeader] = value;
    onDataChange(newData);
  };

  return (
    <div className="rounded-md border overflow-auto max-h-[60vh] relative">
      <Table>
        <TableHeader className="sticky top-0 bg-secondary">
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header} className="font-bold px-2 md:px-4">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {headers.map((header) => (
                <TableCell key={`${rowIndex}-${header}`} className="p-1 md:p-2">
                  <Input
                    type="text"
                    value={row[header]}
                    onChange={(e) =>
                      handleInputChange(rowIndex, header, e.target.value)
                    }
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
