import { expect, test, type Page } from '@playwright/test';

async function navigate(page: Page, label: string) {
  const menu = page.getByRole('button', { name: 'Open navigation' });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('button', { name: label, exact: true })
    .click();
}

async function finishSteps(page: Page) {
  for (let i = 0; i < 4; i++)
    await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await page.getByRole('button', { name: 'Finish session', exact: true }).click();
}

test('home is responsive, style choice persists, and all missions open', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Now find your voice.');
  await page.getByRole('button', { name: 'Jazz', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Jazz', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await navigate(page, 'Practice');
  await expect(page.locator('.mission-card')).toHaveCount(6);
  await expect(page.locator('body')).toHaveJSProperty(
    'scrollWidth',
    await page.locator('body').evaluate((el) => el.clientWidth),
  );
  await page.getByRole('button', { name: '2 min', exact: true }).click();
  await page.getByRole('button', { name: 'Play this mission' }).nth(2).click();
  await expect(page.locator('.session-heading')).toContainText('Jazz · 2-minute session');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('One idea, many possibilities');
  expect(errors).toEqual([]);
});

test('session examples, pause, hints, controls, and saved reflections work', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const OriginalContext = window.AudioContext;
    Object.assign(window, { sourceStarts: 0 });
    window.AudioContext = class extends OriginalContext {
      createBufferSource() {
        const source = super.createBufferSource();
        const originalStart = source.start.bind(source);
        source.start = (...args: Parameters<typeof source.start>) => {
          (window as unknown as { sourceStarts: number }).sourceStarts++;
          originalStart(...args);
        };
        return source;
      }
    };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Just 2 minutes' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Hear the idea' })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { sourceStarts: number }).sourceStarts))
    .toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Hear the example' }).click();
  await expect(page.getByRole('button', { name: 'Stop example' })).toBeVisible();
  await page.getByRole('button', { name: 'Stop example' }).click();
  await page.getByRole('button', { name: 'Hide hints' }).click();
  await expect(page.getByLabel('Note hints are hidden')).toBeVisible();
  await page.getByRole('button', { name: 'Pause session' }).click();
  const timer = await page.locator('.session-time').innerText();
  const starts = await page.evaluate(
    () => (window as unknown as { sourceStarts: number }).sourceStarts,
  );
  await page.waitForTimeout(1200);
  expect(await page.locator('.session-time').innerText()).toBe(timer);
  expect(
    await page.evaluate(() => (window as unknown as { sourceStarts: number }).sourceStarts),
  ).toBe(starts);
  await page.getByRole('button', { name: /72 bpm/ }).click();
  await page.getByRole('slider', { name: 'Tempo' }).fill('64');
  await expect(page.getByRole('button', { name: /64 bpm/ })).toBeVisible();
  await page.getByRole('button', { name: 'Resume session' }).click();
  await finishSteps(page);
  await page.getByRole('button', { name: 'A little hard', exact: true }).click();
  await page
    .getByRole('textbox', { name: /Something worth remembering/ })
    .fill('I liked leaving a breath between phrases.');
  await page.getByRole('button', { name: 'Save my session' }).click();
  await expect(page.getByRole('status')).toContainText('Saved on this device');
  await page.getByRole('button', { name: 'See my practice' }).click();
  await expect(page.locator('.saved-reflection')).toContainText('leaving a breath');
  await page.reload();
  await navigate(page, 'My practice');
  await expect(page.locator('.history-card')).toHaveCount(1);
  await expect(page.locator('.saved-reflection')).toContainText('leaving a breath');
  expect(errors).toEqual([]);
});

test('leaving an unfinished session requires confirmation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Let’s play' }).click();
  await navigate(page, 'Explore');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Keep practicing' }).click();
  await expect(page.getByRole('button', { name: 'Resume session' })).toBeVisible();
  await page.getByRole('button', { name: 'All missions' }).click();
  await page.getByRole('button', { name: 'Leave session', exact: true }).click();
  await expect(page.locator('.mission-card')).toHaveCount(6);
});

test('explore has working settings, backing, and idea prompts', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore freely' }).click();
  await expect(page.getByRole('button', { name: '66 bpm', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /A little blue/ }).click();
  await expect(page.getByRole('button', { name: '84 bpm', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Play backing' }).click();
  await expect(page.getByRole('button', { name: 'Pause backing' })).toBeVisible();
  await page.getByRole('button', { name: 'Give me an idea' }).click();
  await expect(page.locator('.idea-prompt')).toContainText('more softly');
  await page.getByRole('button', { name: 'Pause backing' }).click();
  await expect(page.getByRole('button', { name: 'Play backing' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('unavailable browser storage has a clear warning', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Blocked', 'QuotaExceededError');
    };
  });
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Your browser cannot save progress');
  await expect(page.getByRole('button', { name: 'Let’s play' })).toBeVisible();
});

test('the timer advances through steps and stops at the session end', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.getByRole('button', { name: 'Just 2 minutes' }).click();
  await page.clock.runFor(16_000);
  await expect(page.getByRole('heading', { name: 'Find it by ear', exact: true })).toBeVisible();
  await page.clock.runFor(105_000);
  await expect(page.getByRole('heading', { name: 'That was your music.' })).toBeVisible();
  await expect(page.locator('.completion-meta')).toContainText('2:00 practiced');
  await page.getByRole('button', { name: 'Save my session' }).click();
  const seconds = await page.evaluate(
    () => JSON.parse(localStorage.getItem('interlude.practice.v1')!).sessions[0].seconds,
  );
  expect(seconds).toBe(120);
});

test('revisiting saved practice opens the same mission and style', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'interlude.practice.v1',
      JSON.stringify({
        version: 1,
        style: 'classical',
        duration: 2,
        sessions: [
          {
            id: 'previous-session',
            missionId: 'motif',
            style: 'jazz',
            duration: 2,
            seconds: 120,
            finishedAt: new Date().toISOString(),
            reflection: 'My little riff.',
            difficulty: 'right',
          },
        ],
      }),
    );
  });
  await page.goto('/');
  await navigate(page, 'My practice');
  await page.getByRole('button', { name: 'Revisit One idea, many possibilities in jazz' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('One idea, many possibilities');
  await expect(page.locator('.session-heading')).toContainText('Jazz · 2-minute session');
});

test('practice still works if browser audio is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'AudioContext', { value: undefined });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Just 2 minutes' }).click();
  await expect(page.getByRole('alert')).toContainText('You can still practice without sound');
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Find it by ear', exact: true })).toBeVisible();
});

