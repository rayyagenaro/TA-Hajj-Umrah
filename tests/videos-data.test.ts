import test from "node:test";
import assert from "node:assert/strict";
import { videoResources } from "../src/data/videos";

test("video resources contain normalized YouTube IDs and strict dates", () => {
  assert.ok(videoResources.length > 0);

  for (const video of videoResources) {
    assert.match(video.youtubeId, /^[A-Za-z0-9_-]{11}$/);
    assert.match(video.publishedAt, /^\d{4}-\d{2}-\d{2}$/);

    const url = new URL(video.youtubeUrl);
    const host = url.hostname.replace(/^www\./, "");
    assert.ok(host === "youtube.com" || host === "youtu.be");
  }
});

test("second video date is normalized to 2-digit month/day", () => {
  const second = videoResources.find((v) => v.id === "video-2");
  assert.ok(second);
  assert.equal(second?.publishedAt, "2018-02-03");
});
