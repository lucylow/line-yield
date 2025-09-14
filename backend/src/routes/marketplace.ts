import express from 'express';
import { MarketplaceService } from '../services/marketplace-service';

const router = express.Router();
const marketplaceService = new MarketplaceService();

// NFT Marketplace routes
router.post('/nft/list', async (req, res) => {
  try {
    const { nftContract, tokenId, seller, price, fiatPrice, stablecoin } = req.body;
    
    if (!nftContract || !tokenId || !seller || !price || !fiatPrice || !stablecoin) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const item = await marketplaceService.listNFT(
      nftContract,
      tokenId,
      seller,
      price,
      fiatPrice,
      stablecoin
    );

    res.json({ success: true, item });
  } catch (error) {
    console.error('Error listing NFT:', error);
    res.status(500).json({ error: 'Failed to list NFT' });
  }
});

router.post('/nft/buy', async (req, res) => {
  try {
    const { itemId, buyer, stablecoin } = req.body;
    
    if (!itemId || !buyer || !stablecoin) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await marketplaceService.buyNFT(itemId, buyer, stablecoin);
    
    if (result.success) {
      res.json({ success: true, transactionHash: result.transactionHash });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error buying NFT:', error);
    res.status(500).json({ error: 'Failed to buy NFT' });
  }
});

router.post('/nft/cancel', async (req, res) => {
  try {
    const { itemId, seller } = req.body;
    
    if (!itemId || !seller) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await marketplaceService.cancelListing(itemId, seller);
    
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error cancelling listing:', error);
    res.status(500).json({ error: 'Failed to cancel listing' });
  }
});

router.post('/nft/update-price', async (req, res) => {
  try {
    const { itemId, seller, newPrice, newFiatPrice } = req.body;
    
    if (!itemId || !seller || !newPrice || !newFiatPrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await marketplaceService.updatePrice(itemId, seller, newPrice, newFiatPrice);
    
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error updating price:', error);
    res.status(500).json({ error: 'Failed to update price' });
  }
});

// In-app item routes
router.post('/in-app/create', async (req, res) => {
  try {
    const { name, description, imageUrl, cryptoPrice, fiatPrice, maxSupply, creator } = req.body;
    
    if (!name || !description || !cryptoPrice || !fiatPrice || !creator) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const item = await marketplaceService.createInAppItem(
      name,
      description,
      imageUrl,
      cryptoPrice,
      fiatPrice,
      maxSupply || 0,
      creator
    );

    res.json({ success: true, item });
  } catch (error) {
    console.error('Error creating in-app item:', error);
    res.status(500).json({ error: 'Failed to create in-app item' });
  }
});

router.post('/in-app/purchase-fiat', async (req, res) => {
  try {
    const { itemId, buyer, paymentId, stablecoin } = req.body;
    
    if (!itemId || !buyer || !paymentId || !stablecoin) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await marketplaceService.purchaseInAppItemWithFiat(
      itemId,
      buyer,
      paymentId,
      stablecoin
    );
    
    if (result.success) {
      res.json({ success: true, transactionHash: result.transactionHash });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error purchasing in-app item with fiat:', error);
    res.status(500).json({ error: 'Failed to purchase in-app item' });
  }
});

router.post('/in-app/purchase-crypto', async (req, res) => {
  try {
    const { itemId, buyer, stablecoin } = req.body;
    
    if (!itemId || !buyer || !stablecoin) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await marketplaceService.purchaseInAppItemWithCrypto(
      itemId,
      buyer,
      stablecoin
    );
    
    if (result.success) {
      res.json({ success: true, transactionHash: result.transactionHash });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error purchasing in-app item with crypto:', error);
    res.status(500).json({ error: 'Failed to purchase in-app item' });
  }
});

// LINE Payment routes
router.post('/payment/initiate', async (req, res) => {
  try {
    const { buyer, fiatAmount, currency, stablecoin } = req.body;
    
    if (!buyer || !fiatAmount || !currency || !stablecoin) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await marketplaceService.initiateLinePayment(
      buyer,
      fiatAmount,
      currency,
      stablecoin
    );
    
    if (result.success) {
      res.json({ success: true, paymentId: result.paymentId });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error initiating LINE payment:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

router.post('/payment/process', async (req, res) => {
  try {
    const { paymentId } = req.body;
    
    if (!paymentId) {
      return res.status(400).json({ error: 'Missing payment ID' });
    }

    const result = await marketplaceService.processLinePayment(paymentId);
    
    if (result.success) {
      res.json({ success: true, transactionHash: result.transactionHash });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

router.post('/payment/webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    
    const result = await marketplaceService.handleLineWebhook(webhookData);
    
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Failed to handle webhook' });
  }
});

// Exchange rate routes
router.post('/exchange-rate/update', async (req, res) => {
  try {
    const { currency, rate } = req.body;
    
    if (!currency || !rate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await marketplaceService.updateExchangeRate(currency, rate);
    
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error updating exchange rate:', error);
    res.status(500).json({ error: 'Failed to update exchange rate' });
  }
});

// View routes
router.get('/items', async (req, res) => {
  try {
    const { active } = req.query;
    
    let items;
    if (active === 'true') {
      items = marketplaceService.getActiveItems();
    } else {
      items = marketplaceService.getAllItems();
    }

    res.json({ success: true, items });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

router.get('/in-app-items', async (req, res) => {
  try {
    const { active } = req.query;
    
    let items;
    if (active === 'true') {
      items = marketplaceService.getActiveInAppItems();
    } else {
      items = marketplaceService.getAllInAppItems();
    }

    res.json({ success: true, items });
  } catch (error) {
    console.error('Error fetching in-app items:', error);
    res.status(500).json({ error: 'Failed to fetch in-app items' });
  }
});

router.get('/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const item = marketplaceService.getItem(itemId);
    
    if (item) {
      res.json({ success: true, item });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

router.get('/in-app-item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const item = marketplaceService.getInAppItem(itemId);
    
    if (item) {
      res.json({ success: true, item });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error fetching in-app item:', error);
    res.status(500).json({ error: 'Failed to fetch in-app item' });
  }
});

router.get('/user/:userAddress/items', async (req, res) => {
  try {
    const { userAddress } = req.params;
    
    const items = marketplaceService.getUserItems(userAddress);
    
    res.json({ success: true, items });
  } catch (error) {
    console.error('Error fetching user items:', error);
    res.status(500).json({ error: 'Failed to fetch user items' });
  }
});

router.get('/user/:userAddress/in-app-items', async (req, res) => {
  try {
    const { userAddress } = req.params;
    
    const items = marketplaceService.getUserInAppItems(userAddress);
    
    res.json({ success: true, items });
  } catch (error) {
    console.error('Error fetching user in-app items:', error);
    res.status(500).json({ error: 'Failed to fetch user in-app items' });
  }
});

router.get('/payment/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = marketplaceService.getPayment(paymentId);
    
    if (payment) {
      res.json({ success: true, payment });
    } else {
      res.status(404).json({ error: 'Payment not found' });
    }
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

router.get('/exchange-rate/:currency', async (req, res) => {
  try {
    const { currency } = req.params;
    
    const rate = marketplaceService.getExchangeRate(currency);
    
    if (rate) {
      res.json({ success: true, rate });
    } else {
      res.status(404).json({ error: 'Exchange rate not found' });
    }
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    res.status(500).json({ error: 'Failed to fetch exchange rate' });
  }
});

router.get('/currencies', async (req, res) => {
  try {
    const currencies = marketplaceService.getSupportedCurrencies();
    
    res.json({ success: true, currencies });
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({ error: 'Failed to fetch currencies' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = marketplaceService.getMarketplaceStats();
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;