test('the smallest phone layout does not overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('button', { name: 'Just 2 minutes' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await expect(page.getByRole('button', { name: 'Pause session' })).toBeVisible();
});

test('screenshots of the home and practice room', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true });
  await page.getByRole('button', { name: 'Just 2 minutes' }).click();
  await page.getByRole('button', { name: 'Pause session' }).click();
  await page.screenshot({ path: testInfo.outputPath('practice.png'), fullPage: true });
});

test('theme lessons compare source and variation without rushing the timer', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await page.getByRole('button', { name: /^Theme & variations/ }).click();
  await expect(page.locator('.mission-card')).toHaveCount(4);
  await page.getByRole('button', { name: 'Play this mission' }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('An ode, with your own ending');
  await expect(page.getByRole('button', { name: /^Accompaniment/ })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await page.getByRole('button', { name: 'Hear source phrase', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Stop source', exact: true })).toBeVisible();
  const timer = await page.locator('.session-time').innerText();
  await page.waitForTimeout(1200);
  expect(await page.locator('.session-time').innerText()).toBe(timer);
  await page.getByRole('button', { name: 'Hear one variation', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Stop variation', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Pause session' }).click();
  await page.getByRole('button', { name: 'Show optional notation' }).click();
  await expect(page.locator('.notation-scroll svg')).toBeVisible();
  await expect(page.locator('.score-caption')).toContainText('last D becomes C');
  await page.getByRole('button', { name: 'Source phrase', exact: true }).click();
  await expect(page.locator('.notation-scroll svg')).toBeVisible();
  await expect(page.locator('.score-caption')).toContainText('Opening two bars');
  await page.getByText('About the source and what we changed', { exact: true }).click();
  await expect(page.getByRole('link', { name: 'View the source edition' })).toHaveAttribute(
    'href',
    /imslp.org/,
  );
  await expect(page.locator('.source-details')).toContainText('transposed to C major');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: testInfo.outputPath('source-lesson.png'), fullPage: true });
});

for (const [collection, title] of [
  ['themes', 'One theme, your variations'],
  ['themes', 'A melody above Bach'],
  ['themes', 'Borrow a little ragtime'],
  ['blues', 'Your first blues conversation'],
  ['blues', 'Let the spaces swing'],
  ['blues', 'One idea, twelve bars'],
] as const) {
  test(`source and variation notation render for ${title}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await page
      .getByRole('button', {
        name: collection === 'themes' ? /^Theme & variations/ : /^First blues/,
      })
      .click();
    const card = page
      .locator('.mission-card')
      .filter({ has: page.getByRole('heading', { name: title, exact: true }) });
    await card.getByRole('button', { name: 'Play this mission' }).click();
    await page.getByRole('button', { name: 'Pause session' }).click();
    await page.getByRole('button', { name: 'Show optional notation' }).click();
    await expect(page.locator('.notation-scroll svg')).toBeVisible();
    await expect(page.locator('.notation-status')).toHaveCount(0);
    await page.getByRole('button', { name: 'Our variation', exact: true }).click();
    await expect(page.locator('.notation-scroll svg')).toBeVisible();
    await expect(page.locator('.notation-status')).toHaveCount(0);
    if (collection === 'blues')
      await expect(page.locator('.session-heading')).toContainText('Jazz');
    if (title === 'One idea, twelve bars')
      await expect(page.locator('.bar-count')).toHaveText('12 bars');
    if (title === 'Borrow a little ragtime')
      await expect(page.locator('.score-caption')).toContainText('straight sixteenths');
    expect(errors).toEqual([]);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
}

test('switching from blues to classical selects an available collection', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /^First blues/ }).click();
  await expect(page.locator('.mission-card')).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Jazz', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Classical', exact: true }).click();
  await expect(page.locator('.mission-card')).toHaveCount(4);
  await expect(
    page.getByRole('button', { name: 'Theme & variations', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
});

test('a jazz theme variation renders rests and explains swing', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Jazz', exact: true }).click();
  await page.getByRole('button', { name: /^Theme & variations/ }).click();
  await page
    .locator('.mission-card')
    .filter({ hasText: 'One theme, your variations' })
    .getByRole('button', { name: 'Play this mission' })
    .click();
  await page.getByRole('button', { name: 'Pause session' }).click();
  await page.getByRole('button', { name: 'Show optional notation' }).click();
  await page.getByRole('button', { name: 'Our variation', exact: true }).click();
  await expect(page.locator('.notation-scroll svg')).toBeVisible();
  await expect(page.locator('.notation-caption')).toContainText('Swing eighths');
  await expect(page.locator('.notation-status')).toHaveCount(0);
  await page.getByRole('button', { name: 'Hear one variation', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Stop variation', exact: true })).toBeVisible();
});
