import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function AnnouncePage() {
  const [token,       setToken]       = useState('');
  const [subject,     setSubject]     = useState('');
  const [message,     setMessage]     = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [reportUrl,   setReportUrl]   = useState('');
  const [ticker,      setTicker]      = useState('');
  const [status,      setStatus]      = useState('idle'); // idle | sending | done | error
  const [result,      setResult]      = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setResult(null);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message, reportTitle, reportUrl, ticker, token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setResult(data.error || 'Unknown error');
      } else {
        setStatus('done');
        setResult(data);
      }
    } catch (err) {
      setStatus('error');
      setResult(err.message);
    }
  };

  const inputCls = 'w-full bg-neutral-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-600 text-sm outline-none focus:border-gray-500 transition';
  const labelCls = 'block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5';

  return (
    <>
      <Head><title>Send Announcement · AWR Admin</title></Head>

      <div className="min-h-screen bg-neutral-950 flex items-start justify-center px-4 py-16">
        <div className="w-full max-w-xl">

          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition">
              ← atlanticwalkresearch.com
            </Link>
            <h1 className="text-2xl font-bold text-white mt-4">Send Announcement</h1>
            <p className="text-gray-500 text-sm mt-1">
              Compose an email and send it to all newsletter subscribers via Resend.
            </p>
          </div>

          {status === 'done' ? (
            <div className="bg-neutral-900 border border-gray-800 rounded-xl p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white font-semibold text-lg">Sent successfully</p>
              <p className="text-gray-400 text-sm">
                Delivered to <span className="text-white font-medium">{result?.sent}</span> of{' '}
                <span className="text-white font-medium">{result?.total}</span> subscribers.
              </p>
              <button
                onClick={() => { setStatus('idle'); setResult(null); }}
                className="mt-2 text-sm text-gray-500 hover:text-gray-300 transition underline"
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="bg-neutral-900 border border-gray-800 rounded-xl p-8 space-y-5">

              {/* Admin token */}
              <div>
                <label className={labelCls}>Admin password</label>
                <input type="password" value={token} onChange={e => setToken(e.target.value)}
                  placeholder="SEND_EMAIL_SECRET" required className={inputCls} />
              </div>

              <div className="border-t border-gray-800" />

              {/* Subject */}
              <div>
                <label className={labelCls}>Subject line <span className="text-red-500">*</span></label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="New Research: Ouster, Inc. — Position Close" required className={inputCls} />
              </div>

              {/* Message */}
              <div>
                <label className={labelCls}>Message <span className="text-gray-600">(optional)</span></label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
                  placeholder="A short note to subscribers…"
                  className={inputCls + ' resize-none'} />
              </div>

              <div className="border-t border-gray-800" />

              {/* Report details */}
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Report link (optional)</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Ticker</label>
                  <input type="text" value={ticker} onChange={e => setTicker(e.target.value)}
                    placeholder="NASDAQ: OUST" className={inputCls} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className={labelCls}>Report title</label>
                  <input type="text" value={reportTitle} onChange={e => setReportTitle(e.target.value)}
                    placeholder="Position Close — Thesis Intact, Valuation Extended" className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Report URL</label>
                  <input type="url" value={reportUrl} onChange={e => setReportUrl(e.target.value)}
                    placeholder="https://atlanticwalkresearch.com/research/OUSTCLOSE" className={inputCls} />
                </div>
              </div>

              {status === 'error' && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  {typeof result === 'string' ? result : 'Something went wrong. Check the token and try again.'}
                </p>
              )}

              <button type="submit" disabled={status === 'sending'}
                className="w-full py-3 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition"
                style={{ background: 'linear-gradient(135deg,#3f3f46 0%,#27272a 60%,#18181b 100%)' }}>
                {status === 'sending' ? 'Sending…' : 'Send to all subscribers'}
              </button>

            </form>
          )}
        </div>
      </div>
    </>
  );
}
