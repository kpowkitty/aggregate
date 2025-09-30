'use strict';

const { plaidClient } = require('../utils/plaidClient');
const plaidConfig = require('../config/plaid');
const logger = require('../utils/logger');
const PlaidAccountModel = require('../models/plaidAccount');

/**
 * Plaid API controller
 */
const plaidController = {
  /**
   * Create a Link token for Plaid
   */
  createLinkToken: async (req, res, next) => {
    try {
      const linkTokenConfig = {
        user: {
          client_user_id: req.sessionID,
        },
        client_name: 'Aggregate',
        products: plaidConfig.products,
        country_codes: plaidConfig.countryCodes,
        language: plaidConfig.language,
      };

      if (plaidConfig.redirectUri) {
        linkTokenConfig.redirect_uri = plaidConfig.redirectUri;
      }

      const tokenResponse = await plaidClient.linkTokenCreate(linkTokenConfig);
      logger.debug('Link token created successfully');
      
      res.json(tokenResponse.data);
    } catch (err) {
      logger.error(`Error creating link token: ${err.message}`);
      next(err);
    }
  },

  /**
   * Exchange public token for access token
   */
  exchangePublicToken: async (req, res, next) => {
    try {
      const { public_token } = req.body;
      
      if (!public_token) {
        return res.status(400).json({ success: false, error: 'Public token is required' });
      }

      const exchangeResponse = await plaidClient.itemPublicTokenExchange({
        public_token: public_token,
      });

      const accessToken = exchangeResponse.data.access_token;
      const itemId = exchangeResponse.data.item_id;
      
      // Store the access token in the database
      await PlaidAccountModel.saveAccessToken(req.session.userId, accessToken, itemId);
      
      // Also store in session for current request handling
      req.session.access_token = accessToken;
      
      logger.info(`Plaid access token exchanged for user ID: ${req.session.userId}`);
      res.json({ success: true });
    } catch (err) {
      logger.error(`Error exchanging public token: ${err.message}`);
      next(err);
    }
  },

  /**
   * Get account data from Plaid
   */
  getAccountData: async (req, res, next) => {
    try {
      // Get access token from session or database
      const accessToken = req.session.access_token || 
                         await PlaidAccountModel.getAccessToken(req.session.userId);
      
      if (!accessToken) {
        return res.status(400).json({ 
          success: false, 
          error: 'No access token found' 
        });
      }

      const balanceResponse = await plaidClient.accountsBalanceGet({ access_token: accessToken });
      
      res.json({
        success: true,
        data: balanceResponse.data
      });
    } catch (err) {
      logger.error(`Error fetching account data: ${err.message}`);
      next(err);
    }
  },

  /**
   * Check if account is connected
   */
  isAccountConnected: async (req, res) => {
    try {
      // Check both session and database
      const accessToken = req.session.access_token || 
                         await PlaidAccountModel.getAccessToken(req.session.userId);
      
      res.json({ 
        success: true,
        status: !!accessToken
      });
    } catch (err) {
      logger.error(`Error checking account connection: ${err.message}`);
      res.json({ 
        success: false,
        status: false,
        error: err.message
      });
    }
  },

  /**
   * Get item info
   */
  getItemInfo: async (req, res, next) => {
    try {
      // Get item ID and access token from database
      const { accessToken, itemId } = await PlaidAccountModel.getPlaidInfo(req.session.userId);
      
      if (!accessToken || !itemId) {
        return res.status(400).json({
          success: false,
          error: 'No Plaid account information found'
        });
      }

      res.json({
        success: true,
        item_id: itemId,
        access_token: accessToken,
        products: plaidConfig.products
      });
    } catch (err) {
      logger.error(`Error getting item info: ${err.message}`);
      next(err);
    }
  }
};

module.exports = plaidController;
