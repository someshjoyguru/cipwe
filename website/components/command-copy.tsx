"use client";

import { useState } from "react";

type CommandCopyProps = {
  command: string;
  className?: string;
};

export default function CommandCopy({ command, className }: CommandCopyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button onClick={handleCopy} className={className} type="button" aria-label={`Copy ${command}`}>
      {copied ? "Copied ✓" : command}
    </button>
  );
}
