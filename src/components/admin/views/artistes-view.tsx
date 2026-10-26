'use client'

import { Users, Disc3, Wallet, Music2, Trophy, BarChart3, Inbox } from "lucide-react";
import { KpiCard, SectionCard, StatusBadge, EmptyStateCard } from "../shared/ui";
import { PageHeader } from "../admin-shell";
import { type Submission, formatFCFA } from "@/lib/admin-types";

export function ArtistesView({ submissions }: { submissions: Submission[] }) {
  const artistMap = new Map<string, { name: string; email: string; phone: string; city: string | null; revenue: number; tracks: number; releases: number; pending: number; approved: number; delivered: number; genres: Set<string> }>();

  submissions.forEach((s) => {
    const key = s.artistEmail.toLowerCase();
    const existing = artistMap.get(key) || { name: s.artistName, email: s.artistEmail, phone: s.artistPhone, city: s.artistCity, revenue: 0, tracks: 0, releases: 0, pending: 0, approved: 0, delivered: 0, genres: new Set<string>() };
    existing.revenue += s.amount;
    existing.tracks += s.tracks.length;
    existing.releases += 1;
    if (s.status === "pending") existing.pending += 1;
    if (s.status === "approved") existing.approved += 1;
    if (s.status === "delivered") existing.delivered += 1;
    if (s.releaseGenre) existing.genres.add(s.releaseGenre);
    artistMap.set(key, existing);
  });

  const artists = Array.from(artistMap.values()).sort((a, b) => b.revenue - a.revenue);
  const totalRevenue = artists.reduce((sum, a) => sum + a.revenue, 0);
  const totalTracks = artists.reduce((sum, a) => sum + a.tracks, 0);
  const totalPending = submissions.filter((s) => s.status === "pending").length;

  const genreCount = new Map<string, number>();
  submissions.forEach((s) => { if (s.releaseGenre) genreCount.set(s.releaseGenre, (genreCount.get(s.releaseGenre) || 0) + 1); });
  const topGenres = Array.from(genreCount.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  const maxGenre = topGenres.length > 0 ? topGenres[0].count : 1;

  const isEmpty = artists.length === 0;

  return (
    <div className="px-5 sm:px-8 py-7 sm:py-9 max-w-7xl mx-auto">
      <PageHeader badge="Artistes" title="Artistes" titleAccent="collaborateurs" subtitle={isEmpty ? "Aucun artiste pour le moment" : `${artists.length} artiste${artists.length > 1 ? "s" : ""} · ${totalTracks} titres distribués`} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <KpiCard icon={Users} label="Artistes" value={artists.length} accent="purple" />
        <KpiCard icon={Disc3} label="En attente" value={totalPending} accent="orange" />
        <KpiCard icon={Wallet} label="Revenus générés" value={formatFCFA(totalRevenue)} accent="green" />
      </div>

      {isEmpty ? (
        <div className="mt-6">
          <EmptyStateCard
            icon={Inbox}
            title="Aucun artiste pour le moment"
            description="Le classement des artistes, les genres populaires et les statistiques apparaîtront ici dès que les premières soumissions seront reçues."
          />
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard title="Genres musicaux les plus populaires" icon={Music2}>
              {topGenres.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Aucun genre pour le moment.</p>
              ) : (
                <div className="space-y-4">
                  {topGenres.slice(0, 5).map((g) => (
                    <div key={g.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">{g.name}</span>
                        <span className="text-xs text-muted-foreground">{g.count} sortie{g.count > 1 ? "s" : ""}</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-gold" style={{ width: `${(g.count / maxGenre) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Classement des auteurs" icon={Trophy} action={<span className="text-xs text-muted-foreground">Top contributeurs</span>}>
              <div className="space-y-2.5">
                {artists.slice(0, 5).map((a, i) => (
                  <div key={a.email} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/60">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-gold text-black font-display font-bold text-xs">{i + 1}</span>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary border border-border font-display font-bold text-sm">{a.name.slice(0, 2).toUpperCase()}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{a.name}</span>
                        {i === 0 && <span className="inline-flex items-center rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1.5 py-0 text-[9px] font-bold uppercase">TOP</span>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{a.releases} sortie{a.releases > 1 ? "s" : ""} · {a.tracks} titre{a.tracks > 1 ? "s" : ""}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-sm text-emerald-400">{formatFCFA(a.revenue)}</div>
                      <div className="flex gap-1 mt-0.5 justify-end">
                        {a.pending > 0 && <StatusBadge kind="pending" label={`${a.pending}`} />}
                        {a.approved > 0 && <StatusBadge kind="approved" label={`${a.approved}`} />}
                        {a.delivered > 0 && <StatusBadge kind="delivered" label={`${a.delivered}`} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="mt-4">
            <SectionCard title="Performance par artiste" icon={BarChart3}>
              <div className="space-y-5">
                {artists.map((a) => {
                  const maxRev = Math.max(...artists.map((x) => x.revenue), 1);
                  return (
                    <div key={a.email}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{a.name}</span>
                        <span className="text-sm font-semibold text-emerald-400">{formatFCFA(a.revenue)}</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-gold" style={{ width: `${(a.revenue / maxRev) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>

          <div className="mt-4">
            <SectionCard title="Tous les artistes" icon={Users} action={<span className="text-xs text-muted-foreground">{artists.length} au total</span>}>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left font-medium px-3 py-2.5">Artiste</th>
                      <th className="text-left font-medium px-3 py-2.5 hidden sm:table-cell">Ville</th>
                      <th className="text-left font-medium px-3 py-2.5 hidden md:table-cell">Genres</th>
                      <th className="text-right font-medium px-3 py-2.5">Sorties</th>
                      <th className="text-right font-medium px-3 py-2.5 hidden sm:table-cell">Titres</th>
                      <th className="text-right font-medium px-3 py-2.5">Revenus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {artists.map((a) => (
                      <tr key={a.email} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary border border-border font-display font-bold text-xs">{a.name.slice(0, 2).toUpperCase()}</span>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{a.name}</div>
                              <div className="text-xs text-muted-foreground truncate">{a.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 hidden sm:table-cell text-muted-foreground">{a.city || "—"}</td>
                        <td className="px-3 py-3 hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {Array.from(a.genres).slice(0, 2).map((g) => (<span key={g} className="text-xs rounded-md bg-secondary border border-border px-1.5 py-0.5">{g}</span>))}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right font-medium">{a.releases}</td>
                        <td className="px-3 py-3 text-right hidden sm:table-cell text-muted-foreground">{a.tracks}</td>
                        <td className="px-3 py-3 text-right font-semibold text-gradient-gold">{formatFCFA(a.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}
