"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { InterventionGroupCard } from "@/components/teacher/InterventionGroupCard";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingState } from "@/components/shared/LoadingState";
import { formatSkillLabel } from "@/lib/teacher/formatters";
import { fetchJsonApi } from "@/lib/api/client";
import type { InterventionGroupDetail, InterventionPageData } from "@/lib/teacher/types";
import { ALL_SKILL_CATEGORIES } from "@/lib/types";

export default function InterventionPage() {
  const [data, setData] = useState<InterventionPageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    reason: "",
    supportingData: "",
    recommendedActivity: "",
    skillFocus: "",
    studentIds: [] as string[],
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const intervention = await fetchJsonApi<InterventionPageData>("/api/teacher/intervention");
      setData(intervention);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDismiss(groupId: string) {
    await fetch("/api/teacher/intervention", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: groupId, status: "dismissed" }),
    });
    await load();
  }

  async function handleSave(group: InterventionGroupDetail) {
    await fetch("/api/teacher/intervention", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: group.id,
        name: group.name,
        reason: group.reason,
        supportingData: group.supportingData,
        recommendedActivity: group.recommendedActivity,
        status: group.status,
        skillFocus: group.skillFocus,
      }),
    });
    await load();
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    await fetch("/api/teacher/intervention", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newGroup,
        skillFocus: newGroup.skillFocus || null,
        classId: data?.classes[0]?.id,
      }),
    });
    setShowCreate(false);
    setNewGroup({
      name: "",
      reason: "",
      supportingData: "",
      recommendedActivity: "",
      skillFocus: "",
      studentIds: [],
    });
    await load();
  }

  if (isLoading && !data) {
    return <LoadingState title="Loading intervention groups" description="" />;
  }

  if (error && !data) {
    return (
      <ErrorState
        title="Intervention unavailable"
        message={error}
        action={
          <Button onClick={() => void load()} variant="outline">
            Retry
          </Button>
        }
      />
    );
  }

  if (!data) return null;

  const activeGroups = data.groups.filter((group) => group.status !== "dismissed");

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Intervention groups</h2>
          <p className="mt-1 text-muted">
            Review suggested small groups, edit activities, dismiss resolved groups, or create manual
            groups.
          </p>
        </div>
        <Button onClick={() => setShowCreate((value) => !value)}>
          {showCreate ? "Cancel" : "Create group"}
        </Button>
      </header>

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="grid gap-4 rounded-2xl border-2 border-border bg-surface p-6 sm:grid-cols-2"
        >
          <Input
            label="Group name"
            value={newGroup.name}
            onChange={(event) => setNewGroup({ ...newGroup, name: event.target.value })}
            required
          />
          <Select
            label="Skill focus"
            value={newGroup.skillFocus}
            onChange={(event) => setNewGroup({ ...newGroup, skillFocus: event.target.value })}
          >
            <option value="">Mixed skills</option>
            {ALL_SKILL_CATEGORIES.map((skill) => (
              <option key={skill} value={skill}>
                {formatSkillLabel(skill)}
              </option>
            ))}
          </Select>
          <Textarea
            label="Reason"
            className="sm:col-span-2"
            value={newGroup.reason}
            onChange={(event) => setNewGroup({ ...newGroup, reason: event.target.value })}
            required
          />
          <Textarea
            label="Supporting data"
            className="sm:col-span-2"
            value={newGroup.supportingData}
            onChange={(event) =>
              setNewGroup({ ...newGroup, supportingData: event.target.value })
            }
          />
          <Textarea
            label="Recommended activity"
            className="sm:col-span-2"
            value={newGroup.recommendedActivity}
            onChange={(event) =>
              setNewGroup({ ...newGroup, recommendedActivity: event.target.value })
            }
          />
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 font-semibold">Students</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {data.students.map((student) => (
                <label key={student.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newGroup.studentIds.includes(student.id)}
                    onChange={(event) => {
                      setNewGroup((prev) => ({
                        ...prev,
                        studentIds: event.target.checked
                          ? [...prev.studentIds, student.id]
                          : prev.studentIds.filter((id) => id !== student.id),
                      }));
                    }}
                  />
                  {student.displayName}
                </label>
              ))}
            </div>
          </fieldset>
          <Button type="submit" className="sm:col-span-2">
            Create intervention group
          </Button>
        </form>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {activeGroups.map((group) => (
          <InterventionGroupCard
            key={group.id}
            group={group}
            onDismiss={handleDismiss}
            onSave={handleSave}
          />
        ))}
      </div>
    </div>
  );
}
