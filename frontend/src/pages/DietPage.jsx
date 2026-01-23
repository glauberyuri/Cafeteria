import { DietsProvider } from '@/contexts/DietContext';
import DietContent from '@/components/diets/DietContent';

export default function SectorsPage() {
  return (
    <DietsProvider>
      <DietContent />
    </DietsProvider>
  );
}
