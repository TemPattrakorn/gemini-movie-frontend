import { test, expect } from '@playwright/test';

test.describe('AI Movie Recommender Chat UI', () => {
  
  test('User can start a conversation and receive a clarifying question from the AI', async ({ page }) => {
    // 1. Navigate to the frontend app
    await page.goto('http://localhost:3000');

    // 2. Verify the page loaded correctly
    await expect(page.getByRole('heading', { name: 'Gemini Movie Recommender' })).toBeVisible();

    // 3. Find the input box and type a vague movie request
    const chatInput = page.getByPlaceholder('Type your answer...');
    await chatInput.fill('A movie from Thailand');

    // 4. Click the send button
    await page.getByRole('button', { name: 'Send' }).click();

    // 5. Verify the loading state appears
    await expect(page.locator('text=Thinking...')).toBeVisible();

    // 6. Wait for the AI to respond and verify the "Thinking..." state disappears
    await expect(page.locator('text=Thinking...')).toBeHidden({ timeout: 15000 });

    // 7. Assert that the AI asked a follow-up question (checking for the chat bubble)
    // Since we don't know the EXACT question the AI will ask, we just verify a new AI bubble appeared
    // We expect 2 AI bubbles total (the initial greeting + the new clarifying question)
    const aiMessages = page.locator('.bg-slate-100');
    await expect(aiMessages).toHaveCount(2);
  });

});