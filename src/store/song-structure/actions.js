import Tab from "@/components/tab";
import Verse from "@/components/verse";
import TextField from "@/components/text-field";
import string from "@/core/config/string";
import store from "@/store";

const componentList = {
  tab: Tab,
  verse: Verse,
  textField: TextField,
};

function getComponent(component, content = "") {
  switch (component) {
    case "tab":
      return defaultTab(content);
    case "verse":
      return defaultVerse(content);
    case "textField":
      return defaultText(content);
  }
}

function defaultTab() {
  let tab = "";

  store.state.instrument.tuning.map((tune) => {
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

const actions = {
  addContent(context, payload) {
    context.commit("addContent", {
      type: payload,
      component: componentList[payload],
      info: getComponent(payload),
    });
  },

  removeContent(context, payload) {
    context.commit("removeContent", payload);
  },

  addTextFiled(context, payload) {
    context.commit("addTextField", payload);
  },

  focusTextFieldIndex(context, payload) {
    context.commit("focusTextFieldIndex", payload);
  },

  addContentBetweenParts(context, payload) {
    context.commit("addContentBetweenParts", {
      component: {
        type: payload.component,
        component: componentList[payload.component],
        info: getComponent(payload.component, payload.content),
      },
      index: payload.index,
    });
  },
};

export default actions;
