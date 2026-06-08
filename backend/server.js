const app     = require("./src/app");
const { PORT } = process.env;

const port = PORT || 3333;

app.listen(port, () => {
  console.log(`🚀 VenueFlow API rodando na porta ${port}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`🔗 http://localhost:${port}`);
});