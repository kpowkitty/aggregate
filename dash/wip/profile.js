router.post('/profile/create', (req, res) => {
	// needs a user
	// needs bank auth
	try {
		const {name} = req.body;

		const userId = req.session.userId;
		if (!userId) {
			return res.status(401).json({success: false, error: 'Not authenticated'});
		}

		const newProfile = {
			id: Date.now().toString(),
			// xxx err here?
			user_id,
			name,
			created_at: new Date(),
		};

		profiles.push(newProfile);

		res.json({success: true, profileId: newProfile.id});
	} catch (err) {
		console.error('Error creating profile:', err);
		res.status(500).json({success: false, error: 'Server error' });
	}
});

app.post('/api/profiles/:profileId/remove-card', (req, res) => {
	try {
		const {profileId} = req.params;
		const {cardId} = req.body;

		const profile = profiles.find(p => p.id === profileId);
		if (!profile) {
			return res.status(404).json({success: false, error: 'Profile not found'});
		}

		profile.cards = profile.cards.filter(card => card.id !== cardId);

		res.json({success: true});
	} catch (err) {
		console.error('Error removing card:', err);
		res.status(500).json({success: false, error: 'Server error'});
	}
});

app.post('/api/profiles/:profileId/add-card', async (req, res) => {
  try {
	const {profileId} = req.params;
	const {cardId} = req.body;


	access_token = req.session.access_token;
	const balres = await plaidClient.accountsBalanceGet({access_token});

	const cardInfo = balres.data.accounts.find(acc => acc.account_id === cardId);
	if (!cardInfo) {
	  return res.status(404).json({success: false, error: 'Card not found'});
	}

	profile.cards.push({
	  id: cardInfo.account_id,
	  mask: cardInfo.mask,
	  name: cardInfo.name,
	  type: cardInfo.type,
	  subtype: cardInfo.subtype,
	});

	res.json({success: true});
  } catch (err) {
	console.error('Error adding card:', err);
	res.status(500).json({success: false, error: 'Server error'});
  }
});

// xxx these needed somewhere?
//const {profileId} = req.params;
//const {sort = 'date'} = req.query;

// profile data:
//	uniqueMerchants: [],
//	availableCards: [],
//	sort,

'use strict';

const config = require('../config.js');

// id: auto-increment
// foreign key: access_token/userId
// name: varchar(255)
// cards: []
// created_at: date

// table Card:
//id: cardInfo.account_id,
// user_id: access_token foreign key
// profile_id: profileId foreign key
//mask: cardInfo.mask,
//name: cardInfo.name,
//type: cardInfo.type,
//subtype: cardInfo.subtype,

if (!global.profiles) {
      const newProfile = {
        id: Date.now().toString(),
		user_id: "",
		  name: "",
        banks: [],
        cards: [],
        created_at: new Date(),
      };


// Each profile has
	// trans: plaid api fetches
	// uniqueMerchants: merchant codes filtered - plaid api fetches
	//



/**
 * Profile model
 */
class Profile {
  /**
   * Find all profiles for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - Array of profile objects
   */
  static async findByUserId(userId) {
    try {
      const profiles = global.profiles || [];
      return profiles.filter(profile => profile.userId === userId);
    } catch (err) {
      logger.error(`Error finding profiles by user ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * Find a profile by ID
   * @param {string} id - The profile ID
   * @returns {Promise<Object|null>} - The profile object or null if not found
   */
  static async findById(id) {
    try {
      const profiles = global.profiles || [];
      return profiles.find(profile => profile.id === id) || null;
    } catch (err) {
      logger.error(`Error finding profile by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * Create a new profile
   * @param {string} userId - The user ID
   * @param {string} name - The profile name
   * @returns {Promise<string>} - The ID of the newly created profile
   */
  static async create(userId, name) {
    try {
      const newProfile = {
        id: Date.now().toString(),
        userId,
        name,
        banks: [],
        cards: [],
        createdAt: new Date()
      };
      
      if (!global.profiles) {
        global.profiles = [];
      }
      
      global.profiles.push(newProfile);
      return newProfile.id;
    } catch (err) {
      logger.error(`Error creating profile: ${err.message}`);
      throw err;
    }
  }

  /**
   * Add a card to a profile
   * @param {string} profileId - The profile ID
   * @param {Object} cardInfo - The card information
   * @returns {Promise<void>}
   */
  static async addCard(profileId, cardInfo) {
    try {
      const profiles = global.profiles || [];
      const profile = profiles.find(p => p.id === profileId);
      
      if (profile) {
        // Check if card already exists
        const cardExists = profile.cards.some(card => card.id === cardInfo.id);
        
        if (!cardExists) {
          profile.cards.push(cardInfo);
        }
      }
    } catch (err) {
      logger.error(`Error adding card to profile: ${err.message}`);
      throw err;
    }
  }

  /**
   * Remove a card from a profile
   * @param {string} profileId - The profile ID
   * @param {string} cardId - The card ID
   * @returns {Promise<void>}
   */
  static async removeCard(profileId, cardId) {
    try {
      const profiles = global.profiles || [];
      const profile = profiles.find(p => p.id === profileId);
      
      if (profile) {
        profile.cards = profile.cards.filter(card => card.id !== cardId);
      }
    } catch (err) {
      logger.error(`Error removing card from profile: ${err.message}`);
      throw err;
    }
  }
}}

module.exports = Profile;

// /models/card.js
