'use client';

interface Column {
  key: string;
  label: string;
}

interface CustomTableProps {
  columns: Column[];
  data: any[];
}

export default function CustomTable({
  columns,
  data,
}: CustomTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#E7D3DA] bg-white shadow-sm">
      
      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[750px] border-collapse">
          
          {/* HEADER */}
          <thead
            className="text-white"
            style={{
              background:
                'linear-gradient(180deg, #C41474 0%, #B50F69 100%)',
            }}
          >
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-sm font-semibold tracking-wide"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {data.length > 0 ? (
              data.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-[#F1E4E8] hover:bg-[#FFF7FA] transition-all duration-200"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-5 text-sm text-[#5C5C5C]"
                    >
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-14 text-center text-[#9B9095] text-sm"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}