interface FanClub {
  id: string;
  name: string;
  member_count: number;
  is_free: boolean;
  price: number | null;
  accent_color: string | null;
  site_name: string | null;
}

export function FanClubsSection({ fanClubs }: { fanClubs: FanClub[] }) {
  if (fanClubs.length === 0) {
    return (
      <section className="py-8">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Fan clubs
        </h2>
        <p className="text-[13px] text-gray-400 italic">
          Create your first fan club to start earning
        </p>
      </section>
    );
  }

  return (
    <section className="py-8">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-4">
        Fan clubs
      </h2>
      <div className="space-y-2">
        {fanClubs.map((club) => (
          <div key={club.id} className="flex items-center gap-3 py-3 px-4 rounded-xl border border-gray-100">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: club.accent_color ?? "#0C447C" }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#0A1628] truncate">{club.name}</p>
              {club.site_name && <p className="text-[12px] text-gray-400">{club.site_name}.fan</p>}
            </div>
            <span className="text-[12px] text-gray-400 shrink-0">
              {club.member_count} members
            </span>
            <span className={`text-[12px] font-medium shrink-0 ${club.is_free ? "text-gray-400" : "text-green-600"}`}>
              {club.is_free ? "Free" : `€${Number(club.price).toFixed(0)}/mo`}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
