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

async function beginPractice(page: Page) {
  await page.getByRole('button', { name: 'Start practice', exact: true }).click();
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
  await beginPractice(page);
  await expect(page.locator('.session-heading')).toContainText('Jazz · 2-minute plan');
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
  await beginPractice(page);
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
  await beginPractice(page);
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

test('suggested times never move the lesson on in the middle of playing', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.getByRole('button', { name: 'Just 2 minutes' }).click();
  await beginPractice(page);
  await page.clock.runFor(16_000);
  await expect(page.getByRole('heading', { name: 'Hear the idea', exact: true })).toBeVisible();
  await expect(page.locator('.stage-time')).toContainText('Stay with this idea');
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await page.clock.runFor(21_000);
  await expect(
    page.getByRole('heading', { name: 'Try it with a clear limit', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await page.getByRole('button', { name: 'Finish session', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'That was your music.' })).toBeVisible();
  await expect(page.locator('.completion-meta')).toContainText('practiced');
  await page.getByRole('button', { name: 'Save my session' }).click();
  const seconds = await page.evaluate(
    () => JSON.parse(localStorage.getItem('interlude.practice.v1')!).sessions[0].seconds,
  );
  expect(seconds).toBeGreaterThanOrEqual(37);
  expect(seconds).toBeLessThan(40);
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
  await beginPractice(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('One idea, many possibilities');
  await expect(page.locator('.session-heading')).toContainText('Jazz · 2-minute plan');
});

test('practice still works if browser audio is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'AudioContext', { value: undefined });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Just 2 minutes' }).click();
  await beginPractice(page);
  await expect(page.getByRole('alert')).toContainText('You can still practice without sound');
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Try it with a clear limit', exact: true }),
  ).toBeVisible();
});

