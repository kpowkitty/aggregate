'use strict';

/* CREDIT: Plain minimal quickstart */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const linkButton = document.getElementById('link-account');
		const responseElement = document.getElementById('response');

    // Fetch the link token from the server
    const res = await fetch('/api/create_link_token', {
      method: 'POST',
    });
    const data = await res.json();

    // Initialize Plaid Link
    const handler = Plaid.create({
      token: data.link_token,
      onLoad: function () {
			// xxx middleware for when link loads
        console.log('Plaid Link has loaded');
      },
      onSuccess: function (public_token, metadata) {
				// NOTE: connecting account...
				// send public_token to app server
        const res = fetch('/api/exchange_public_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ public_token: public_token }),
					credentials: 'same-origin'	// important for session cookies
        });

				//if (!res.ok) {
				//	throw new Error(`Token exchange failed: ${res.status}`);
				//}

				// show success message in response element
				// xxx style response element!
				if (responseElement) {
					responseElement.textContent = 'Connected successfully! Redirecting...';
				}

				// redirect to profile page after a short delay to show the success
				// message
				setTimeout(() => {
					window.location.href = '/profile';
				}, 10000);
      },
      onExit: function (err, metadata) {
        // handle exit
        if (err != null) {
          console.error('Plaid Link exited with error: ', err);
        }
      },
      onEvent: function (event_name, metadata) {
        // track events
        console.log('Plaid event: ', event_name, metadata);
      },
    });

    // Open Plaid Link when button is clicked
		if (linkButton) {
			linkButton.addEventListener('click', function() {
				// disable link button while plaid is open
				linkButton.disabled = true;
				handler.open();
			});
		}
  } catch (error) {
    console.error('Error fetching link token or initializing Plaid:', error);
  }
});

/* More Plaid minimal quickstart examples: */
/*
// Retrieves balance information
const getBalance = async function () {
  const response = await fetch("/api/data", {
    method: "GET",
  });
  const data = await response.json();

  //Render response data
  const pre = document.getElementById("response");
  pre.textContent = JSON.stringify(data, null, 2);
  pre.style.background = "#F6F6F6";
};

// Check whether account is connected
const getStatus = async function () {
  const account = await fetch("/api/is_account_connected");
  const connected = await account.json();
  if (connected.status == true) {
    getBalance();
  }
};

getStatus();
*/

// vim: set ts=2 sw=2 sts=2 noet filetype=javascript:
