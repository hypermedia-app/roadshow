import { test, expect } from '@playwright/test'

test('simple page', async ({ page }) => {
  await page.goto('/example/page')

  const h1 = page.locator('h1')

  await expect(h1).toHaveAttribute('slot', 'header')
})
