"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import type { ComponentProps } from "react";

interface DataTableProps {
  data: any[];
  onDataChange: (data: any[]) => void;
}

const SortableRow = ({
  row,
  rowIndex,
  headers,
  handleInputChange,
  handleDeleteRow,
}: {
  row: any;
  rowIndex: number;
  headers: string[];
  handleInputChange: (rowIndex: number, columnHeader: string, value: string) => void;
  handleDeleteRow: (rowIndex: number) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `row-${rowIndex}` });

  const style: ComponentProps<"tr">["style"] = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes}>
      <TableCell className="w-12 p-1 md:p-2">
        <Button
          variant="ghost"
          size="icon"
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      </TableCell>
      {headers.map((header) => (
        <TableCell key={`${rowIndex}-${header}`} className="p-1 md:p-2">
          <Input
            type="text"
            value={row[header]}
            onChange={(e) => handleInputChange(rowIndex, header, e.target.value)}
          />
        </TableCell>
      ))}
      <TableCell className="w-12 p-1 md:p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteRow(rowIndex)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </TableCell>
    </TableRow>
  );
};


export function DataTable({ data, onDataChange }: DataTableProps) {
  const [headers, setHeaders] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (data && data.length > 0) {
      setHeaders(Object.keys(data[0]));
    }
  }, [data]);

  if (!data || (data.length === 0 && headers.length === 0)) {
    return <p>No data to display.</p>;
  }
  
  const rowIds = data.map((_, index) => `row-${index}`);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleInputChange = (
    rowIndex: number,
    columnHeader: string,
    value: string
  ) => {
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex], [columnHeader]: value };
    onDataChange(newData);
  };
  
  const handleDeleteRow = (rowIndex: number) => {
      const newData = data.filter((_, index) => index !== rowIndex);
      onDataChange(newData);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
        const oldIndex = rowIds.indexOf(active.id as string);
        const newIndex = rowIds.indexOf(over.id as string);
        onDataChange(arrayMove(data, oldIndex, newIndex));
    }
  };
  
  const handleAddRow = () => {
    if (headers.length === 0) return;
    const newRow = headers.reduce((acc, header) => {
        (acc as any)[header] = "";
        return acc;
    }, {});
    onDataChange([...data, newRow]);
  };

  return (
    <div className="space-y-4">
        <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        >
        <div className="rounded-md border overflow-auto max-h-[60vh] relative">
            <Table>
            <TableHeader className="sticky top-0 bg-secondary z-10">
                <TableRow>
                <TableHead className="w-12 px-2 md:px-4">Move</TableHead>
                {headers.map((header) => (
                    <TableHead key={header} className="font-bold px-2 md:px-4">
                    {header}
                    </TableHead>
                ))}
                <TableHead className="w-12 px-2 md:px-4">Delete</TableHead>
                </TableRow>
            </TableHeader>
            <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
                <TableBody>
                {data.map((row, rowIndex) => (
                    <SortableRow
                        key={rowIds[rowIndex]}
                        row={row}
                        rowIndex={rowIndex}
                        headers={headers}
                        handleInputChange={handleInputChange}
                        handleDeleteRow={handleDeleteRow}
                    />
                ))}
                </TableBody>
            </SortableContext>
            </Table>
        </div>
        </DndContext>
        <div className="flex justify-end">
            <Button onClick={handleAddRow} variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Add Row
            </Button>
        </div>
    </div>
  );
}