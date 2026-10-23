import { computed, reactive } from 'vue';
import type { PrintPreset, PrintSections } from '../types';

export function usePrintReport() {
  const printSections = reactive<PrintSections>({
    overview: true,
    telemetry: true,
    diagnosis: true,
    financialStudy: true,
    commercialScript: false,
    pillars: true,
    consultantFooter: true,
  });

  const activeSectionsCount = computed(
    () => Object.values(printSections).filter(Boolean).length
  );

  function setPrintSections(sections: PrintSections): void {
    Object.assign(printSections, sections);
  }

  function applyPrintPreset(presetName: PrintPreset): void {
    switch (presetName) {
      case 'all':
        setPrintSections({
          overview: true,
          telemetry: true,
          diagnosis: true,
          financialStudy: true,
          commercialScript: true,
          pillars: true,
          consultantFooter: true,
        });
        break;
      case 'client':
        setPrintSections({
          overview: true,
          telemetry: true,
          diagnosis: true,
          financialStudy: true,
          commercialScript: false,
          pillars: true,
          consultantFooter: true,
        });
        break;
      case 'diagnosis_financial':
        setPrintSections({
          overview: true,
          telemetry: true,
          diagnosis: true,
          financialStudy: true,
          commercialScript: false,
          pillars: false,
          consultantFooter: true,
        });
        break;
      case 'commercial':
        setPrintSections({
          overview: true,
          telemetry: false,
          diagnosis: true,
          financialStudy: true,
          commercialScript: true,
          pillars: false,
          consultantFooter: true,
        });
        break;
      case 'technical':
        setPrintSections({
          overview: true,
          telemetry: true,
          diagnosis: true,
          financialStudy: false,
          commercialScript: false,
          pillars: true,
          consultantFooter: true,
        });
        break;
    }
  }

  function handlePrintReport(): void {
    setTimeout(() => {
      window.print();
    }, 150);
  }

  return {
    printSections,
    activeSectionsCount,
    setPrintSections,
    applyPrintPreset,
    handlePrintReport,
  };
}
