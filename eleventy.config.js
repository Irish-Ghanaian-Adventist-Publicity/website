export default function (eleventyConfig) {
  // ---------------------------------------------------------------------------
  // Static files copied straight through to the built site
  // ---------------------------------------------------------------------------
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ admin: "admin" });
  eleventyConfig.addPassthroughCopy({ "src/static": "." });

  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addWatchTarget("admin/");

  // ---------------------------------------------------------------------------
  // Filters
  // ---------------------------------------------------------------------------

  // "12 September 2026"
  eleventyConfig.addFilter("longDate", (value) => {
    if (!value) return "";
    return new Intl.DateTimeFormat("en-IE", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(toDate(value));
  });

  // "Sat 12 Sep"
  eleventyConfig.addFilter("shortDate", (value) => {
    if (!value) return "";
    return new Intl.DateTimeFormat("en-IE", {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(toDate(value));
  });

  // "SEP" / "12" for the little calendar tiles
  eleventyConfig.addFilter("monthAbbr", (value) =>
    value
      ? new Intl.DateTimeFormat("en-IE", { month: "short", timeZone: "UTC" })
          .format(toDate(value))
          .toUpperCase()
      : ""
  );
  eleventyConfig.addFilter("dayNum", (value) =>
    value
      ? new Intl.DateTimeFormat("en-IE", { day: "numeric", timeZone: "UTC" }).format(toDate(value))
      : ""
  );

  // 2026-09-12 — for <time datetime="…">
  eleventyConfig.addFilter("isoDate", (value) =>
    value ? toDate(value).toISOString().slice(0, 10) : ""
  );

  eleventyConfig.addFilter("limit", (arr, n) => (Array.isArray(arr) ? arr.slice(0, n) : []));

  // Strip markdown/HTML down to a plain-text teaser.
  eleventyConfig.addFilter("excerpt", (content, length = 180) => {
    if (!content) return "";
    const text = String(content)
      .replace(/<[^>]*>/g, " ")
      .replace(/[#*_`>[\]()]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return text.length <= length ? text : text.slice(0, text.lastIndexOf(" ", length)) + "…";
  });

  eleventyConfig.addFilter("year", () => new Date().getFullYear());

  // ---------------------------------------------------------------------------
  // Collections
  // ---------------------------------------------------------------------------
  const startOfToday = () => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d;
  };

  eleventyConfig.addCollection("upcomingEvents", (api) =>
    api
      .getFilteredByTag("events")
      .filter((item) => toDate(item.data.event_date) >= startOfToday())
      .sort((a, b) => toDate(a.data.event_date) - toDate(b.data.event_date))
  );

  eleventyConfig.addCollection("pastEvents", (api) =>
    api
      .getFilteredByTag("events")
      .filter((item) => toDate(item.data.event_date) < startOfToday())
      .sort((a, b) => toDate(b.data.event_date) - toDate(a.data.event_date))
  );

  eleventyConfig.addCollection("newsPosts", (api) =>
    api.getFilteredByTag("news").sort((a, b) => toDate(b.data.date) - toDate(a.data.date))
  );

  eleventyConfig.addCollection("teamMembers", (api) =>
    api
      .getFilteredByTag("team")
      .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99))
  );

  // ---------------------------------------------------------------------------
  // Path prefix safety net
  // ---------------------------------------------------------------------------
  // Templates run links through the `url` filter, but images an editor drops into
  // the body of an article come out of the CMS as plain "/assets/uploads/…".
  // On a project page (served from /website/) those would 404, so patch any
  // root-relative link the filter never saw.
  const prefix = process.env.PATH_PREFIX || "/";
  if (prefix !== "/") {
    const normalised = "/" + prefix.replace(/^\/|\/$/g, "") + "/";
    eleventyConfig.addTransform("pathPrefixFallback", function (content) {
      if (!(this.page.outputPath || "").endsWith(".html")) return content;
      return content.replace(
        /(\s(?:href|src)=")(\/(?!\/)[^"]*)"/g,
        (match, attr, path) =>
          path.startsWith(normalised) ? match : `${attr}${normalised}${path.slice(1)}"`
      );
    });
  }

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    // Set PATH_PREFIX="/repo-name/" when publishing to a GitHub project page.
    pathPrefix: process.env.PATH_PREFIX || "/",
  };
}

/** Decap writes dates as ISO strings; Eleventy front matter may already parse them. */
function toDate(value) {
  if (value instanceof Date) return value;
  if (!value) return new Date(0);
  const d = new Date(value);
  return isNaN(d) ? new Date(0) : d;
}
