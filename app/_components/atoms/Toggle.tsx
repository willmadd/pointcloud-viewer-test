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

      <div
        className=" relative h-5 w-9 rounded-full bg-gray-300 transition-colors peer-checked:bg-violet-700 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4  after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:after:translate-x-4
        "
      />

      <span className="ml-3 text-sm font-medium">{label}</span>
    </label>
  );
}
