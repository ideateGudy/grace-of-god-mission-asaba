import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/me')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id: 'e2e', email: 'admin@example.test', name: 'Test Admin', role: 'SUPER_ADMIN', permissions: [], mustChangePassword: false } }),
      });
      return;
    }
    if (path.endsWith('/admin/stats')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: {} }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: { page: 1, limit: 100, total: 0 } }) });
  });
});

test('home renders the church welcome and public navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Grace of God Mission Asaba' })).toBeVisible();
  await expect(page.getByRole('link', { name: /browse sermons/i })).toBeVisible();
});

test('home fits a 360px mobile viewport without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(widths.content).toBeLessThanOrEqual(widths.viewport);
});

test('mobile navigation supports keyboard focus and restores focus on Escape', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/sermons');

  const menuButton = page.getByRole('button', { name: 'Open menu' });
  await menuButton.focus();
  await page.keyboard.press('Enter');

  const menu = page.getByRole('dialog');
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('link', { name: 'Visit us' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(menuButton).toBeFocused();
});

test('reduced motion preference removes the home hero entrance animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const heroLine = page.locator('.hero-sequence-line').first();
  await expect(heroLine).toBeVisible();
  await expect(heroLine).toHaveCSS('animation-name', 'none');
});

test('theme menu switches between light and dark modes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Change theme' }).first().click();
  await page.getByRole('menuitem', { name: 'Dark' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);

  await page.getByRole('button', { name: 'Change theme' }).first().click();
  await page.getByRole('menuitem', { name: 'Light' }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

test('sermons page renders the empty CMS state and search controls', async ({ page }) => {
  await page.goto('/sermons');
  await expect(page.getByRole('heading', { name: 'Sermons', exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Search sermons' })).toBeVisible();
  await expect(page.getByText(/sermons will appear here/i)).toBeVisible();
});

test('contact form validates and reports a successful submission', async ({ page }) => {
  await page.route('**/api/v1/contact', (route) =>
    route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ data: { success: true } }) }),
  );
  await page.goto('/contact');
  await page.getByLabel('Your Name').fill('Test Visitor');
  await page.getByLabel('Email Address').fill('visitor@example.test');
  await page.getByRole('textbox', { name: 'Message' }).fill('This is a test message for the contact form.');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByRole('heading', { name: 'Message Sent!' })).toBeVisible();
});

test('contact form requires consent and a way to receive a reply', async ({ page }) => {
  let submitted = false;
  await page.route('**/api/v1/contact', (route) => {
    submitted = true;
    return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ data: { success: true } }) });
  });
  await page.goto('/contact');
  await page.getByLabel('Your Name').fill('Test Visitor');
  await page.getByRole('textbox', { name: 'Message' }).fill('Please contact me about the next service.');
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByText('Please agree to the privacy notice before submitting.')).toBeVisible();
  expect(submitted).toBe(false);

  await page.getByRole('checkbox', { name: /I agree to the Privacy Policy/ }).check();
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByText('Either email or phone must be provided')).toBeVisible();
  expect(submitted).toBe(false);

  await page.getByLabel('Phone Number').fill('+2348000000000');
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByRole('heading', { name: 'Message Sent!' })).toBeVisible();
  expect(submitted).toBe(true);
});

test('prayer request validates consent and submits without requiring personal details', async ({ page }) => {
  let submittedRequest: Record<string, unknown> | null = null;
  await page.route('**/api/v1/prayer-requests', async (route) => {
    submittedRequest = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ data: { success: true } }) });
  });
  await page.goto('/prayer');
  await page.getByLabel('Your Prayer Request').fill('Please pray for my family this week.');
  await page.getByRole('button', { name: 'Submit Prayer Request' }).click();
  await expect(page.getByText('Please agree to the privacy notice before submitting.')).toBeVisible();
  expect(submittedRequest).toBeNull();

  await page.getByRole('checkbox', { name: /I agree to the Privacy Policy/ }).check();
  await page.getByRole('button', { name: 'Submit Prayer Request' }).click();
  await expect(page.getByRole('heading', { name: 'Request Submitted' })).toBeVisible();
  await expect.poll(() => submittedRequest).toMatchObject({
    request: 'Please pray for my family this week.',
    consent: true,
  });
});

test('development styleguide renders shared design examples', async ({ page }) => {
  await page.goto('/styleguide');
  await expect(page.getByRole('heading', { name: 'Styleguide' })).toBeVisible();
  await expect(page.getByText('Strong Glass Surface')).toBeVisible();
  await expect(page.getByText('Sample sermon title')).toBeVisible();
});

