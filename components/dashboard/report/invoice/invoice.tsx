'use client'

export default function Invoice() {
  const invoiceNumber = 1300
  const invoiceDate = new Date().toLocaleDateString()

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white shadow-lg">
        {/* Header */}
        <div className="border-b-4 border-amber-300 p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-amber-400 mb-2">
                COMPANY NAME
              </h1>
              <p className="text-sm text-gray-600 max-w-md">
                We aim to provide the best service in financing and business
                transactions.
              </p>
            </div>
            <div className="text-right text-xs text-gray-600">
              <p>Address: B-11 Mahal Market, Laldighi West Side, Chattogram</p>
              <p>Phone: +1-234-567-8900</p>
            </div>
          </div>

          {/* Invoice Info */}
          <div>
            <div className="pb-5 flex gap-2 text-sm">
              <span className="text-gray-600">Invoice No:</span>
              <p className="font-semibold">{invoiceNumber}</p>
            </div>
            <div className="flex text-sm justify-between gap-4 pb-2">
              <div className="flex gap-2 flex-1 min-w-0">
                <span className="text-gray-600">Name:</span>
                <p className="font-semibold border-b border-gray-400 flex-1 min-w-0">
                  Soiod Ikhtiar Uddin Mohammad Bin Bakhtiar Khilji
                </p>
              </div>
              <div className="flex gap-2 min-w-0">
                <span className="text-gray-600">Date:</span>
                <p className="font-semibold border-b border-gray-400 min-w-[80px]">
                  {invoiceDate}
                </p>
              </div>
            </div>

            <div className="flex text-sm justify-between gap-4">
              <div className="flex gap-2 flex-1 min-w-0">
                <span className="text-gray-600">Address:</span>
                <p className="font-semibold border-b border-gray-400 flex-1 min-w-0">
                  B-11 Mahal Market, Laldighi West Side, Chattogram
                </p>
              </div>
              <div className="flex gap-2 min-w-0">
                <span className="text-gray-600">Phone:</span>
                <p className="font-semibold border-b border-gray-400 min-w-[100px]">
                  +1-234-567-8900
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-amber-300">
                <th className="border border-gray-300 text-black px-4 py-3 text-left w-12">
                  S.No
                </th>
                <th className="border border-gray-300 text-black px-4 py-3 text-left">
                  Description
                </th>
                <th className="border border-gray-300 text-black px-4 py-3 text-center w-24">
                  Quantity
                </th>
                <th className="border border-gray-300 text-black px-4 py-3 text-center w-24">
                  Rate
                </th>
                <th className="border border-gray-300 text-black px-4 py-3 text-right w-24">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(10)].map((_, index) => (
                <tr key={index + 1}>
                  <td className="border border-gray-300 px-4 py-4 text-center font-semibold text-black">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 text-black px-4"></td>
                  <td className="border border-gray-300 text-black px-4"></td>
                  <td className="border border-gray-300 text-black px-4"></td>
                  <td className="border border-gray-300 text-black px-4"></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Section */}
          <div className="mt-6 grid grid-cols-5 gap-2">
            <div className="col-span-3"></div>
            <div className="border border-gray-300 bg-yellow-50">
              <div className="px-4 py-2 font-semibold text-sm text-gray-700">
                Total
              </div>
            </div>
            <div className="border border-gray-300">
              <div className="px-4 py-2"></div>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-5 gap-2">
            <div className="col-span-3"></div>
            <div className="border border-gray-300 bg-yellow-50">
              <div className="px-4 py-2 font-semibold text-sm text-gray-700">
                Discount
              </div>
            </div>
            <div className="border border-gray-300">
              <div className="px-4 py-2"></div>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-5 gap-2">
            <div className="col-span-3"></div>
            <div className="border-2 border-amber-300 bg-amber-300">
              <div className="px-4 py-2 font-bold text-black">Grand Total</div>
            </div>
            <div className="border-2 border-amber-300">
              <div className="px-4 py-2 font-bold"></div>
            </div>
          </div>
          <div className="pt-5">
            <p>In words:</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 p-8 text-xs text-gray-600">
          <div className="grid grid-cols-3 gap-8 mt-8">
            <div>
              <p className="border-t border-gray-400 pt-2 text-center">
                Customer Signature
              </p>
            </div>
            <div></div>
            <div>
              <p className="border-t border-gray-400 pt-2 text-center">
                Authorized Signature
              </p>
            </div>
          </div>

          <p className="text-center mt-6 text-gray-500 text-xs">
            Thank you for your business. Please keep this receipt for your
            records.
          </p>
        </div>
      </div>
    </div>
  )
}
