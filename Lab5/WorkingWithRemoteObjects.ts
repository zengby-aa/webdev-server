const assignment = {
  id: 1,
  title: "NodeJS Assignment",
  description: "Create a NodeJS server with ExpressJS",
  due: "2021-10-10",
  completed: false,
  score: 0,
};
const courseModule = {
  id: "1",
  name: "Introduction to Node.js",
  description: "Learn Express HTTP routes",
  course: "Web Development",
};

export default function WorkingWithRemoteObjects(app) {
  const getAssignment = (req, res) => {
    res.json(assignment);
  };
  const getAssignmentTitle = (_req, res) => {
    res.json(assignment.title);
  };
  const setAssignmentTitle = (req, res) => {
    const { newTitle } = req.params;
    assignment.title = newTitle;
    res.json(assignment);
  };

  app.get("/lab5/assignment/title", getAssignmentTitle);
  app.get("/lab5/assignment/title/:newTitle", setAssignmentTitle);
  app.get("/lab5/assignment", getAssignment);

  app.get("/lab5/assignment/score/:newScore", (req, res) => {
    const score = Number(req.params.newScore);
    if (!req.params.newScore.trim() || !Number.isFinite(score)) {
      res.status(400).send("Score must be a number");
      return;
    }
    assignment.score = score;
    res.json(assignment);
  });
  app.get("/lab5/assignment/completed/:newCompleted", (req, res) => {
    const { newCompleted } = req.params;
    if (newCompleted !== "true" && newCompleted !== "false") {
      res.status(400).send("Completed must be true or false");
      return;
    }
    assignment.completed = newCompleted === "true";
    res.json(assignment);
  });

  app.get("/lab5/module", (_req, res) => {
    res.json(courseModule);
  });
  app.get("/lab5/module/name", (_req, res) => {
    res.json(courseModule.name);
  });
  app.get("/lab5/module/name/:newName", (req, res) => {
    courseModule.name = req.params.newName;
    res.json(courseModule);
  });
  app.get("/lab5/module/description/:newDescription", (req, res) => {
    courseModule.description = req.params.newDescription;
    res.json(courseModule);
  });
}