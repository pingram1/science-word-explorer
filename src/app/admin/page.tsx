import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { getRepository } from "@/lib/repositories";

export default async function AdminHomePage() {
  const repo = await getRepository();
  const units = await repo.listUnits();
  const words = await repo.listVocabularyWords(undefined, false);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-foreground">Content manager</h2>
        <p className="mt-1 text-muted">
          Manage science vocabulary units and structured literacy word lessons.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card padding="md">
          <CardHeader>
            <CardTitle className="text-base">Units</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{units.length}</p>
          </CardContent>
        </Card>
        <Card padding="md">
          <CardHeader>
            <CardTitle className="text-base">Vocabulary words</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{words.length}</p>
          </CardContent>
        </Card>
        <Card padding="md">
          <CardHeader>
            <CardTitle className="text-base">Active words</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{words.filter((word) => word.isActive).length}</p>
          </CardContent>
        </Card>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xl font-bold text-foreground">Units</h3>
          <Link
            href="/admin/vocabulary"
            className="text-sm font-semibold text-science-blue hover:underline"
          >
            Manage vocabulary →
          </Link>
        </div>

        <ul className="grid gap-4 md:grid-cols-2">
          {units.map((unit) => {
            const unitWordCount = words.filter((word) => word.unitId === unit.id).length;
            return (
              <li key={unit.id}>
                <Card padding="md">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle>{unit.title}</CardTitle>
                      <Badge variant={unit.isActive ? "green" : "default"}>
                        {unit.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription>{unit.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted">
                    <p>{unitWordCount} vocabulary words</p>
                    <p>Grade {unit.gradeLevel}</p>
                    <p>{unit.standardsTags.join(", ")}</p>
                    <Link
                      href={`/admin/vocabulary?unitId=${unit.id}`}
                      className="inline-block font-semibold text-science-blue hover:underline"
                    >
                      View words
                    </Link>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
