import { SectorProvider } from '@/contexts/SectorContext';
import SectorsContent from '@/components/sectors/SectorsContent';

export default function SectorsPage() {
  return (
    <SectorProvider>
      <SectorsContent />
    </SectorProvider>
  );
}
