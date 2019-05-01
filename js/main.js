const insertOptionIntoDOM = val => {
  const dataListElm = document.getElementById("datalist-movie-title");
  const optionElm = document.createElement("option");
  optionElm.setAttribute("value", val);
  dataListElm.appendChild(optionElm);
};

const getOmdbMovieItem = async (title = "blade+runner") => {
  const url = "http://www.omdbapi.com/";
  const movie = `${url}?t=${title}&apikey=75a48d0e`;
  const response = await fetch(movie);
  return await response.json();
};

const olSearchHistoryElm = document.getElementById("ol-search-history");

const deleteElement = id => {
  const elm = document.getElementById(id);
  elm.parentNode.removeChild(elm);
};

const deleteAllChildElements = parentElm => {
  while (parentElm.firstChild) {
    parentElm.removeChild(parentElm.firstChild);
  }
};

const toDateFormat = (timestamp = 1556716391503) => {
  const date = new Date(timestamp);
  return date
    .toLocaleDateString("en-GB", {
      hour: "numeric",
      minute: "numeric",
      hour12: true
    })
    .replace(/\//g, "-")
    .replace("am", "AM")
    .replace("pm", "PM");
};

const insertResultIntoDOM = (searchStr, { Title: title, Error: error }) => {
  const timestamp = Date.now();
  const liElm = document.createElement("li");
  liElm.setAttribute("id", timestamp);
  const articleElm = document.createElement("article");
  const btnElm = document.createElement("button");
  btnElm.innerHTML = "Delete";
  const headingElm = document.createElement("h1");
  const txt = title ? title : `No result for:"${searchStr}": ${error}`;
  const pElm = document.createElement("p");
  pElm.innerHTML = `${toDateFormat(timestamp)}`;
  btnElm.addEventListener("click", () => deleteElement(timestamp));
  headingElm.innerHTML += txt;
  liElm.appendChild(articleElm);
  articleElm.appendChild(headingElm);
  articleElm.appendChild(pElm);
  articleElm.appendChild(btnElm);
  olSearchHistoryElm.appendChild(liElm);
};

const startTimer = (fkn, args, delay) => {
  const id = setTimeout(() => {
    fkn(args);
  }, delay);
  return id;
};

/* delete previous started timer and create new
if the time is reached it will execute
but if new input is done, the execution waits
until no more input arrives.*/
const restartTimerAndInvoke = (fkn, data, stateTimerId, winClearTimeout) => {
  const delayTime = 500;
  if (stateTimerId) {
    // window.clearTimeout(stateTimerId);
    winClearTimeout(stateTimerId);
  }
  const tId = startTimer(fkn, data, delayTime);
  stateTimerId = tId;
  return tId;
};

const isString = t => {
  return t && typeof t === "string";
};

const confirmString = t => (isString(t) ? t : "");

const limitLength = (str, max = 0) => {
  return str.substring(0, max);
};

const removeNotValid = str => {
  const notSwedishAlphabetNumbersSpaceApostrophe = new RegExp(
    /[^a-zåäöA-ZÅÄÖ0-9\s'-]/g
  );
  return str.replace(notSwedishAlphabetNumbersSpaceApostrophe, "");
};

const doApiSearch = async (str, requestApiFkn, onSuccess) => {
  const searchStr = str.toLowerCase().replace(/\s/g, "+");
  if (searchStr.length > 0) {
    const response = await requestApiFkn(searchStr);
    console.log("doApiSearch:", response);
    onSuccess(str, response);
    return response;
  } else {
    return;
  }
};

const runIfNotPresent = (arr, str, fkn) => {
    if (str && str.length > 0 && !arr.includes(str)) {
        fkn(str);
        return [...arr, str];
    } else {
        return arr;
    }
};


let stateTimerId;
let searchHistory = [];
const inputMovieTitleElm = document.getElementById("input-movie-title");
inputMovieTitleElm.addEventListener("input", e => {
  const cleanStr = limitLength(
    removeNotValid(confirmString(e.target.value)),
    255
  );
  const searchAndAddToHistory = async str => {
    const response = await doApiSearch(
      str,
      getOmdbMovieItem,
      insertResultIntoDOM
    );
    const title = response && response.Title;
    searchHistory = runIfNotPresent(searchHistory, title, insertOptionIntoDOM);
    console.log(searchHistory);
  };
  stateTimerId = restartTimerAndInvoke(
    searchAndAddToHistory,
    cleanStr,
    stateTimerId,
    window.clearTimeout
  );
});
inputMovieTitleElm.form.addEventListener("submit", e => e.preventDefault());

document
  .getElementById("button-clear-history")
  .addEventListener("click", () => deleteAllChildElements(olSearchHistoryElm));
