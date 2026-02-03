"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FamilyNameInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  placeholder?: string;
  label?: string;
  type?: string;
  id?: string;
  className?: string;
};

export default function FamilyNameInput({
  value,
  onChange,
  name,
  placeholder,
  type = "text",
  label,
  id,
  className,
}: FamilyNameInputProps) {
  return (
    <div className={className}>
      <Label htmlFor={id || name} className="mb-1 capitalize">
        {label || name}
      </Label>
      <Input
        id={id || name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        required
        onChange={onChange}
      />
    </div>
  );
}
