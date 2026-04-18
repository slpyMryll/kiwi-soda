import { FaqFab } from "@/app/components/ui/FaqFab";

export default function ViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <FaqFab />
    </>
  );
}
