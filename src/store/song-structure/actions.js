import string from "@/core/config/string";

let lastId = 0;

function createId() {
  lastId++;

  return `${Date.now().toString(36)}${lastId}`;
}

function getInfo(type, content = "", tuning) {
  switch (type) {
    case "tab":
      return defaultTab(tuning);
    case "verse":
      return defaultVerse(content);
    case "textField":
      return defaultText(content);
  }
}

function defaultTab(tuning) {
  let tab = "";

  tuning.map((tune) => {
    tab += `${tune}|${string()}\n`;
  });

  return {
    text: tab,
  };
}

function defaultVerse(content) {
  return {
    chords: content,
  };
}

function defaultText(content) {
  return {
    text: content,
  };
}

function createPart(context, type, content) {
  const part = {
    id: createId(),
    type,
    info: getInfo(type, content, context.rootState.instrument.tuning),
  };

  if (type == "textField") context.commit("setFocusId", part.id);

  return part;
}

const actions = {
  addContent(context, payload) {
    context.commit("addContent", createPart(context, payload));
  },

  removeContent(context, payload) {
    context.commit("removeContent", payload);
  },

  setSong(context, payload) {
    context.commit("setSong", payload);
  },

  addContentBetweenParts(context, payload) {
    context.commit("addContentBetweenParts", {
      part: createPart(context, payload.component, payload.content),
      index: payload.index,
    });
  },
};

export default actions;
