/**
 * Print Impressum lines with their characters shuffled in the markup. Each
 * character carries its true position as a CSS `order`, so `.impressum-line`
 * shows the line normally while the HTML, and anything copied from the page,
 * stays scrambled. Paste the output into the <address> in index.html.
 *
 *   node scripts/scramble-impressum.mjs "Name" "Street 1" "12345 City"
 */
const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };
for (const line of process.argv.slice(2)) {
  const chars = [...line].map((char, order) => ({ char, order }));
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  console.log(`<p class="impressum-line">${chars.map(({ char, order }) => `<span style="order:${order}">${entities[char] || char}</span>`).join("")}</p>`);
}
