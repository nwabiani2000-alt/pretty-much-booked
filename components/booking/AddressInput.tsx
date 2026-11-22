"use client";

const MOCK_LOCATION = "42 Curtain Road, Shoreditch, London EC2A 3NH";

type AddressInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function AddressInput({ value, onChange }: AddressInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-brand-dark" htmlFor="address">
        Address
      </label>
      <input
        id="address"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Where should your pro meet you?"
        className="h-12 w-full rounded-2xl border-0 bg-white px-4 text-sm text-brand-dark shadow-sm ring-1 ring-brand-purple/10 placeholder:text-brand-dark/40 outline-none focus:ring-2 focus:ring-brand-purple/40"
      />
      <button
        type="button"
        onClick={() => onChange(MOCK_LOCATION)}
        className="text-sm font-semibold text-brand-purple"
      >
        Use my location
      </button>
    </div>
  );
}
