import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check if main heading is visible
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Gil Corretor SP');
  });

  test('should display navigation menu', async ({ page }) => {
    // Check if navigation exists
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Check for main navigation links
    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();

    const propertiesLink = page.locator('a[href="/imoveis"]');
    await expect(propertiesLink).toBeVisible();
  });

  test('should display hero section with CTA button', async ({ page }) => {
    // Check for hero section
    const heroSection = page.locator('[data-testid="hero-section"]');
    await expect(heroSection).toBeVisible();

    // Check for CTA button
    const ctaButton = page.locator('button:has-text("Ver Imóveis")');
    await expect(ctaButton).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // Check if content is still visible
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Check if mobile menu button is visible
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    await expect(menuButton).toBeVisible();
  });
});

test.describe('Properties Page', () => {
  test('should load properties list', async ({ page }) => {
    await page.goto('/imoveis');

    // Wait for properties to load
    const propertyCard = page.locator('[data-testid="property-card"]');
    await expect(propertyCard.first()).toBeVisible();
  });

  test('should filter properties by price', async ({ page }) => {
    await page.goto('/imoveis');

    // Open filter panel
    const filterButton = page.locator('button:has-text("Filtros")');
    await filterButton.click();

    // Set price filter
    const minPriceInput = page.locator('input[placeholder="Preço mínimo"]');
    await minPriceInput.fill('500000');

    // Apply filter
    const applyButton = page.locator('button:has-text("Aplicar")');
    await applyButton.click();

    // Verify results updated
    const propertyCard = page.locator('[data-testid="property-card"]');
    await expect(propertyCard.first()).toBeVisible();
  });

  test('should add property to favorites', async ({ page }) => {
    await page.goto('/imoveis');

    // Wait for first property card
    const propertyCard = page.locator('[data-testid="property-card"]').first();
    await expect(propertyCard).toBeVisible();

    // Click favorite button
    const favoriteButton = propertyCard.locator('button[aria-label="Adicionar aos favoritos"]');
    await favoriteButton.click();

    // Check if heart icon is filled
    const heartIcon = favoriteButton.locator('svg.fill-red-500');
    await expect(heartIcon).toBeVisible();
  });
});

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login');

    // Check for login form
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    const submitButton = page.locator('button:has-text("Entrar")');
    await expect(submitButton).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/login');

    // Fill invalid email
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('invalid-email');

    // Try to submit
    const submitButton = page.locator('button:has-text("Entrar")');
    await submitButton.click();

    // Check for error message
    const errorMessage = page.locator('text=E-mail inválido');
    await expect(errorMessage).toBeVisible();
  });
});