test('admin login establishes a session and shows permission-filtered dashboard data', async ({ page }) => {
  await page.route('**/api/v1/auth/login', (route) => route.fulfill({
    status: 201,
    contentType: 'application/json',
    headers: { 'set-cookie': 'gom_session=e2e-session; Path=/; HttpOnly; SameSite=Lax' },
    body: JSON.stringify({ data: { id: 'e2e', email: 'admin@example.test', name: 'Test Admin', role: 'SUPER_ADMIN', permissions: [], mustChangePassword: false } }),
  }));
  await page.route('**/api/v1/admin/stats', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: { publishedSermons: 2, upcomingEvents: 3, unreadContactMessages: 1, unreadPrayerRequests: 4, liveHero: null } }),
  }));
  await page.goto('/admin/login');
  await page.getByLabel('Email Address').fill('admin@example.test');
  await page.getByLabel('Password').fill('temporary-password');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByText('Published sermons')).toBeVisible();
  await expect(page.getByText('Unread prayer requests')).toBeVisible();
});

test('an admin can create a sermon from a 360px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  let createdSermon: Record<string, unknown> | null = null;
  await page.route('**/api/v1/auth/login', (route) => route.fulfill({
    status: 201,
    contentType: 'application/json',
    headers: { 'set-cookie': 'gom_session=e2e-session; Path=/; HttpOnly; SameSite=Lax' },
    body: JSON.stringify({ data: { id: 'editor', email: 'editor@example.test', name: 'Sermon Editor', role: 'ADMIN', permissions: ['SERMONS_MANAGE'], mustChangePassword: false } }),
  }));
  await page.route('**/api/v1/admin/stats', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: {} }) }));
  await page.route('**/api/v1/admin/sermons**', async (route) => {
    if (route.request().method() === 'POST') {
      createdSermon = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ data: { ...createdSermon, id: 'sermon-1' } }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: { page: 1, limit: 100, total: 0 } }) });
  });

  await page.goto('/admin/login');
  await page.getByLabel('Email Address').fill('editor@example.test');
  await page.getByLabel('Password').fill('temporary-password');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await page.goto('/admin/sermons/new');
  await expect(page.getByRole('heading', { name: 'Add Sermon' })).toBeVisible();
  await page.getByLabel('Title').fill('A Test Sermon');
  await page.getByLabel('Preacher').fill('Test Preacher');
  await page.getByLabel('Date preached').fill('2026-10-13T10:00');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect.poll(() => createdSermon).toMatchObject({ title: 'A Test Sermon', preacher: 'Test Preacher' });
});

test('a super-admin can create an admin with selected permissions only', async ({ page }) => {
  let createdUser: Record<string, unknown> | null = null;
  await page.route('**/api/v1/auth/login', (route) => route.fulfill({
    status: 201,
    contentType: 'application/json',
    headers: { 'set-cookie': 'gom_session=e2e-session; Path=/; HttpOnly; SameSite=Lax' },
    body: JSON.stringify({ data: { id: 'super', email: 'super@example.test', name: 'Super Admin', role: 'SUPER_ADMIN', permissions: [], mustChangePassword: false } }),
  }));
  await page.route('**/api/v1/admin/stats', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: {} }) }));
  await page.route('**/api/v1/admin/users**', async (route) => {
    if (route.request().method() === 'POST') {
      createdUser = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ data: { user: { id: 'created', ...createdUser }, temporaryPassword: 'one-time-test-password' } }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
  });

  await page.goto('/admin/login');
  await page.getByLabel('Email Address').fill('super@example.test');
  await page.getByLabel('Password').fill('temporary-password');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await page.goto('/admin/users');
  await page.getByLabel('Name', { exact: true }).fill('Limited Admin');
  await page.getByLabel('Email', { exact: true }).fill('limited@example.test');
  await page.getByRole('button', { name: 'Create admin' }).click();
  await expect(page.getByText('Temporary password — shown once')).toBeVisible();
  await expect.poll(() => createdUser).toMatchObject({ name: 'Limited Admin', email: 'limited@example.test' });
  const submittedUser = createdUser as Record<string, unknown> | null;
  expect(submittedUser?.permissions).toContain('SERMONS_MANAGE');
  expect(submittedUser?.permissions).not.toContain('PRAYER_INBOX');
});

test('gallery editor uploads an image and saves its Cloudinary URL', async ({ page }) => {
  let savedImage: Record<string, unknown> | null = null;
  await page.route('**/api/v1/auth/login', (route) => route.fulfill({
    status: 201,
    contentType: 'application/json',
    headers: { 'set-cookie': 'gom_session=e2e-session; Path=/; HttpOnly; SameSite=Lax' },
    body: JSON.stringify({ data: { id: 'gallery-editor', email: 'gallery@example.test', name: 'Gallery Editor', role: 'ADMIN', permissions: ['GALLERY_MANAGE'], mustChangePassword: false } }),
  }));
  await page.route('**/api/v1/admin/stats', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: {} }) }));
  await page.route('**/api/v1/admin/uploads/signature', (route) => route.fulfill({
    status: 201,
    contentType: 'application/json',
    body: JSON.stringify({ data: { cloudName: 'church-cloud', apiKey: 'public-key', timestamp: 1_797_000_000, folder: 'grace-of-god-mission/gallery', publicId: 'test-image', allowedFormats: 'jpg,jpeg,png,webp,avif', signature: 'signed-test-value' } }),
  }));
  await page.route('https://api.cloudinary.com/v1_1/church-cloud/image/upload', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ secure_url: 'https://res.cloudinary.com/church-cloud/image/upload/test-image.jpg' }),
  }));
  await page.route('**/api/v1/admin/gallery**', async (route) => {
    if (route.request().method() === 'POST') {
      savedImage = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ data: { id: 'image-1', ...savedImage } }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
  });

  await page.goto('/admin/login');
  await page.getByLabel('Email Address').fill('gallery@example.test');
  await page.getByLabel('Password').fill('temporary-password');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await page.goto('/admin/gallery/new');
  await page.locator('input[type="file"]').setInputFiles({ name: 'church-event.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake-image') });
  await expect(page.getByLabel('Gallery image URL')).toHaveValue('https://res.cloudinary.com/church-cloud/image/upload/test-image.jpg');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect.poll(() => savedImage).toMatchObject({ imageUrl: 'https://res.cloudinary.com/church-cloud/image/upload/test-image.jpg' });
});

