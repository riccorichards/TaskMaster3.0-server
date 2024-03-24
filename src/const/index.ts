export const botInteraction = [
  "help$",
  "Matthew's roles$",
  "new$ where [Matthew's role] add [new info]",
  "remove$ where id = [info id] and [Matthew's role]",
  "get$ info * from [Matthew's role]",
  "start$",
  "finish$",
];

export const help = [
  {
    id: 2,
    command: "new: [new info]",
    describe: "Adds new information to your Matthew's memory.",
  },
  {
    id: 6,
    command: "question",
    describe: "Returns ramdomly selected question.",
  },
  {
    id: 8,
    command: "finish",
    describe:
      "Concludes interview mode after assessing your knowledge and clean the chat.",
  },
];
