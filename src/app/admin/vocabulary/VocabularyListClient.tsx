"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/shared/LoadingState";
import type { Unit, VocabularyWord } from "@/lib/types";

export function VocabularyListClient() {
  const searchParams = useSearchParams();
  const initialUnitId = searchParams.get("unitId") ?? "";
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [search, setSearch] = useState("");
  const [unitId, setUnitId] = useState(initialUnitId);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (unitId) params.set("unitId", unitId);
    if (search) params.set("search", search);
    params.set("activeOnly", "false");

    const [wordsResponse, unitsResponse] = await Promise.all([
      fetch(`/api/admin/vocabulary?${params.toString()}`),
      fetch("/api/admin/units"),
    ]);

    setWords(await wordsResponse.json());
    setUnits(await unitsResponse.json());
    setIsLoading(false);
  }, [search, unitId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Vocabulary</h2>
          <p className="mt-1 text-muted">Search and filter science vocabulary words.</p>
        </div>
        <Link href="/admin/vocabulary/new">
          <Button>Add word</Button>
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by word or definition"
        />
        <Select
          label="Unit"
          value={unitId}
          onChange={(event) => setUnitId(event.target.value)}
        >
          <option value="">All units</option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.title}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <LoadingState title="Loading vocabulary" description="" />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <caption className="sr-only">Vocabulary word list</caption>
              <thead>
                <tr className="border-b-2 border-border bg-surface-muted text-left">
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Word
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Unit
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Definition
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {words.map((word) => {
                  const unit = units.find((entry) => entry.id === word.unitId);
                  return (
                    <tr key={word.id} className="border-b border-border">
                      <td className="px-4 py-3 font-semibold">{word.word}</td>
                      <td className="px-4 py-3">{unit?.title ?? word.unitId}</td>
                      <td className="max-w-xs truncate px-4 py-3">
                        {word.studentFriendlyDefinition}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={word.isActive ? "green" : "default"}>
                            {word.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {word.requiresTeacherReview && (
                            <Badge variant="warning">Needs review</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/admin/vocabulary/${word.id}`}
                            className="font-semibold text-science-blue hover:underline"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/admin/vocabulary/${word.id}/preview`}
                            className="font-semibold text-science-teal hover:underline"
                          >
                            Preview
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
