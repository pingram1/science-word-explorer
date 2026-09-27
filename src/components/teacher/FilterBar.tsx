"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { SkillCategory, WordMasteryStatus } from "@/lib/types";
import {
  formatMasteryStatus,
  formatSkillLabel,
} from "@/lib/teacher/formatters";
import type { TeacherDashboardFilters } from "@/lib/teacher/types";

export interface FilterBarOptions {
  classes: Array<{ id: string; name: string }>;
  units: Array<{ id: string; title: string }>;
  students: Array<{ id: string; displayName: string }>;
  skills: SkillCategory[];
  masteryStatuses: WordMasteryStatus[];
}

export interface FilterBarProps {
  filters: TeacherDashboardFilters;
  options: FilterBarOptions;
  onChange: (filters: TeacherDashboardFilters) => void;
}

export function FilterBar({ filters, options, onChange }: FilterBarProps) {
  function update<K extends keyof TeacherDashboardFilters>(
    key: K,
    value: TeacherDashboardFilters[K] | "",
  ) {
    onChange({ ...filters, [key]: value || undefined });
  }

  return (
    <section
      aria-label="Dashboard filters"
      className="grid gap-4 rounded-2xl border-2 border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <Select
        label="Class"
        value={filters.classId ?? ""}
        onChange={(event) => update("classId", event.target.value)}
      >
        <option value="">All classes</option>
        {options.classes.map((classItem) => (
          <option key={classItem.id} value={classItem.id}>
            {classItem.name}
          </option>
        ))}
      </Select>

      <Select
        label="Unit"
        data-testid="filter-unit"
        value={filters.unitId ?? ""}
        onChange={(event) => update("unitId", event.target.value)}
      >
        <option value="">All units</option>
        {options.units.map((unit) => (
          <option key={unit.id} value={unit.id}>
            {unit.title}
          </option>
        ))}
      </Select>

      <Select
        label="Student"
        value={filters.studentId ?? ""}
        onChange={(event) => update("studentId", event.target.value)}
      >
        <option value="">All students</option>
        {options.students.map((student) => (
          <option key={student.id} value={student.id}>
            {student.displayName}
          </option>
        ))}
      </Select>

      <Input
        label="Start date"
        type="date"
        value={filters.startDate?.slice(0, 10) ?? ""}
        onChange={(event) =>
          update("startDate", event.target.value ? `${event.target.value}T00:00:00.000Z` : "")
        }
      />

      <Input
        label="End date"
        type="date"
        value={filters.endDate?.slice(0, 10) ?? ""}
        onChange={(event) =>
          update("endDate", event.target.value ? `${event.target.value}T23:59:59.999Z` : "")
        }
      />

      <Select
        label="Mastery status"
        data-testid="filter-mastery-status"
        value={filters.masteryStatus ?? ""}
        onChange={(event) =>
          update("masteryStatus", event.target.value as WordMasteryStatus)
        }
      >
        <option value="">Any status</option>
        {options.masteryStatuses.map((status) => (
          <option key={status} value={status}>
            {formatMasteryStatus(status)}
          </option>
        ))}
      </Select>

      <Select
        label="Skill"
        value={filters.skillCategory ?? ""}
        onChange={(event) =>
          update("skillCategory", event.target.value as SkillCategory)
        }
      >
        <option value="">All skills</option>
        {options.skills.map((skill) => (
          <option key={skill} value={skill}>
            {formatSkillLabel(skill)}
          </option>
        ))}
      </Select>
    </section>
  );
}
