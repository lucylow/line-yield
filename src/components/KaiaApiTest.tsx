import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2, Zap, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  success: boolean;
  message?: string;
  error?: string;
  credentials?: {
    dappId: string;
    dappName: string;
    clientId: string;
    clientSecret: string;
  };
  rpcTest?: {
    success: boolean;
    clientVersion: string;
    currentBlock: string | number;
  };
  timestamp: string;
}

export const KaiaApiTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const { toast } = useToast();

  const testKaiaApi = async () => {
    setTesting(true);
    try {
      console.log('Testing KAIA API...');
      
      const { data, error } = await supabase.functions.invoke('test-kaia-api', {
        body: {}
      });

      if (error) {
        throw new Error(error.message);
      }

      setResult(data);
      
      if (data.success) {
        toast({
          title: "KAIA API Test Successful",
          description: "All credentials are working correctly",
        });
      } else {
        toast({
          title: "KAIA API Test Failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResult({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Test Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          KAIA API Test
        </CardTitle>
        <CardDescription>
          Test your KAIA blockchain API credentials and connection
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button 
          onClick={testKaiaApi}
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing API Connection...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Test KAIA API
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={`font-semibold ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.success ? 'Test Passed' : 'Test Failed'}
              </span>
              <Badge variant={result.success ? "default" : "destructive"}>
                {new Date(result.timestamp).toLocaleTimeString()}
              </Badge>
            </div>

            {result.message && (
              <p className="text-sm text-muted-foreground">{result.message}</p>
            )}

            {result.error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-sm text-destructive font-medium">Error:</p>
                <p className="text-sm text-destructive">{result.error}</p>
              </div>
            )}

            {result.credentials && (
              <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm">Loaded Credentials:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">DApp ID:</span>
                    <br />
                    <code className="text-xs bg-background px-1 rounded">{result.credentials.dappId}</code>
                  </div>
                  <div>
                    <span className="text-muted-foreground">DApp Name:</span>
                    <br />
                    <code className="text-xs bg-background px-1 rounded">{result.credentials.dappName}</code>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Client ID:</span>
                    <br />
                    <code className="text-xs bg-background px-1 rounded">{result.credentials.clientId}</code>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Client Secret:</span>
                    <br />
                    <code className="text-xs bg-background px-1 rounded">{result.credentials.clientSecret}</code>
                  </div>
                </div>
              </div>
            )}

            {result.rpcTest && (
              <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm">Blockchain Connection Test:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">RPC Status:</span>
                    <br />
                    <Badge variant={result.rpcTest.success ? "default" : "destructive"} className="text-xs">
                      {result.rpcTest.success ? 'Connected' : 'Failed'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Client Version:</span>
                    <br />
                    <code className="text-xs bg-background px-1 rounded">{result.rpcTest.clientVersion}</code>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Current Block:</span>
                    <br />
                    <code className="text-xs bg-background px-1 rounded">{result.rpcTest.currentBlock}</code>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};