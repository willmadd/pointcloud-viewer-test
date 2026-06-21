type Props = {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  label?: string;
};

export default function Toggle({
  enabled,
  setEnabled,
  label = "Toggle",
}: Props) {
  return (
    <label className="flex cursor-pointer items-center">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => setEnabled(e.target.checked)}
        className="peer sr-only"
      />

      <div className="relative h-5 w-9 rounded-full bg-zinc-700 transition-colors peer-checked:bg-white  after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4  after:rounded-full after:bg-zinc-400 after:transition-transform after:content-[''] peer-checked:after:translate-x-4 peer-checked:after:bg-zinc-900" />

      <span className="ml-3 text-sm font-medium text-zinc-300">{label}</span>
    </label>
  );
}
