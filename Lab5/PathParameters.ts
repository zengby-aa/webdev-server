export default function PathParameters(app) {
  const add = (req, res) => {
    const { a, b } = req.params;
    const sum = parseInt(a) + parseInt(b);
    res.send(sum.toString());
  };
  const subtract = (req, res) => {
    const { a, b } = req.params;
    res.send((parseInt(a) - parseInt(b)).toString());
  };
  app.get("/lab5/add/:a/:b", add);
  app.get("/lab5/subtract/:a/:b", subtract);
  app.get("/lab5/multiply/:a/:b", (req, res) => {
    const { a, b } = req.params;
    res.send((parseInt(a, 10) * parseInt(b, 10)).toString());
  });

  app.get("/lab5/divide/:a/:b", (req, res) => {
    const { a, b } = req.params;
    const divisor = parseInt(b, 10);
    if (divisor === 0) {
      res.status(400).send("Cannot divide by zero");
      return;
    }
    res.send((parseInt(a, 10) / divisor).toString());
  });
}