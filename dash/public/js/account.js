document.getElementById('change-email').addEventListener('click', async () => {
	const email = prompt("Enter your current email:");
	const newEmail = prompt("Enter your new email:");
	if (!email || !newEmail) return;

	const res = await fetch('/account/update-email', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, newEmail })
	});

	const data = await res.json();
	alert(data.success ? 'Email updated.' : `Failed: ${data.error}`);
});

document.getElementById('change-pw').addEventListener('click', async () => {
	const email = prompt("Enter your email:");
	const newPassword = prompt("Enter your new password:");
	if (!email || !newPassword) return;

	const res = await fetch('/account/update-password', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, newPassword })
	});

	const data = await res.json();
	alert(data.success ? 'Password updated.' : `Failed: ${data.error}`);
});
