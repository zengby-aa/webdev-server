import type { Express } from "express";

export default function QueryParameters(app: Express) {
  app.get("/lab5/calculator", (req, res) => {
    const { a, b, operation } = req.query;
    const first = typeof a === "string" ? parseInt(a, 10) : NaN;
    const second = typeof b === "string" ? parseInt(b, 10) : NaN;
    if (Number.isNaN(first) || Number.isNaN(second)) {
      res.status(400).send("Two integers are required");
      return;
    }

    let result: number;
    switch (operation) {
      case "add":
        result = first + second;
        break;
      case "subtract":
        result = first - second;
        break;
      case "multiply":
        result = first * second;
        break;
      case "divide":
        if (second === 0) {
          res.status(400).send("Cannot divide by zero");
          return;
        }
        result = first / second;
        break;
      default:
        res.status(400).send("Invalid operation");
        return;
    }
    res.send(result.toString());
  });
}
