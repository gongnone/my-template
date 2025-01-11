export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#1F2023]">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
} 