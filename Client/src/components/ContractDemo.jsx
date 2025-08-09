import React, { useState } from 'react';
import { getContractBy, getAddressBy } from '../lib/ethers';
import { toast } from 'react-hot-toast';

export default function ContractDemo() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [fn, setFn] = useState('name'); // default example

  const callRead = async () => {
    setLoading(true);
    setResult('');
    try {
      const contract = await getContractBy('EVENT_MANAGER', true);
      if (!fn) throw new Error('Enter a read-only function name (no args).');
      const res = await contract[fn]();
      setResult(typeof res === 'object' ? JSON.stringify(res) : String(res));
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Read call failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 p-4 rounded-lg border border-zinc-700/50 bg-zinc-900/40">
      <h2 className="text-lg font-semibold">Contract Demo (EVENT_MANAGER)</h2>
      <p className="text-sm text-zinc-400">Address: <span className="font-mono text-zinc-200">{getAddressBy('EVENT_MANAGER')}</span></p>

      <div className="flex items-center gap-2">
        <input
          className="px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm w-56"
          placeholder="read fn (no args), e.g. name"
          value={fn}
          onChange={(e) => setFn(e.target.value)}
        />
        <button
          onClick={callRead}
          disabled={loading}
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm"
        >
          {loading ? 'Reading…' : 'Read'}
        </button>
      </div>

      {result && (
        <pre className="mt-2 text-xs p-3 bg-black/40 rounded border border-zinc-700 overflow-auto max-h-56">
{result}
        </pre>
      )}

      <p className="text-xs text-zinc-500">
        Tip: Once you paste your ABI and set the address in <code>src/constants/</code>, try common view functions like <code>name</code>, <code>symbol</code>, <code>owner</code>, or custom getters.
      </p>
    </div>
  );
}
