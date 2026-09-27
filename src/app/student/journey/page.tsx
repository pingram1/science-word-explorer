"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  FlaskConical,
  Rocket,
  Sprout,
  Trees,
} from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { JourneyData } from "@/lib/api/student-services";
import { fetchApi } from "@/components/student/api";
import type { Reward } from "@/lib/types";

function RewardGrid({
  title,
  icon: Icon,
  rewards,
  earnedIds,
  description,
}: {
  title: string;
  icon: typeof Award;
  rewards: Reward[];
  earnedIds: string[];
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-5 text-science-teal" aria-hidden="true" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 sm:grid-cols-2">
          {rewards.map((reward) => {
            const earned = earnedIds.includes(reward.id);
            return (
              <li
                key={reward.id}
                className={`rounded-xl border-2 p-4 ${
                  earned
                    ? "border-science-green bg-science-green/10"
                    : "border-border bg-surface-muted opacity-80"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-foreground">{reward.title}</p>
                  <Badge variant={earned ? "green" : "accent"}>
                    {earned ? "Earned" : `${reward.pointsRequired} pts`}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted">{reward.description}</p>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function StudentJourneyPage() {
  const [data, setData] = useState<JourneyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<JourneyData>("/api/student/journey")
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState title="Loading your journey" />;
  if (error || !data) {
    return <ErrorState title="Journey unavailable" message={error ?? "Error"} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-3xl font-bold text-foreground">Your Journey</h2>
        <p className="text-lg text-muted">
          Collect badges, grow your garden, and advance your science mission.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Journey progress</CardTitle>
          <CardDescription>Your path through Science Word Explorer</CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressBar value={data.journeyProgress} showValue label="Overall journey" />
        </CardContent>
      </Card>

      <RewardGrid
        title="Lab badges"
        icon={FlaskConical}
        rewards={data.categories.lab_badge}
        earnedIds={data.earnedBadgeIds}
        description="Earned by mastering investigation vocabulary"
      />

      <RewardGrid
        title="Garden"
        icon={Sprout}
        rewards={data.categories.garden_item}
        earnedIds={data.earnedBadgeIds}
        description="Grow your ecosystem garden as you learn"
      />

      <RewardGrid
        title="Space mission"
        icon={Rocket}
        rewards={data.categories.space_mission}
        earnedIds={data.earnedBadgeIds}
        description="Advance through science exploration milestones"
      />

      <RewardGrid
        title="Wilderness trail"
        icon={Trees}
        rewards={data.categories.wilderness_trail}
        earnedIds={data.earnedBadgeIds}
        description="Trail markers for unit achievements"
      />

      <Link href="/student" className="text-science-blue font-semibold hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
