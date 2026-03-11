beforeAll(async () => {
  await page.setViewport({ width: 1920, height: 1080 });
});

afterAll(async () => {
  await browser.close();
});
