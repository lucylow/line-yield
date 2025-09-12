import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Testing KAIA API credentials...');
    
    // Get KAIA credentials from secrets
    const dappId = Deno.env.get('KAIA_DAPP_ID');
    const dappName = Deno.env.get('KAIA_DAPP_NAME');
    const clientId = Deno.env.get('KAIA_CLIENT_ID');
    const clientSecret = Deno.env.get('KAIA_CLIENT_SECRET');

    console.log('Retrieved credentials:', {
      dappId: dappId ? '***' + dappId.slice(-4) : 'missing',
      dappName,
      clientId: clientId ? '***' + clientId.slice(-4) : 'missing',
      clientSecret: clientSecret ? '***' + clientSecret.slice(-4) : 'missing'
    });

    // Check if all credentials are present
    if (!dappId || !dappName || !clientId || !clientSecret) {
      const missing = [];
      if (!dappId) missing.push('KAIA_DAPP_ID');
      if (!dappName) missing.push('KAIA_DAPP_NAME');
      if (!clientId) missing.push('KAIA_CLIENT_ID');
      if (!clientSecret) missing.push('KAIA_CLIENT_SECRET');
      
      throw new Error(`Missing credentials: ${missing.join(', ')}`);
    }

    // Test KAIA blockchain RPC connection
    console.log('Testing Kaia blockchain RPC connection...');
    const rpcResponse = await fetch('https://public-en-cypress.klaytn.net', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'klay_clientVersion',
        params: [],
        id: 1
      })
    });

    const rpcData = await rpcResponse.json();
    console.log('RPC response:', rpcData);

    // Test with a simple chain info call
    const chainInfoResponse = await fetch('https://public-en-cypress.klaytn.net', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'klay_blockNumber',
        params: [],
        id: 2
      })
    });

    const chainInfo = await chainInfoResponse.json();
    console.log('Chain info response:', chainInfo);

    // Prepare test results
    const results = {
      success: true,
      message: 'KAIA API credentials loaded successfully',
      credentials: {
        dappId: dappId ? `${dappId.substring(0, 6)}...${dappId.slice(-4)}` : null,
        dappName,
        clientId: clientId ? `${clientId.substring(0, 8)}...${clientId.slice(-4)}` : null,
        clientSecret: clientSecret ? `${clientSecret.substring(0, 8)}...${clientSecret.slice(-4)}` : null
      },
      rpcTest: {
        success: rpcData && !rpcData.error,
        clientVersion: rpcData?.result || 'Unknown',
        currentBlock: chainInfo?.result ? parseInt(chainInfo.result, 16) : 'Unknown'
      },
      timestamp: new Date().toISOString()
    };

    console.log('Test results:', results);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('KAIA API test failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});