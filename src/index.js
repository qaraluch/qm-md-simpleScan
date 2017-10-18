import { mdHeaderCreate, mdHeaderGetTxt, ifMdHeader } from "qm-rgx-mdheader";
import { curry, compose, pipe, tap, trace, map, filter, reduce } from "qm-fp";

export default function simpleScan(fileContent, options) {
  const defaultOptions = {
    mainMdTopicLevel: 1
  };
  const allOptions = Object.assign({}, defaultOptions, options);
  const state = Object.assign({}, { fileContent, options: allOptions });
  return Promise.resolve(state)
    .then(checkPassedFileContent)
    .then(clearEmptyLines)
    .then(getMainTopic)
    .then(getSecondaryTopics)
    .then(getNumberOfLines)
    .then(getTopicsCoordinates)
    .then(getTopicContentCoordinates)
    .then(extractsContents);
}
function checkPassedFileContent(s) {
  Array.isArray(s.fileContent) || throwWhenfileContentNotArr();
  return s;
}

const throwWhenfileContentNotArr = () => {
  throw new Error(
    "qm-md-simpleScan() - passed file content to scan not inf form of arr!"
  );
};

function clearEmptyLines(s) {
  const clearedFileContent = s.fileContent.filter(l => l !== "");
  const ns = Object.assign(s, { fileContent: clearedFileContent });
  return ns;
}

function getMainTopic(s) {
  const rgxMainTopic = mdHeaderCreate(s.options.mainMdTopicLevel);
  const filterMainTopic = ifMdHeader(rgxMainTopic); // curried already
  const stripTxtFromTopic = mdHeaderGetTxt(rgxMainTopic); // curried already
  // const traceAs = trace();
  const getMainTopic = pipe(filter(filterMainTopic), map(stripTxtFromTopic));
  const contents = [...s.fileContent]; // clone array
  const [first1MdTopicTxt] = getMainTopic(contents);
  const ns = Object.assign(s, { topicMain: first1MdTopicTxt });
  return ns;
}

function getSecondaryTopics(s) {
  const rgxSecondaryTopic = mdHeaderCreate(s.options.mainMdTopicLevel + 1); // level deeper
  const filterSecondaryTopic = ifMdHeader(rgxSecondaryTopic); // curried already
  const stripTxtFromTopic = mdHeaderGetTxt(rgxSecondaryTopic); // curried already
  // const traceAs = trace();
  const getAllSecondaryTopics = pipe(
    filter(filterSecondaryTopic),
    map(stripTxtFromTopic)
  );
  const contents = [...s.fileContent]; // clone array
  const result = getAllSecondaryTopics(contents);
  const ns = Object.assign(s, { topicSecondary: result });
  return ns;
}

function getNumberOfLines(s) {
  const ns = Object.assign(s, {
    coordinatesLinesNumber: s.fileContent.length - 1
  }); // 0 idexed
  return ns;
}

function getTopicsCoordinates(s) {
  const rgxSecondaryTopic = mdHeaderCreate(s.options.mainMdTopicLevel + 1); // level deeper
  const isIt2topic = ifMdHeader(rgxSecondaryTopic); // curried already
  const compute2MdCoords = (txt, index) => isIt2topic(txt) && index;
  const removeFalses = line => line !== false;
  const getSecoundTopicCoords = pipe(
    map(compute2MdCoords),
    filter(removeFalses)
  );
  const contents = [...s.fileContent]; // clone array
  const allSecoundTopicCoords = getSecoundTopicCoords(contents);
  const ns = Object.assign(s, {
    coordinatesSecondaryTopics: allSecoundTopicCoords
  });
  return ns;
}

function getTopicContentCoordinates(s) {
  const topics = s.coordinatesSecondaryTopics;
  const endFile = s.coordinatesLinesNumber;
  const ends = [];
  const computeCoords = (topic, i, arr) => {
    const computeEnd = () => {
      const isItLastTopic = i === arr.length - 1;
      return isItLastTopic ? endFile : arr[i + 1] - 1; // line before next subtopic
    };
    ends.push(computeEnd());
  };
  topics.map(computeCoords);
  const ns = Object.assign(s, { coordinatesTopicEnds: ends });
  return ns;
}

function extractsContents(s) {
  const file = [...s.fileContent]; // clone array
  const starts = s.coordinatesSecondaryTopics;
  const ends = s.coordinatesTopicEnds;
  const cutContents = (c, i) => {
    return file.slice(c, ends[i] + 1);
  };

  const extract = pipe(map(cutContents));
  const ns = Object.assign(s, { contents: extract(starts) });
  return ns;
}
