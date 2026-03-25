import { test, expect } from '@playwright/test';

test.describe('AI Movie Recommender Chat UI', () => {
  
  test('User can start a conversation and receive a clarifying question from the AI', async ({ page }) => {
    // 1. Mock the API response BEFORE navigating, so we never hit the live Render server
    await page.route('**/chat', async route => {
      const json = {
        session_id: "fake-session-123",
        result: {
          status: "clarifying",
          message: "Thailand has a diverse film industry. Do you have a preferred genre?"
        }
      };
      await route.fulfill({ json });
    });

    await page.goto('http://localhost:3000');

    await expect(page.getByRole('heading', { name: 'Gemini Movie Recommender' })).toBeVisible();

    const chatInput = page.getByPlaceholder('Type your answer...');
    
    // Ensure React has hydrated and the input is ready
    await expect(chatInput).toBeEnabled();
    await chatInput.fill('A movie from Thailand');

    const sendButton = page.getByRole('button', { name: 'Send' });
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // With the network mocked, this should be nearly instant
    await expect(page.locator('text=Thinking...')).toBeVisible();
    await expect(page.locator('text=Thinking...')).toBeHidden({ timeout: 5000 });

    const aiMessages = page.locator('.bg-muted');
    await expect(aiMessages).toHaveCount(2);
  });

});

test('User can manually toggle Dark Mode', async ({ page }) => {
  await page.goto('http://localhost:3000');

  const toggleBtn = page.getByRole('button', { name: 'Toggle theme' });
  
  await toggleBtn.click();

  // Next-themes modifies the DOM. Give it a longer timeout to complete the mutation.
  await expect(page.locator('html')).toHaveClass(/dark/, { timeout: 10000 });

  const isManual = await page.evaluate(() => localStorage.getItem('theme-manually-set'));
  expect(isManual).toBe('true');
});

test('Start Over button resets the application state', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await page.route('**/chat', async route => {
    const json = {
      session_id: "fake-session",
      result: {
        status: "success",
        movies: [{ title: "Mock Movie", director: "Jane Doe", reason: "Testing", streamingLink: null }]
      }
    };
    await route.fulfill({ json });
  });

  const chatInput = page.getByPlaceholder('Type your answer...');
  await expect(chatInput).toBeEnabled();
  await chatInput.fill('Action movie');
  
  await page.getByRole('button', { name: 'Send' }).click();

  await expect(page.getByText('Mock Movie')).toBeVisible({ timeout: 10000 });

  await page.getByRole('button', { name: 'Start Over' }).click();

  await expect(page.getByText('Mock Movie')).toBeHidden();
  await expect(page.getByPlaceholder('Type your answer...')).toBeVisible();
});

test('UI correctly renders streaming links and disabled buttons based on API payload', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await page.route('**/chat', async route => {
    const json = {
      session_id: "mock-123",
      result: {
        status: "success",
        movies: [
          { title: "Has Link", director: "A", reason: "1", streamingLink: "https://justwatch.com/mock" },
          { title: "No Link", director: "B", reason: "2", streamingLink: null }
        ]
      }
    };
    await route.fulfill({ json });
  });

  const chatInput = page.getByPlaceholder('Type your answer...');
  await expect(chatInput).toBeEnabled();
  await chatInput.fill('Show me movies');
  
  await page.getByRole('button', { name: 'Send' }).click();

  // Wait for the UI to update with the mocked movies
  const watchButton = page.getByRole('link', { name: 'Watch on JustWatch' });
  await expect(watchButton).toBeVisible({ timeout: 10000 });
  await expect(watchButton).toHaveAttribute('href', 'https://justwatch.com/mock');

  const disabledButton = page.getByRole('button', { name: 'Not available to stream' });
  await expect(disabledButton).toBeVisible();
  await expect(disabledButton).toBeDisabled();
});