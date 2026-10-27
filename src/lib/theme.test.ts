async function freshThemeModule() {
  vi.resetModules();
  return import("./theme");
}

describe("theme", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("follows the device when nothing is saved", async () => {
    const { currentTheme } = await freshThemeModule();
    expect(currentTheme()).toBe("system");
  });

  it("reads a saved choice", async () => {
    localStorage.setItem("capsense-theme", "dark");
    const { currentTheme } = await freshThemeModule();
    expect(currentTheme()).toBe("dark");
  });

  it("treats an unknown saved value as System", async () => {
    localStorage.setItem("capsense-theme", "purple");
    const { currentTheme } = await freshThemeModule();
    expect(currentTheme()).toBe("system");
  });

  it("treats storage that can't be read as System, without an error", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { currentTheme } = await freshThemeModule();
    expect(currentTheme()).toBe("system");
  });

  it("applies, saves and announces a choice; System removes the forced theme", async () => {
    const { chooseTheme, subscribeToTheme } = await freshThemeModule();
    const listener = vi.fn();
    subscribeToTheme(listener);

    chooseTheme("light");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(localStorage.getItem("capsense-theme")).toBe("light");
    expect(listener).toHaveBeenCalledTimes(1);

    chooseTheme("system");
    expect(document.documentElement).not.toHaveAttribute("data-theme");
  });

  it("still applies the choice when it can't be saved", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("full");
    });
    const { chooseTheme, currentTheme } = await freshThemeModule();
    expect(() => chooseTheme("dark")).not.toThrow();
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(currentTheme()).toBe("dark");
  });

  describe("the script that runs before the page paints", () => {
    async function runScript() {
      const { APPLY_SAVED_THEME_SCRIPT } = await freshThemeModule();
      new Function(APPLY_SAVED_THEME_SCRIPT)();
    }

    it.each(["light", "dark"])("applies a saved %s theme", async (theme) => {
      localStorage.setItem("capsense-theme", theme);
      await runScript();
      expect(document.documentElement).toHaveAttribute("data-theme", theme);
    });

    it.each(["system", "purple"])("leaves the device setting in charge for %s", async (saved) => {
      localStorage.setItem("capsense-theme", saved);
      await runScript();
      expect(document.documentElement).not.toHaveAttribute("data-theme");
    });

    it("does nothing, quietly, when storage can't be read", async () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("blocked");
      });
      await expect(runScript()).resolves.toBeUndefined();
      expect(document.documentElement).not.toHaveAttribute("data-theme");
    });
  });
});
