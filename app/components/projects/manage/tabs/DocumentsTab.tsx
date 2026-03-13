import { Upload, FileText, Download } from "lucide-react";

export function DocumentsTab() {
  const docs = [1, 2, 3, 4, 5];

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#F0F7FF] border-2 border-dashed border-blue-400 rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-colors hover:bg-blue-50/50 cursor-pointer">
        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
          <Upload className="w-5 h-5 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Upload Documents
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Drag and drop files here, or click to browse
        </p>
        <button className="bg-[#1B4332] hover:bg-green-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm mb-3">
          Browse Files
        </button>
        <p className="text-[10px] text-gray-400 font-medium">
          Supported formats: PDF, DOC, DOCX, XLS, XLSX (Max 50MB)
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Project Documents
            </h2>
            <p className="text-sm font-bold text-gray-900 mt-1">
              Documents (5)
            </p>
          </div>
          <button className="text-xs font-semibold text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Sort by Date
          </button>
        </div>

        <div className="space-y-3">
          {docs.map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors bg-white"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    Project Proposal.pdf
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">
                    Uploaded by Sarah Chen • 8/10/2025
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">2.4 MB</p>
                </div>
              </div>
              <button className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-2 rounded-lg text-xs font-semibold transition-colors">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
