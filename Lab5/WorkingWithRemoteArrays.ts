import type { Express, Request, Response } from "express";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
  description?: string;
};

let todos: Todo[] = [
  { id: 1, title: "Task 1", completed: false },
  { id: 2, title: "Task 2", completed: true },
  { id: 3, title: "Task 3", completed: false },
  { id: 4, title: "Task 4", completed: true },
];

let lastTodoId = 4;

export default function WorkingWithRemoteArrays(app: Express) {
  const getTodos = (req: Request, res: Response) => {
    const { completed } = req.query;
    if (completed === undefined) {
      res.json(todos);
      return;
    }
    if (completed !== "true" && completed !== "false") {
      res.status(400).json({ error: "Completed must be true or false" });
      return;
    }
    res.json(todos.filter((todo) => todo.completed === (completed === "true")));
  };

  const getTodoById = (req: Request<{ id: string }>, res: Response) => {
    const todo = todos.find((item) => item.id === Number(req.params.id));
    if (!todo) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }
    res.json(todo);
  };

  const createNewTodo = (_req: Request, res: Response) => {
    lastTodoId = Math.max(Date.now(), lastTodoId + 1);
    todos.push({ id: lastTodoId, title: "New Task", completed: false });
    res.json(todos);
  };

  const removeTodo = (req: Request<{ id: string }>, res: Response) => {
    const index = todos.findIndex((item) => item.id === Number(req.params.id));
    if (index === -1) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }
    todos.splice(index, 1);
    res.json(todos);
  };

  const updateTodoTitle = (req: Request<{ id: string; title: string }>, res: Response) => {
    const { id, title } = req.params;
    const todo = todos.find((item) => item.id === Number(id));
    if (!todo) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }
    todo.title = title;
    res.json(todos);
  };

  const updateTodoCompleted = (
    req: Request<{ id: string; completed: string }>,
    res: Response,
  ) => {
    const { id, completed } = req.params;
    if (completed !== "true" && completed !== "false") {
      res.status(400).json({ error: "Completed must be true or false" });
      return;
    }
    const todo = todos.find((item) => item.id === Number(id));
    if (!todo) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }
    todo.completed = completed === "true";
    res.json(todos);
  };

  const updateTodoDescription = (
    req: Request<{ id: string; description: string }>,
    res: Response,
  ) => {
    const { id, description } = req.params;
    const todo = todos.find((item) => item.id === Number(id));
    if (!todo) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }
    todo.description = description;
    res.json(todos);
  };

  const postNewTodo = (req: Request, res: Response) => {
    if (typeof req.body?.title !== "string" || typeof req.body?.completed !== "boolean") {
      res.status(400).json({ error: "A title and completed status are required" });
      return;
    }
    lastTodoId = Math.max(new Date().getTime(), lastTodoId + 1);
    const newTodo = { ...req.body, id: lastTodoId };
    todos.push(newTodo);
    res.json(newTodo);
  };

  const deleteTodo = (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const todoIndex = todos.findIndex((t) => t.id === Number(id));
    if (todoIndex === -1) {
      res.status(404).json({ message: `Unable to delete Todo with ID ${id}` });
      return;
    }
    todos.splice(todoIndex, 1);
    res.sendStatus(200);
  };

  const updateTodo = (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const todoId = Number(id);
    const updates = req.body;
    if (!updates || Array.isArray(updates) ||
      (updates.title !== undefined && typeof updates.title !== "string") ||
      (updates.completed !== undefined && typeof updates.completed !== "boolean") ||
      (updates.description !== undefined && typeof updates.description !== "string")) {
      res.status(400).json({ error: "Invalid todo update" });
      return;
    }
    if (!todos.some((t) => t.id === todoId)) {
      res.status(404).json({ message: `Unable to update Todo with ID ${id}` });
      return;
    }
    todos = todos.map((t) => {
      if (t.id === todoId) {
        return { ...t, ...updates, id: t.id };
      }
      return t;
    });
    res.sendStatus(200);
  };


  app.get("/lab5/todos", getTodos);
  app.get("/lab5/todos/create", createNewTodo);
  app.post("/lab5/todos", postNewTodo);
  app.delete("/lab5/todos/:id", deleteTodo);
  app.put("/lab5/todos/:id", updateTodo);
  app.get("/lab5/todos/:id", getTodoById);
  app.get("/lab5/todos/:id/delete", removeTodo);
  app.get("/lab5/todos/:id/title/:title", updateTodoTitle);
  app.get("/lab5/todos/:id/completed/:completed", updateTodoCompleted);
  app.get("/lab5/todos/:id/description/:description", updateTodoDescription);
}
