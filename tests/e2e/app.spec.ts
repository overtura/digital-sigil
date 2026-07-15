import { expect, test, type Page } from "@playwright/test";

async function generate(page: Page, value = "고요한 용기") {
  await page.goto("/");
  await page.getByLabel("단어 또는 짧은 문구").fill(value);
  await page.getByRole("button", { name: "문양 생성" }).click();
  await expect(page.getByTestId("sigil-svg")).toBeVisible();
}

test("example input generates a deterministic SVG", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "고요한 용기" }).click();
  await expect(page.getByLabel("단어 또는 짧은 문구")).toHaveValue("고요한 용기");
  await page.getByRole("button", { name: "문양 생성" }).click();
  await expect(page.getByRole("heading", { name: /형상/ })).toBeVisible();
  await expect(page.getByTestId("sigil-svg")).toBeVisible();
});

test("variation and pause controls update the plate", async ({ page }) => {
  await generate(page);
  await page.getByRole("button", { name: "움직임 멈춤" }).click();
  await expect(page.getByTestId("sigil-svg")).toHaveClass(/sigil--paused/);
  await page.getByRole("button", { name: "다른 변형" }).click();
  await expect(page.getByText("PLATE 02")).toBeVisible();
});

test("downloads SVG and both PNG modes", async ({ page }) => {
  await generate(page, "create freely");
  const svgDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "SVG", exact: true }).click();
  expect((await svgDownload).suggestedFilename()).toMatch(/\.svg$/);

  for (const name of ["투명 PNG", "포스터 PNG"]) {
    const pngDownload = page.waitForEvent("download");
    await page.getByRole("button", { name }).click();
    expect((await pngDownload).suggestedFilename()).toMatch(/\.png$/);
  }
});

test("surfaces a local model error", async ({ page }) => {
  await page.goto("/?embedding=error");
  await page.getByLabel("단어 또는 짧은 문구").fill("error path");
  await page.getByRole("button", { name: "문양 생성" }).click();
  await expect(page.getByRole("alert")).toContainText("테스트용 로컬 모델 오류");
});

test("fits a 320 pixel viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await generate(page, "새로운 길");
  const overflows = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflows).toBe(false);
});

test("honors reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await generate(page, "별빛의 기억");
  const duration = await page.locator(".sigil__orbit").evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).animationDuration),
  );
  expect(duration).toBeLessThanOrEqual(0.001);
});
