## Database/Models
### Design
```javascript
// XXX PLAID TO BE STORED IN DB:
/*
let access_token = null;
let user_token = null;
let public_token = null;
let item_id = null;
let account_id = null;
let users = [];
let profiles = [];
let tags = [];
*/

/* DB Interactions and Structure:
Table: users
	id: int - primary key
	xxx userId: ?
	email: varchar(255) - unique secondary key
	password: varchar(255) - hashed
	created_at: timestamp
	access_token: varchar(255) - plaid access token, hashed
	
Table: accounts

Table: profiles:
	id: xxx
*/
```

## Controller
Our routes are going to maintain our list of GET methods for our API endpoints.
Our controllers are going to supply the POST with the controller modifications
applied. That way we separate cleanly into a structure of the following:
 * routes: routes to GET our API endpoints
 * controllers: controller processing of our API, and then a POST for our routes
   to receive.