test('the smallest phone layout does not overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('button', { name: 'Just 2 minutes' }).click();
  await beginPractice(page);
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
  await beginPractice(page);
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
  await beginPractice(page);
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
    await beginPractice(page);
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
  await beginPractice(page);
  await page.getByRole('button', { name: 'Pause session' }).click();
  await page.getByRole('button', { name: 'Show optional notation' }).click();
  await page.getByRole('button', { name: 'Our variation', exact: true }).click();
  await expect(page.locator('.notation-scroll svg')).toBeVisible();
  await expect(page.locator('.notation-caption')).toContainText('Swing eighths');
  await expect(page.locator('.notation-status')).toHaveCount(0);
  await page.getByRole('button', { name: 'Hear one variation', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Stop variation', exact: true })).toBeVisible();
});

test('the concept guide is untimed, sound-first, and has no quiz gate', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Just 2 minutes' }).click();
  await expect(page.getByRole('region', { name: 'Lesson concept' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A phrase needs a little space' })).toBeVisible();
  const before = await page.locator('.session-time').innerText();
  await page.waitForTimeout(1000);
  expect(await page.locator('.session-time').innerText()).toBe(before);
  expect(
    await page
      .locator('.concept-examples')
      .evaluate(
        (el) =>
          !!(
            el.compareDocumentPosition(document.querySelector('.guide-explanation')!) &
            Node.DOCUMENT_POSITION_FOLLOWING
          ),
      ),
  ).toBe(true);
  await page.getByRole('button', { name: /^Hear A:/ }).click();
  await expect(page.getByRole('button', { name: /^Stop A:/ })).toBeVisible();
  await page.getByRole('button', { name: /^Hear B:/ }).click();
  await expect(page.getByRole('button', { name: /^Stop B:/ })).toBeVisible();
  await page.getByText('Check your understanding', { exact: false }).click();
  await page.getByRole('button', { name: 'Stop it until you find another note.' }).click();
  await expect(page.locator('.concept-feedback')).toContainText('Not quite');
  await expect(page.getByRole('button', { name: 'Start practice', exact: true })).toBeEnabled();
  await page.screenshot({ path: testInfo.outputPath('concept-guide.png'), fullPage: true });
  await beginPractice(page);
  await expect(page.getByRole('heading', { name: 'Hear the idea', exact: true })).toBeVisible();
});

test('the learning path links topics to actual available lessons', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Follow the learning path' }).click();
  await expect(page.locator('.path-unit')).toHaveCount(6);
  await expect(page.locator('.mission-card')).toHaveCount(3);
  await page.getByRole('button', { name: /Hear the chord/ }).click();
  await expect(page.locator('.mission-card')).toHaveCount(2);
  await page
    .locator('.mission-card')
    .filter({ hasText: 'Find your way home' })
    .getByRole('button', { name: 'Play this mission' })
    .click();
  await expect(page.getByRole('heading', { name: 'Chord tones are places to land' })).toBeVisible();
  await expect(page.locator('.guide-explanation')).toContainText('C, E, and G');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('concept review pauses practice and transfer hides hints without removing help', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Just 2 minutes' }).click();
  await page.getByRole('button', { name: 'Go straight to playing' }).click();
  await page.waitForTimeout(350);
  await page.getByRole('button', { name: /Review the idea/ }).click();
  await expect(page.getByRole('region', { name: 'Lesson concept' })).toBeVisible();
  await page.getByRole('button', { name: 'Return to practice' }).click();
  for (let i = 0; i < 3; i++)
    await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Use it with less help' })).toBeVisible();
  await expect(page.getByLabel('Note hints are hidden')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Hear the example' })).not.toBeVisible();
  await page.getByText('Need a reminder? Open the example', { exact: true }).click();
  await expect(page.getByRole('button', { name: 'Hear the example' })).toBeVisible();
  await page.getByRole('button', { name: 'Show hints' }).click();
  await expect(page.locator('.note-pill')).toHaveCount(3);
});

test('visible credits acknowledge sources and encourage direct support for authors', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  const opener = page.locator('.site-credits').getByRole('button', { name: 'Credits & sources' });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Credits & sources', exact: true });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole('heading', { name: 'Support the authors. Buy the original books.' }),
  ).toBeVisible();
  await expect(dialog.locator('.teaching-credit')).toHaveCount(4);
  await expect(dialog.locator('.music-credit')).toHaveCount(4);
  await expect(dialog.getByText('Forrest Kinney', { exact: true })).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Explore and buy the books' })).toHaveAttribute(
    'href',
    'https://forrestkinney.com/improvising-1',
  );
  await expect(dialog.getByRole('link', { name: 'Buy from Schott Music' })).toHaveAttribute(
    'href',
    /schott-music.com/,
  );
  await expect(dialog.getByRole('link', { name: 'Buy the book from Hal Leonard' })).toHaveAttribute(
    'href',
    /50449602\/bluegrass-fiddle-and-beyond/,
  );
  await expect(
    dialog.getByRole('link', { name: 'Read and credit the free textbook' }),
  ).toHaveAttribute('href', 'https://viva.pressbooks.pub/openmusictheory/');
  await expect(dialog.getByText(/Interlude earns no commission/)).toBeVisible();
  await expect(
    dialog.getByRole('link', { name: 'Software and bundled-font license notices' }),
  ).toHaveAttribute('href', './THIRD_PARTY_NOTICES.txt');
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('credits.png'), fullPage: true });
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
});

test('reading credits pauses practice without discarding the session or its note', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Just 2 minutes' }).click();
  await beginPractice(page);
  for (let i = 0; i < 4; i++)
    await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await page
    .getByRole('textbox', { name: /One idea to take with you/ })
    .fill('Keep my quiet answer.');
  await page.locator('.site-credits').getByRole('button', { name: 'Credits & sources' }).click();
  await expect(page.locator('.leave-dialog')).not.toBeVisible();
  const timer = await page.locator('.session-time').innerText();
  await page.waitForTimeout(1100);
  expect(await page.locator('.session-time').innerText()).toBe(timer);
  await page.getByRole('button', { name: 'Close credits', exact: true }).click();
  await expect(page.getByRole('textbox', { name: /One idea to take with you/ })).toHaveValue(
    'Keep my quiet answer.',
  );
  await expect(page.getByRole('button', { name: 'Resume session' })).toBeVisible();
});
