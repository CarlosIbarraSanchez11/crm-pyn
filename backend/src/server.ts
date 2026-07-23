import app from "./app";
import { iniciarCron } from "./modules/rrhh/cron.service";

app.listen(3000, () => {

  console.log("Servidor en puerto 3000");

  iniciarCron();

});