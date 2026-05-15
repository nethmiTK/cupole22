export default function AdminProfilePage() {
  return (
    <section className="p-6 md:p-10">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm border border-[#f0dfe7]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9b7f8a]">Admin Profile</p>
        <h1 className="mt-3 text-3xl font-bold text-[#4a2e39]">Profile</h1>
        <p className="mt-4 text-sm text-[#7d6873]">
          Use this area for admin account details, avatar, and personal settings.
        </p>
      </div>
    </section>
  );
}