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
    const aiMessages = page.locator('.bg-muted');
    await expect(aiMessages).toHaveCount(2);
  });

});

test('User can manually toggle Dark Mode', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Find the toggle button using the accessible hidden text
  const toggleBtn = page.getByRole('button', { name: 'Toggle theme' });
  
  // Click it to switch themes
  await toggleBtn.click();

  // Verify that the <html> tag now has the 'dark' class applied
  await expect(page.locator('html')).toHaveClass(/dark/);

  // Verify the custom local storage flag was set
  const isManual = await page.evaluate(() => localStorage.getItem('theme-manually-set'));
  expect(isManual).toBe('true');
});

test('Start Over button resets the application state', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // 1. Mock the API response to immediately return movies so we don't have to wait for Gemini
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

  // 2. Trigger the mocked response
  await page.getByPlaceholder('Type your answer...').fill('Action movie');
  await page.getByRole('button', { name: 'Send' }).click();

  // 3. Wait for the movie card to appear
  await expect(page.getByText('Mock Movie')).toBeVisible();

  // 4. Click Start Over
  await page.getByRole('button', { name: 'Start Over' }).click();

  // 5. Verify the UI is reset
  await expect(page.getByText('Mock Movie')).toBeHidden();
  await expect(page.getByPlaceholder('Type your answer...')).toBeVisible();
});

test('UI correctly renders streaming links and disabled buttons based on API payload', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Intercept the request and provide a mix of movies
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

  // Trigger the flow
  await page.getByPlaceholder('Type your answer...').fill('Show me movies');
  await page.getByRole('button', { name: 'Send' }).click();

  // Assert the "Watch on JustWatch" button exists and has the correct URL
  const watchButton = page.getByRole('link', { name: 'Watch on JustWatch' });
  await expect(watchButton).toBeVisible();
  await expect(watchButton).toHaveAttribute('href', 'https://justwatch.com/mock');

  // Assert the disabled "Not available" button exists for the second movie
  const disabledButton = page.getByRole('button', { name: 'Not available to stream' });
  await expect(disabledButton).toBeVisible();
  await expect(disabledButton).toBeDisabled();
});