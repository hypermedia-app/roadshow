import { test, expect } from '@playwright/test'

test('simple page', async ({ page }) => {
  await page.goto('/example/page')

  const h1 = page.getByText('Test page resource')

  await expect(h1).toHaveAttribute('slot', 'header')
})
