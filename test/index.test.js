import test from "ava";
import sscan from "../dist/index.js";

/**
 * Simple scan md file. When you have one main topic and only one deep sub topics.
 * Extract topic text and contents of defined main topic (e.g. #).
 * Extract text of topics and contents of one step deeper (i.e. ##).
 *
 * Extract first accountered main topics and
 * its content to first accountered secondary topic.
 *
 * Contents of the secoundary topics are computed between ## headers
 *
 * Not saving content of main Topic yet.
 *
 * When not found return state with empty arrays or undefined values!
 */

const fileContent = [
  "",
  "# topic",
  "Contents of main topic!",
  "## subtopic1",
  "Contents of subtopic topic!",
  "## subtopic2",
  "Terefere",
  "Ququ",
  "Benc",
  "",
  "",
  "## subtopic3",
  "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod.",
  "## subtopic4",
  "## subtopic5",
  ""
];

const fileContentCleared = [
  "# topic",
  "Contents of main topic!",
  "## subtopic1",
  "Contents of subtopic topic!",
  "## subtopic2",
  "Terefere",
  "Ququ",
  "Benc",
  "## subtopic3",
  "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod.",
  "## subtopic4",
  "## subtopic5"
];

test("is function", t => {
  const msg = "should be a function ";
  const actual = typeof sscan === "function";
  const expected = true;
  t.is(actual, expected, msg);
});

test("return promise", async t => {
  const msg = "should return a promise ";
  const actual = typeof await sscan(fileContent).then === "function";
  const expected = true;
  t.is(actual, expected, msg);
});

test("options and input check", async t => {
  const msg1 = "should default mainMdTopicLevel be set on 1";
  const state = await sscan(fileContent);
  const actual1 = state.options.mainMdTopicLevel;
  const expected1 = 1; // default level
  t.is(actual1, expected1, msg1);
  const msg2 = "should be passed an arr of the content of scaning file";
  const actual2 = state.fileContent.length;
  const expected2 = 0;
  t.not(actual2, expected2, msg2);
});

test("throw error not passed fileContent", async t => {
  const msg2 = "should throw an error passed not fileContent in form of arr";
  const error2 = await t.throws(sscan("string"));
  t.is(
    error2.message,
    "qm-md-simpleScan() - passed file content to scan not inf form of arr!",
    msg2
  );
});

test("clear empty lines", async t => {
  const msg = "should clear empty lines in file content";
  const file = await sscan(fileContent);
  const actual = file.fileContent;
  const expected = fileContentCleared;
  t.deepEqual(actual, expected, msg);
});

test("pull main topic", async t => {
  const msg = "should read the content of file and read content of # topic";
  const file = await sscan(fileContent);
  const actual = file.topicMain;
  const expected = "topic";
  t.is(actual, expected, msg);
});

test("pull secondary topics", async t => {
  const msg = "should read the content of file and read content of ## topic";
  const file = await sscan(fileContent);
  const actual = file.topicSecondary;
  const expected = [
    "subtopic1",
    "subtopic2",
    "subtopic3",
    "subtopic4",
    "subtopic5"
  ];
  t.deepEqual(actual, expected, msg);
});

test("read number of lines in a file", async t => {
  const msg = "should read the content of file and get number of lines";
  const file = await sscan(fileContent);
  const actual = file.coordinatesLinesNumber;
  const expected = 11; // 0 idexed
  t.deepEqual(actual, expected, msg);
});

test("calculate secondary topics lines numbers", async t => {
  const msg = "should read the content of file and get line number";
  const file = await sscan(fileContent);
  const actual = file.coordinatesSecondaryTopics;
  const expected = [2, 4, 8, 10, 11];
  t.deepEqual(actual, expected, msg);
});

test("calculate secoundary topics end coordinates", async t => {
  const msg =
    "should read the content of file and copute 2 topic end coordinate";
  const file = await sscan(fileContent);
  const actual = file.coordinatesTopicEnds;
  const expected = [3, 7, 9, 10, 11];
  t.deepEqual(actual, expected, msg);
});

test("store sutopics content", async t => {
  const msg =
    "should read the content of file and extract contents of each subtopic";
  const file = await sscan(fileContent);
  const actual = file.contents.map(arr => arr.slice(0, 1)); // only first item from arr
  const expected = [
    ["## subtopic1"],
    ["## subtopic2"],
    ["## subtopic3"],
    ["## subtopic4"],
    ["## subtopic5"]
  ];
  t.deepEqual(actual, expected, msg);
});
