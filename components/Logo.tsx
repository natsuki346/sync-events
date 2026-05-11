import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="inline-block">
      <span className="text-2xl font-bold tracking-tight text-fg">
        SYNC<span className="text-accent">.</span>
      </span>
    </Link>
  );
}
