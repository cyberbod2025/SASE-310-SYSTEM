import React from "react";
import { useApp } from "../store";

const LoadingSpinner = () => (
  <div className="h-full w-full flex items-center justify-center p-10">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      <p className="text-gray-500 font-medium text-sm">Cargando módulo...</p>
    </div>
  </div>
);

const OfficialDocument = React.lazy(() =>
  import("./OfficialDocument").then((module) => ({
    default: module.OfficialDocument,
  })),
);

export const DocumentRenderer = () => {
  const { activePrintJob, students } = useApp();
  if (!activePrintJob) return null;

  const student = activePrintJob.studentId
    ? students.find((s) => s.id === activePrintJob.studentId)
    : undefined;

  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      <OfficialDocument
        type={activePrintJob.type}
        student={student}
        data={activePrintJob.data}
      />
    </React.Suspense>
  );
};
