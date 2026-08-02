"use client";

import { useRouter } from "next/navigation";
import type { VisaPassport } from "../lib/api";

export default function PassportSelect({
  passports,
  selected,
}: {
  passports: VisaPassport[];
  selected: string;
}) {
  const router = useRouter();

  return (
    <label className="passport-select">
      Visa requirements for a
      <select
        value={selected}
        onChange={(e) => router.push(`/travel-advisories?passport=${e.target.value}`)}
      >
        {passports.map((p) => (
          <option key={p.code} value={p.code}>
            {p.name}
          </option>
        ))}
      </select>
      passport:
    </label>
  );
}
