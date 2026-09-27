"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { formatSkillLabel } from "@/lib/teacher/formatters";
import type { InterventionGroupDetail } from "@/lib/teacher/types";

export interface InterventionGroupCardProps {
  group: InterventionGroupDetail;
  onDismiss: (groupId: string) => Promise<void>;
  onSave: (group: InterventionGroupDetail) => Promise<void>;
}

export function InterventionGroupCard({ group, onDismiss, onSave }: InterventionGroupCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState(group);

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSave(draft);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  const statusVariant =
    group.status === "active" ? "green" : group.status === "suggested" ? "accent" : "default";

  return (
    <Card padding="md">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>{isEditing ? "Edit group" : group.name}</CardTitle>
          <CardDescription>
            {group.skillFocus ? formatSkillLabel(group.skillFocus) : "Mixed skills"}
            {group.isManual ? " · Manual group" : " · System suggested"}
          </CardDescription>
        </div>
        <Badge variant={statusVariant}>{group.status}</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <Input
              label="Group name"
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
            <Textarea
              label="Reason"
              value={draft.reason}
              onChange={(event) => setDraft({ ...draft, reason: event.target.value })}
            />
            <Textarea
              label="Supporting data"
              value={draft.supportingData}
              onChange={(event) => setDraft({ ...draft, supportingData: event.target.value })}
            />
            <Textarea
              label="Recommended activity"
              value={draft.recommendedActivity}
              onChange={(event) =>
                setDraft({ ...draft, recommendedActivity: event.target.value })
              }
            />
          </>
        ) : (
          <>
            <div>
              <h4 className="text-sm font-semibold text-muted">Why this group?</h4>
              <p className="mt-1 text-base text-foreground">{group.reason}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted">Supporting data</h4>
              <p className="mt-1 text-base text-foreground">{group.supportingData}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted">Recommended activity</h4>
              <p className="mt-1 text-base text-foreground">{group.recommendedActivity}</p>
            </div>
          </>
        )}

        <div>
          <h4 className="text-sm font-semibold text-muted">Students ({group.members.length})</h4>
          <ul className="mt-2 flex flex-wrap gap-2">
            {group.members.map((member) => (
              <li key={member.studentId}>
                <Badge variant="blue">{member.displayName}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      <CardFooter>
        {isEditing ? (
          <>
            <Button onClick={handleSave} isLoading={isSaving}>
              Save changes
            </Button>
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            {group.status !== "dismissed" && (
              <Button variant="ghost" onClick={() => onDismiss(group.id)}>
                Dismiss
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
