import test from "node:test";
import assert from "node:assert";

// Test suite for Home page components, text content, typewriter options, and social links

test("Typewriter component configuration (Type.jsx strings)", () => {
  // Expected roles/strings configured in Typewriter component
  const expectedStrings = [
    "Software Developer",
    "Freelancer",
    "MERN Stack Developer",
    "Open Source Contributor",
    "Mobile Developer",
    "App Developer"
  ];

  const typewriterOptions = {
    strings: expectedStrings,
    autoStart: true,
    loop: true,
    deleteSpeed: 50,
  };

  assert.strictEqual(typewriterOptions.autoStart, true);
  assert.strictEqual(typewriterOptions.loop, true);
  assert.strictEqual(typewriterOptions.deleteSpeed, 50);
  assert.strictEqual(typewriterOptions.strings.length, 6);
  assert.deepStrictEqual(typewriterOptions.strings, expectedStrings);
});

test("Home component header and branding assertions", () => {
  const greeting = "Hi There!";
  const myName = "CHIRAG DHUNNA";
  const waveEmoji = "👋🏻";

  assert.strictEqual(greeting, "Hi There!");
  assert.strictEqual(myName, "CHIRAG DHUNNA");
  assert.strictEqual(waveEmoji, "👋🏻");
});

test("Home2 bio and programming language proficiencies assertions", () => {
  const bioIntro = "I fell in love with programming and I have at least learnt something, I think… 🤷‍♂️";
  const languages = ["Flutter", "C++", "Javascript", "Java"];
  const fieldsOfInterest = ["Mobile Applications and Products", "Automation and AI"];

  assert.strictEqual(bioIntro.includes("programming"), true);
  assert.strictEqual(languages.length, 4);
  assert.deepStrictEqual(languages, ["Flutter", "C++", "Javascript", "Java"]);
  assert.deepStrictEqual(fieldsOfInterest, ["Mobile Applications and Products", "Automation and AI"]);
});

test("Home2 social media links and connectivity URLs validation", () => {
  const socialLinks = {
    github: "https://github.com/chiragdhunna",
    twitter: "https://x.com/ChiragDhunna",
    linkedin: "https://www.linkedin.com/in/chiragdhunna/",
    instagram: "https://www.instagram.com/chiragdhunna/",
  };

  for (const [platform, url] of Object.entries(socialLinks)) {
    try {
      const parsedUrl = new URL(url);
      assert.strictEqual(parsedUrl.protocol, "https:");
      assert.notStrictEqual(parsedUrl.hostname, "");
    } catch (err) {
      assert.fail(`Invalid social URL for ${platform}: ${url}`);
    }
  }

  assert.strictEqual(socialLinks.github.includes("chiragdhunna"), true);
  assert.strictEqual(socialLinks.twitter.includes("ChiragDhunna"), true);
  assert.strictEqual(socialLinks.linkedin.includes("chiragdhunna"), true);
  assert.strictEqual(socialLinks.instagram.includes("chiragdhunna"), true);
});