test('hero editor can convert a carousel draft to a single-slide draft', async ({ page }) => {
  let savedHero: Record<string, unknown> | null = null;
  await page.route('**/api/v1/auth/login', (route) => route.fulfill({
    status: 201,
    contentType: 'application/json',
    headers: { 'set-cookie': 'gom_session=e2e-session; Path=/; HttpOnly; SameSite=Lax' },
    body: JSON.stringify({ data: { id: 'editor', email: 'editor@example.test', name: 'Hero Editor', role: 'ADMIN', permissions: ['HERO_MANAGE'], mustChangePassword: false } }),
  }));
  await page.route('**/api/v1/admin/stats', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: {} }) }));
  await page.route('**/api/v1/admin/hero', async (route) => {
    if (route.request().method() === 'POST') {
      savedHero = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ data: { id: 'hero-1', ...savedHero } }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: { liveHeroId: null } }) });
  });

  await page.goto('/admin/login');
  await page.getByLabel('Email Address').fill('editor@example.test');
  await page.getByLabel('Password').fill('temporary-password');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await page.goto('/admin/hero/new');
  await page.getByText('Carousel', { exact: true }).click();
  await page.getByRole('button', { name: 'Add slide' }).click();
  await expect(page.getByRole('heading', { name: 'Slide 2' })).toBeVisible();
  await page.getByText('Single slide', { exact: true }).click();
  await page.getByRole('button', { name: 'Delete slide' }).last().click();
  await expect(page.getByRole('heading', { name: 'Slide 2' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Save draft' }).click();
  await expect.poll(() => savedHero).toMatchObject({ mode: 'SINGLE', published: false });
  expect((savedHero as Record<string, unknown> | null)?.slides).toHaveLength(1);
});

test('cache revalidation rejects missing secrets and accepts an authorized hero tag', async ({ page }) => {
  const unauthorized = await page.request.post('/api/revalidate', { data: { tag: 'hero' } });
  expect(unauthorized.status()).toBe(401);

  const invalidTag = await page.request.post('/api/revalidate', {
    headers: { 'x-revalidate-secret': 'playwright-revalidation-secret' },
    data: { tag: 'admin-users' },
  });
  expect(invalidTag.status()).toBe(400);

  const revalidated = await page.request.post('/api/revalidate', {
    headers: { 'x-revalidate-secret': 'playwright-revalidation-secret' },
    data: { tag: 'hero' },
  });
  expect(revalidated.status()).toBe(200);
  await expect(revalidated.json()).resolves.toMatchObject({ revalidated: true, tag: 'hero' });
});

test('forced password changes route admins to their account page', async ({ page }) => {
  await page.context().addCookies([{ name: 'gom_session', value: 'e2e-session', domain: 'localhost', path: '/' }]);
  await page.route('**/api/v1/auth/me', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: { id: 'e2e', email: 'admin@example.test', name: 'Test Admin', role: 'ADMIN', permissions: [], mustChangePassword: true } }),
  }));
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/account$/);
});

for (const colorScheme of ['light', 'dark'] as const) {
  for (const route of ['/', '/sermons', '/contact', '/admin'] as const) {
    test(`${route} has no serious axe violations in ${colorScheme} mode`, async ({ page }) => {
      if (route === '/admin') {
        await page.context().addCookies([{ name: 'gom_session', value: 'axe-session', domain: 'localhost', path: '/' }]);
        await page.route('**/api/v1/auth/me', (request) => request.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { id: 'axe', email: 'admin@example.test', name: 'A11y Admin', role: 'SUPER_ADMIN', permissions: [], mustChangePassword: false } }),
        }));
        await page.route('**/api/v1/admin/stats', (request) => request.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { publishedSermons: 0, upcomingEvents: 0, unreadContactMessages: 0, unreadPrayerRequests: 0, liveHero: null } }),
        }));
      }
      await page.emulateMedia({ colorScheme });
      await page.goto(route);
      if (route === '/admin') await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(results.violations.map(({ id, impact, description }) => ({ id, impact, description }))).toEqual([]);
    });
  }
}
