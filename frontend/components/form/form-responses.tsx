"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Form } from "@/types/form";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FORM_URLS } from "@/config/api-urls";
import { tokenService } from "@/lib/services/token";
import { formatDate, formatDateTime } from "@/lib/utils";
import { useForms } from "@/hooks/use-forms";

interface FormResponse {
  id: string;
  created_at: string;
  response_data: Record<string, unknown>;
}

interface FormResponsesProps {
  form: Form;
}

export default function FormResponses({ form }: FormResponsesProps) {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { forms, isLoading: formsLoading } = useForms();
  const totalResponses = useMemo(() => {
    const matchedForm = forms.find((f) => f.id === form.id);
    return matchedForm ? matchedForm.response_count : 0;
  }, [forms, form.id]);

  // Fetch form responses
  useEffect(() => {
    async function fetchResponses() {
      try {
        setIsLoading(true);
        const response = await fetch(
          FORM_URLS.RESPONSES(
            form.id,
            pagination.pageSize,
            pagination.pageIndex * pagination.pageSize
          ),
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokenService.token.get()}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch responses");
        }

        const data = await response.json();
        setResponses(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
        setResponses([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResponses();
  }, [form.id, pagination.pageIndex, pagination.pageSize]);

  // Dynamic column generation
  const columns = useMemo<ColumnDef<FormResponse>[]>(() => {
    if (!form.fields || responses.length === 0) return [];

    const baseColumns: ColumnDef<FormResponse>[] = [
      {
        accessorKey: "created_at",
        header: "Submitted At",
        cell: ({ getValue }) => {
          return formatDateTime(getValue() as string);
        },
        size: 200,
      },
    ];

    const fieldColumns = form.fields.map((field) => ({
      accessorKey: `answers.${field.tag}`,
      header: field.label,
      cell: ({ getValue }: { getValue: () => unknown }) => {
        const value = getValue();
        switch (field.type) {
          case "multi_select":
            return Array.isArray(value) ? value.join(", ") : value;
          case "date":
            return formatDate(
              (value as string | number)
                ? new Date(value as string | number).toLocaleDateString()
                : ""
            );
          default:
            return value ?? "";
        }
      },
    }));

    return [...fieldColumns, ...baseColumns];
  }, [form.fields, responses]);

  // Table instance
  const table = useReactTable({
    data: responses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    state: {
      pagination,
    },
    pageCount: Math.ceil(totalResponses / pagination.pageSize),
    onPaginationChange: setPagination,
  });

  if (isLoading || formsLoading) {
    return (
      <div className="mx-auto my-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading Responses
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto my-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Loading Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto my-8 space-y-6">
      {responses.length === 0 ? (
        <p className="text-muted-foreground text-center">No responses yet.</p>
      ) : (
        <div className="space-y-4">
          <ScrollArea className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <div className="flex items-center justify-center px-2">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
