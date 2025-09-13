import React, { useState } from 'react';
import { useSecureApi } from '@/hooks/useSecureApi';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

/**
 * SecureTransactionExample Component
 * 
 * This component demonstrates the secure implementation of transactions
 * using the backend API for signing and frontend for user interaction.
 * 
 * Key Security Features:
 * - Private keys never exposed to frontend
 * - All sensitive operations handled by backend
 * - User signature verification for authentication
 * - Rate limiting and input validation
 * - Comprehensive error handling
 */
export const SecureTransactionExample: React.FC = () => {
  const { wallet, connectWallet } = useWallet();
  const {
    isLoading,
    error,
    createDepositTransaction,
    createWithdrawTransaction,
    getUserNonce,
    getWalletInfo,
    healthCheck,
    broadcastTransaction,
    waitForConfirmation,
    clearError
  } = useSecureApi();

  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [userNonce, setUserNonce] = useState<number | null>(null);
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      // 1. Create and sign transaction on backend
      const signedTx = await createDepositTransaction(amount);
      
      // 2. Broadcast to network
      const hash = await broadcastTransaction(signedTx.signedTx);
      setTxHash(hash);
      
      // 3. Wait for confirmation (optional)
      // await waitForConfirmation(hash, 1);
      
      console.log('Deposit successful:', hash);
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      // 1. Create and sign transaction on backend
      const signedTx = await createWithdrawTransaction(amount);
      
      // 2. Broadcast to network
      const hash = await broadcastTransaction(signedTx.signedTx);
      setTxHash(hash);
      
      console.log('Withdraw successful:', hash);
    } catch (error) {
      console.error('Withdraw failed:', error);
    }
  };

  const handleGetNonce = async () => {
    if (!wallet.isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const nonce = await getUserNonce(wallet.address);
      setUserNonce(nonce.nonce);
    } catch (error) {
      console.error('Failed to get nonce:', error);
    }
  };

  const handleGetWalletInfo = async () => {
    try {
      const info = await getWalletInfo();
      setWalletInfo(info);
    } catch (error) {
      console.error('Failed to get wallet info:', error);
    }
  };

  const handleHealthCheck = async () => {
    try {
      const health = await healthCheck();
      setHealthStatus(health);
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Secure Transaction Example
        </h1>
        <p className="text-gray-600">
          Demonstrating secure implementation with backend signing and frontend interaction
        </p>
      </div>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              🔒 Secure Implementation
            </Badge>
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">✅</div>
              <div className="font-medium text-green-800">Private Keys</div>
              <div className="text-sm text-green-600">Backend Only</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">✅</div>
              <div className="font-medium text-green-800">Service Role</div>
              <div className="text-sm text-green-600">Backend Only</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">✅</div>
              <div className="font-medium text-green-800">Anon Key</div>
              <div className="text-sm text-green-600">Frontend Safe</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Connection */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Connection</CardTitle>
          <CardDescription>
            Connect your wallet to interact with the secure API
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!wallet.isConnected ? (
            <Button onClick={connectWallet} className="w-full">
              Connect Wallet
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-800">Connected Wallet</div>
                <div className="text-sm text-blue-600 font-mono">
                  {wallet.address}
                </div>
                <div className="text-sm text-blue-600">
                  Balance: {wallet.balance} ETH
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleGetNonce} variant="outline" disabled={isLoading}>
                  Get User Nonce
                </Button>
                <Button onClick={handleGetWalletInfo} variant="outline" disabled={isLoading}>
                  Get Wallet Info
                </Button>
                <Button onClick={handleHealthCheck} variant="outline" disabled={isLoading}>
                  Health Check
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Secure Transaction Operations</CardTitle>
          <CardDescription>
            All transactions are signed securely on the backend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="number"
              placeholder="Amount (USDC)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleDeposit} 
              disabled={isLoading || !wallet.isConnected}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Processing...' : 'Deposit'}
            </Button>
            <Button 
              onClick={handleWithdraw} 
              disabled={isLoading || !wallet.isConnected}
              variant="outline"
            >
              {isLoading ? 'Processing...' : 'Withdraw'}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error}
                <Button 
                  onClick={clearError} 
                  variant="link" 
                  className="ml-2 p-0 h-auto"
                >
                  Clear
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Status Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Nonce */}
        <Card>
          <CardHeader>
            <CardTitle>User Nonce</CardTitle>
            <CardDescription>
              Transaction ordering for security
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userNonce !== null ? (
              <div className="text-2xl font-mono text-blue-600">
                {userNonce}
              </div>
            ) : (
              <div className="text-gray-500">
                Click "Get User Nonce" to retrieve
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wallet Info */}
        <Card>
          <CardHeader>
            <CardTitle>Backend Wallet Info</CardTitle>
            <CardDescription>
              Relayer wallet information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {walletInfo ? (
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Address:</span>
                  <div className="font-mono text-xs break-all">
                    {walletInfo.address}
                  </div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Balance:</span> {walletInfo.balance} ETH
                </div>
                <div className="text-sm">
                  <span className="font-medium">Network:</span> {walletInfo.network}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                Click "Get Wallet Info" to retrieve
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Hash */}
      {txHash && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Transaction</CardTitle>
            <CardDescription>
              Transaction hash from the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-mono text-sm break-all">
                {txHash}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                View on block explorer: 
                <a 
                  href={`https://baobab.klaytnscope.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1"
                >
                  Open
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Status */}
      {healthStatus && (
        <Card>
          <CardHeader>
            <CardTitle>API Health Status</CardTitle>
            <CardDescription>
              Backend service health check
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={healthStatus.status === 'healthy' ? 'default' : 'destructive'}>
                  {healthStatus.status}
                </Badge>
                <span className="text-sm text-gray-600">
                  {new Date(healthStatus.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Wallet:</span> {healthStatus.walletAddress}
              </div>
              <div className="text-sm">
                <span className="font-medium">Balance:</span> {healthStatus.balance} ETH
              </div>
              <div className="text-sm">
                <span className="font-medium">Network:</span> {healthStatus.network}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Information */}
      <Card>
        <CardHeader>
          <CardTitle>Security Implementation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-800 mb-2">✅ Secure Practices</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Private keys stored in backend only</li>
                <li>• Service role keys never exposed to frontend</li>
                <li>• User signature verification for authentication</li>
                <li>• Rate limiting on all endpoints</li>
                <li>• Input validation and sanitization</li>
                <li>• HTTPS for all API communication</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-800 mb-2">❌ Security Risks Avoided</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• No private keys in frontend code</li>
                <li>• No service role keys in client</li>
                <li>• No sensitive credentials in version control</li>
                <li>• No unvalidated user input</li>
                <li>• No unencrypted sensitive data</li>
                <li>• No insecure API endpoints</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureTransactionExample;


