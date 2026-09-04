export default function SpecRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-line px-4 py-3 last:border-b-0">
      <span className="text-sm text-mute">{label}</span>
      <span className="font-mono text-sm text-paper">{value}</span>
    </div>
  );
}
