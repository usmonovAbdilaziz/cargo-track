import { useId, useRef } from "react";
import { X } from "lucide-react";
import { formatFieldLabel } from "../utils/json-records";
import { StructuredValue } from "./structured-value";

export function RecordDetails({ record }: { record: object }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-md px-2 py-1 text-sm font-medium text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        aria-label="To‘liq yozuvni ko‘rish"
      >
        Ko‘rish
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-modal="true"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
        className="fixed inset-0 m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white p-0 text-slate-800 shadow-xl backdrop:bg-slate-950/50"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">To‘liq yozuv</h2>
            <p className="mt-1 text-sm text-slate-500">Yozuvning barcha ma’lumotlari</p>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            aria-label="Yopish"
          >
            <X size={20} />
          </button>
        </div>
        <div className="max-h-[calc(85vh-5rem)] overflow-y-auto px-5 py-4">
          <dl className="divide-y divide-slate-100">
            {Object.entries(record).map(([key, value]) => (
              <div key={key} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-4">
                <dt className="text-sm font-medium text-slate-500">{formatFieldLabel([key])}</dt>
                <dd className="min-w-0 break-words text-sm text-slate-800"><StructuredValue value={value} /></dd>
              </div>
            ))}
          </dl>
          <details className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <summary className="cursor-pointer font-medium text-slate-600">Asl JSON</summary>
            <pre className="mt-3 whitespace-pre-wrap break-all text-xs text-slate-700">{JSON.stringify(record, null, 2)}</pre>
          </details>
        </div>
      </dialog>
    </>
  );
}
