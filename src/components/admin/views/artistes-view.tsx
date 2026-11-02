'use client'

import { Users, Disc3, Wallet, Music2, Trophy, BarChart3, Inbox, UserPlus, Eye, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KpiCard, SectionCard, StatusBadge, EmptyStateCard } from "../shared/ui";
import { PageHeader } from "../admin-shell";
import { type Submission, formatFCFA } from "@/lib/admin-types";

export function ArtistesView({
  submissions,
  onAddProductionArtist,
  onSelectArtist,
  onInspectStatus,
  onInspectGenre,
}: {
  submissions: Submission[];
  onAddProductionArtist?: (prefillEmail?: string | null) => void;
  onSelectArtist?: (email: string, initialStatus?: string) => void;
  onInspectStatus?: (status: "all" | "pending" | "approved" | "delivered" | "rejected" | "validated") => void;
  onInspectGenre?: (genre: string) => void;
}) {
  const artistMap = new Map<
    string,
    {
      name: string;
      email: string;
      phone: string;
      city: string | null;
      revenue: number;
      tracks: number;
      releases: number;
      pending: number;
      approved: number;
      delivered: number;
      genres: Set<string>;
    }
  >();

  submissions.forEach((s) => {
    const key = s.artistEmail.toLowerCase();
    const existing = artistMap.get(key) || {
      name: s.artistName,
      email: s.artistEmail,
      phone: s.artistPhone,
      city: s.artistCity,
      revenue: 0,
      tracks: 0,
      releases: 0,
      pending: 0,
      approved: 0,
      delivered: 0,
      genres: new Set<string>(),
    };
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
  submissions.forEach((s) => {
    if (s.releaseGenre) genreCount.set(s.releaseGenre, (genreCount.get(s.releaseGenre) || 0) + 1);
  });
  const topGenres = Array.from(genreCount.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  const maxGenre = topGenres.length > 0 ? topGenres[0].count : 1;

  const isEmpty = artists.length === 0;

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-9 max-w-7xl mx-auto">
      <PageHeader
        badge="Artistes & Production"
        title="Artistes"
        titleAccent="en production"
        subtitle={
          isEmpty
            ? "Aucun artiste enregistré pour le moment"
            : `${artists.length} artiste${artists.length > 1 ? "s" : ""} · ${totalTracks} titres distribués · Cliquez sur un artiste ou un statut pour voir ses infos`
        }
        action={
          onAddProductionArtist && (
            <Button
              size="sm"
              onClick={() => onAddProductionArtist(null)}
              className="h-9 sm:h-10 rounded-xl text-xs bg-gradient-gold text-black hover:opacity-90 font-semibold shadow-sm px-4 gap-1.5"
            >
              <UserPlus className="h-4 w-4" />
              <span>+ Ajouter un artiste en production</span>
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <KpiCard
          icon={Users}
          label="Artistes actifs"
          value={artists.length}
          accent="purple"
          ctaLabel="Voir tous les projets"
          onClick={() => onInspectStatus?.("all")}
        />
        <KpiCard
          icon={Disc3}
          label="En attente"
          value={totalPending}
          accent="orange"
          ctaLabel="Voir les sorties en attente"
          onClick={() => onInspectStatus?.("pending")}
        />
        <KpiCard
          icon={Wallet}
          label="Revenus générés"
          value={formatFCFA(totalRevenue)}
          accent="green"
          ctaLabel="Voir les dossiers validés"
          onClick={() => onInspectStatus?.("validated")}
        />
      </div>

      {isEmpty ? (
        <div className="mt-6">
          <EmptyStateCard
            icon={Inbox}
            title="Aucun artiste pour le moment"
            description="Ajoutez dès maintenant les artistes qui sont déjà en production chez Mathias Label pour les afficher dans votre catalogue et sur la vitrine officielle."
            action={
              onAddProductionArtist && (
                <Button
                  onClick={() => onAddProductionArtist(null)}
                  className="rounded-full bg-gradient-gold text-black hover:opacity-90 font-semibold px-6 gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Ajouter mon premier artiste en production
                </Button>
              )
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard title="Genres musicaux les plus populaires" icon={Music2}>
              {topGenres.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Aucun genre pour le moment.</p>
              ) : (
                <div className="space-y-3">
                  {topGenres.slice(0, 5).map((g) => (
                    <button
                      key={g.name}
                      type="button"
                      onClick={() => onInspectGenre?.(g.name)}
                      className="w-full text-left p-2 rounded-xl hover:bg-secondary/50 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">{g.name}</span>
                        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                          {g.count} sortie{g.count > 1 ? "s" : ""}
                          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-gold" style={{ width: `${(g.count / maxGenre) * 100}%` }} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Classement des artistes"
              icon={Trophy}
              action={<span className="text-xs text-muted-foreground">Cliquez pour inspecter</span>}
            >
              <div className="space-y-2.5">
                {artists.slice(0, 5).map((a, i) => (
                  <div
                    key={a.email}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectArtist?.(a.email)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectArtist?.(a.email);
                      }
                    }}
                    className="group flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/60 hover:border-primary/40 transition-all cursor-pointer"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-gold text-black font-display font-bold text-xs">
                      {i + 1}
                    </span>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary border border-border font-display font-bold text-sm">
                      {a.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                          {a.name}
                        </span>
                        {i === 0 && (
                          <span className="inline-flex items-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0 text-[9px] font-bold uppercase shrink-0">
                            TOP
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {a.releases} sortie{a.releases > 1 ? "s" : ""} · {a.tracks} titre{a.tracks > 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-semibold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                        {formatFCFA(a.revenue)}
                      </div>
                      <div
                        className="flex gap-1 mt-1 justify-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {a.pending > 0 && (
                          <StatusBadge
                            kind="pending"
                            label={`${a.pending} attente`}
                            title="Voir les projets en attente de cet artiste"
                            onClick={() => onSelectArtist?.(a.email, "pending")}
                          />
                        )}
                        {a.approved > 0 && (
                          <StatusBadge
                            kind="approved"
                            label={`${a.approved} approuvé`}
                            title="Voir les projets approuvés de cet artiste"
                            onClick={() => onSelectArtist?.(a.email, "approved")}
                          />
                        )}
                        {a.delivered > 0 && (
                          <StatusBadge
                            kind="delivered"
                            label={`${a.delivered} livré`}
                            title="Voir les projets livrés de cet artiste"
                            onClick={() => onSelectArtist?.(a.email, "delivered")}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="mt-4">
            <SectionCard title="Performance par artiste" icon={BarChart3}>
              <div className="space-y-3">
                {artists.map((a) => {
                  const maxRev = Math.max(...artists.map((x) => x.revenue), 1);
                  return (
                    <button
                      key={a.email}
                      type="button"
                      onClick={() => onSelectArtist?.(a.email)}
                      className="w-full text-left p-2 rounded-xl hover:bg-secondary/50 transition-colors group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {a.name}
                        </span>
                        <span className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                          {formatFCFA(a.revenue)}
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-gold" style={{ width: `${Math.max(6, (a.revenue / maxRev) * 100)}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          </div>

          <div className="mt-4">
            <SectionCard
              title="Tous les artistes en production"
              icon={Users}
              action={<span className="text-xs text-muted-foreground">{artists.length} au total</span>}
            >
              {/* Mobile Artist Cards (< sm) */}
              <div className="sm:hidden space-y-2.5">
                {artists.map((a) => (
                  <div
                    key={a.email}
                    onClick={() => onSelectArtist?.(a.email)}
                    className="rounded-xl border border-border bg-secondary/20 hover:border-primary/40 p-3.5 space-y-2.5 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary border border-border font-display font-bold text-xs">
                          {a.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">{a.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{a.email}</div>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-sm text-gradient-gold shrink-0">
                        {formatFCFA(a.revenue)}
                      </div>
                    </div>

                    <div
                      className="flex flex-wrap gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {a.pending > 0 && (
                        <StatusBadge
                          kind="pending"
                          label={`${a.pending} en attente`}
                          onClick={() => onSelectArtist?.(a.email, "pending")}
                        />
                      )}
                      {a.approved > 0 && (
                        <StatusBadge
                          kind="approved"
                          label={`${a.approved} approuvé`}
                          onClick={() => onSelectArtist?.(a.email, "approved")}
                        />
                      )}
                      {a.delivered > 0 && (
                        <StatusBadge
                          kind="delivered"
                          label={`${a.delivered} livré`}
                          onClick={() => onSelectArtist?.(a.email, "delivered")}
                        />
                      )}
                    </div>

                    <div
                      className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs text-muted-foreground"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>{a.city || "Cotonou, Bénin"}</span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => onSelectArtist?.(a.email)}
                          className="h-7 px-2.5 rounded-lg text-xs gap-1"
                        >
                          <Eye className="h-3 w-3 text-primary" /> Infos
                        </Button>
                        {onAddProductionArtist && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => onAddProductionArtist(a.email)}
                            className="h-7 px-2.5 rounded-lg text-xs gap-1 text-primary border-primary/30"
                          >
                            <Plus className="h-3 w-3" /> Sortie
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table (sm+) */}
              <div className="hidden sm:block overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left font-medium px-3 py-2.5">Artiste</th>
                      <th className="text-left font-medium px-3 py-2.5">Ville</th>
                      <th className="text-left font-medium px-3 py-2.5 hidden md:table-cell">Statuts des sorties</th>
                      <th className="text-right font-medium px-3 py-2.5">Sorties</th>
                      <th className="text-right font-medium px-3 py-2.5">Titres</th>
                      <th className="text-right font-medium px-3 py-2.5">Revenus</th>
                      <th className="text-right font-medium px-3 py-2.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {artists.map((a) => (
                      <tr
                        key={a.email}
                        onClick={() => onSelectArtist?.(a.email)}
                        className="hover:bg-secondary/30 transition-colors cursor-pointer"
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary border border-border font-display font-bold text-xs">
                              {a.name.slice(0, 2).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{a.name}</div>
                              <div className="text-xs text-muted-foreground truncate">{a.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">{a.city || "—"}</td>
                        <td
                          className="px-3 py-3 hidden md:table-cell"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex flex-wrap gap-1.5">
                            {a.pending > 0 && (
                              <StatusBadge
                                kind="pending"
                                label={`${a.pending} en attente`}
                                onClick={() => onSelectArtist?.(a.email, "pending")}
                              />
                            )}
                            {a.approved > 0 && (
                              <StatusBadge
                                kind="approved"
                                label={`${a.approved} approuvé`}
                                onClick={() => onSelectArtist?.(a.email, "approved")}
                              />
                            )}
                            {a.delivered > 0 && (
                              <StatusBadge
                                kind="delivered"
                                label={`${a.delivered} livré`}
                                onClick={() => onSelectArtist?.(a.email, "delivered")}
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-medium">{a.releases}</td>
                        <td className="px-3 py-3 text-right font-mono text-muted-foreground">{a.tracks}</td>
                        <td className="px-3 py-3 text-right font-mono font-semibold text-gradient-gold">
                          {formatFCFA(a.revenue)}
                        </td>
                        <td
                          className="px-3 py-3 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => onSelectArtist?.(a.email)}
                              className="h-8 px-2.5 rounded-lg text-xs gap-1"
                            >
                              <Eye className="h-3.5 w-3.5 text-primary" />
                              <span>Infos</span>
                            </Button>
                            {onAddProductionArtist && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => onAddProductionArtist(a.email)}
                                className="h-8 px-2.5 rounded-lg text-xs gap-1 text-primary border-primary/30 hover:bg-primary/10"
                                title="Ajouter un nouveau projet en production pour cet artiste"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Sortie</span>
                              </Button>
                            )}
                          </div>
                        </td>
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
