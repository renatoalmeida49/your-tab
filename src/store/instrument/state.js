const getDefaultState = () => {
  return {
    tuning: ["e", "B", "G", "D", "A", "E"],
    instrument: "guitar",
    tone: "C",
  };
};

const state = getDefaultState();

export default state;
