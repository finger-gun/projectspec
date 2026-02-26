import gradient from "gradient-string";

export async function renderLogo(): Promise<void> {
  renderTextBanner();
}

function renderTextBanner(): void {
  const banner = [
    "▄▖     ▘    ▗   ▄▖        ",
    "▙▌▛▘▛▌ ▌█▌▛▘▜▘  ▚ ▛▌█▌▛▘▛▘",
    "▌ ▌ ▙▌ ▌▙▖▙▖▐▖  ▄▌▙▌▙▖▙▖▄▌",
    "      ▙▌          ▌  ",
  ];

  const colored = gradient(["#6f42c1", "#9b6bff"])(banner.join("\n"));
  process.stdout.write("\n" + colored + "\n\n");
}
