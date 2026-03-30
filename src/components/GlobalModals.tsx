import React from "react";
import { useApp } from "../store";

const LoadingSpinner = () => (
  <div className="h-full w-full flex items-center justify-center p-10">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      <p className="text-gray-500 font-medium text-sm">Cargando...</p>
    </div>
  </div>
);

const PrintPreviewModal = React.lazy(() =>
  import("./PrintPreviewModal").then((module) => ({
    default: module.PrintPreviewModal,
  })),
);

export const GlobalModals = () => {
  const { printModal, setPrintModal } = useApp();

  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      <PrintPreviewModal
        isOpen={printModal.isOpen}
        onClose={() => setPrintModal({ ...printModal, isOpen: false })}
        title={printModal.title}
        initialHtml={printModal.html}
      />
    </React.Suspense>
  );
};
