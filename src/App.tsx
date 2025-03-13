import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Mail, Phone, Clock, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { Toaster, toast } from 'react-hot-toast';
import { supabase } from './lib/supabase';

function App() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySMS, setNotifySMS] = useState(false);
  const [notify10min, setNotify10min] = useState(true);
  const [nextMatch, setNextMatch] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchNextMatch();
  }, []);

  const fetchNextMatch = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          lineups (*)
        `)
        .gt('match_time', new Date().toISOString())
        .order('match_time')
        .limit(1)
        .maybeSingle(); // Use maybeSingle() instead of single()

      if (error) throw error;
      setNextMatch(data);
      setFetchError(null);
    } catch (error: any) {
      console.error('Error fetching next match:', error);
      setFetchError('Unable to load next match information');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email && !phone) {
      toast.error('Please provide either email or phone number');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{
          email,
          phone,
          timezone,
          notify_email: notifyEmail,
          notify_sms: notifySMS,
          notify_10min: notify10min,
        }]);

      if (error) throw error;

      toast.success('Successfully subscribed to match notifications!');
      setEmail('');
      setPhone('');
    } catch (error: any) {
      console.error('Error subscribing:', error);
      toast.error('Error subscribing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-[#11214d]">
      <Toaster position="top-center" />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Tottenham HotSam</h1>
          <p className="text-xl text-gray-300">Never miss a Spurs match again!</p>
        </div>

        {/* Next Match Card */}
        <div className="max-w-2xl mx-auto mb-12 bg-white rounded-lg shadow-xl p-6">
          {fetchError ? (
            <p className="text-red-600 text-center">{fetchError}</p>
          ) : nextMatch ? (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Next Match</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">
                    {nextMatch.home_away === 'home' 
                      ? `Tottenham vs ${nextMatch.opponent}`
                      : `${nextMatch.opponent} vs Tottenham`}
                  </p>
                  <p className="text-gray-600">{nextMatch.competition}</p>
                  <p className="text-gray-600">
                    {format(new Date(nextMatch.match_time), 'PPP p')}
                  </p>
                </div>
                <Shield className="w-12 h-12 text-blue-900" />
              </div>
            </>
          ) : (
            <p className="text-gray-600 text-center">No upcoming matches scheduled</p>
          )}
        </div>

        {/* Subscription Form */}
        <div className="max-w-xl mx-auto bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Subscribe to Match Notifications
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="tel"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="text-gray-700">Email notifications</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={notifySMS}
                  onChange={(e) => setNotifySMS(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="text-gray-700">SMS notifications</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={notify10min}
                  onChange={(e) => setNotify10min(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="text-gray-700">10-minute warning before matches</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 
                       transition duration-200 flex items-center justify-center space-x-2"
            >
              <Bell size={20} />
              <span>{loading ? 'Subscribing...' : 'Subscribe to Notifications'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;