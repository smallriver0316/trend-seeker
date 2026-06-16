export async function sendToSlack(webhookUrl: string, text: string): Promise<void> {
  const payload = {
    text,
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send message to Slack. Status: ${response.status}. Response: ${errorText}`);
  }
}
