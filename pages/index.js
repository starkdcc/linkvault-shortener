import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShortUrl('');

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ originalUrl: url }),
      });

      const data = await response.json();

      if (response.ok) {
        setShortUrl(data.data.shortUrl);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      alert('Copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shortUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Copied to clipboard!');
    }
  };

  return (
    <>
      <Head>
        <title>LinkPay - Premium URL Shortener | Earn Money from Your Links</title>
        <meta name="description" content="Shorten URLs and earn money with high CPM ads, crypto payments, and premium features. Start monetizing your links today!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-indigo-600">LinkPay</h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <a href="/auth/signin" className="text-gray-500 hover:text-gray-900">
                  Sign In
                </a>
                <a href="/auth/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                  Get Started
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {/* Hero Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Shorten Links,</span>
                <span className="block text-indigo-600">Earn Money</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Premium URL shortener with high CPM ads, crypto payments, and real-time analytics. 
                Start monetizing your links today with up to $50 CPM rates.
              </p>
            </div>

            {/* URL Shortener Form */}
            <div className="mt-10 max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-xl p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                      Enter your long URL
                    </label>
                    <div className="mt-1">
                      <input
                        type="url"
                        id="url"
                        name="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/very-long-url"
                        className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Shortening...' : 'Shorten URL & Start Earning'}
                    </button>
                  </div>
                </form>

                {shortUrl && (
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-800">Your shortened URL:</p>
                        <p className="text-sm text-green-600 break-all">{shortUrl}</p>
                      </div>
                      <button
                        onClick={copyToClipboard}
                        className="ml-4 flex-shrink-0 bg-green-100 text-green-800 px-3 py-1 rounded text-sm hover:bg-green-200"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="mt-16 grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-indigo-100 rounded-full p-3 w-12 h-12 mx-auto flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">High CPM Earnings</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Earn up to $50 per 1000 clicks with premium ad networks and crypto-focused audiences.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-indigo-100 rounded-full p-3 w-12 h-12 mx-auto flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Crypto Payments</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Get paid in Bitcoin, Ethereum, USDT, or traditional PayPal/bank transfers.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-indigo-100 rounded-full p-3 w-12 h-12 mx-auto flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Lightning Fast</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Edge-powered redirects ensure your links load instantly worldwide.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-16 bg-indigo-600 rounded-lg">
              <div className="px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold text-white">$1M+</div>
                    <div className="text-indigo-200">Paid to Users</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">10M+</div>
                    <div className="text-indigo-200">Links Created</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">99.9%</div>
                    <div className="text-indigo-200">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                © 2024 LinkPay. Made with ❤️ for maximum earnings.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}