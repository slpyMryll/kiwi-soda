import { Card } from "@/components/ui/card";

interface Props {
  title: string;
  value: string | number;
}

export function AdminStatCard({ title, value }: Props) {
  return (
    <Card className="p-4 sm:p-6 border-gray-100 shadow-sm rounded-xl flex flex-col justify-center min-h-[100px] sm:h-32 transition-all">
      <h3 className="text-xs sm:text-[13px] font-bold text-gray-900 mb-1 sm:mb-2">{title}</h3>
      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{value}</p>
    </Card>
  );
}